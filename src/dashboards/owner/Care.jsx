import React, { useState, useEffect } from "react";
import { Leaf, BookOpen, HelpCircle, Play, Search } from "lucide-react";
import api from "../../services/api";

export default function Care() {
  const [articles, setArticles] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [tab, setTab] = useState("articles");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/care/articles.php'), api.get('/care/faqs.php')]).then(([a, f]) => {
      if (a.success) setArticles(a.data || []);
      if (f.success) setFaqs(f.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="dash-loading"><div className="spinner"/><p>Loading care center...</p></div>;

  const filteredArticles = articles.filter(a => a.title?.toLowerCase().includes(search.toLowerCase()) || a.category?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-care">
      <div className="page-head"><h1>Care Center</h1></div>
      <div className="search-input"><Search size={16}/><input placeholder="Search articles and FAQs..." value={search} onChange={e => setSearch(e.target.value)}/></div>
      <div className="filter-tabs">
        <button className={tab === "articles" ? "active" : ""} onClick={() => setTab("articles")}><BookOpen size={14}/> Articles</button>
        <button className={tab === "faqs" ? "active" : ""} onClick={() => setTab("faqs")}><HelpCircle size={14}/> FAQs</button>
      </div>
      {tab === "articles" ? (
        filteredArticles.length === 0 ? <div className="empty-state big"><Leaf size={48}/><h3>No articles found</h3></div> : (
          <div className="articles-grid">{filteredArticles.map(a => (
            <div key={a.id} className="article-card">
              {a.image && <div className="article-img"><img src={`/uploads/${a.image}`} alt={a.title}/></div>}
              <div className="article-body">
                <span className="article-cat">{a.category}</span>
                <h3>{a.title}</h3>
                <p>{a.content?.slice(0, 150)}...</p>
                <small>{a.created_at}</small>
              </div>
            </div>
          ))}</div>
        )
      ) : (
        <div className="faq-list">{faqs.map(f => (
          <details key={f.id} className="faq-item"><summary>{f.question}</summary><p>{f.answer}</p></details>
        ))}</div>
      )}
    </div>
  );
}
