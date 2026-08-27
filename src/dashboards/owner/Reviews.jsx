import React, { useState, useEffect } from "react";
import { Star, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { useToast } from "../../components/Toast";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [vets, setVets] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ target_type: "vet", target_id: "", rating: 5, comment: "" });
  const toast = useToast();

  const fetch = () => {
    Promise.all([api.get('/reviews/my_reviews.php'), api.get('/vets/list.php'), api.get('/products/list.php')]).then(([r, v, p]) => {
      if (r.success) setReviews(r.data || []);
      if (v.success) setVets(v.data || []);
      if (p.success) setProducts(p.data || []);
      setLoading(false);
    });
  };
  useEffect(() => { fetch(); }, []);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const targets = form.target_type === "vet" ? vets : products;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await api.post('/reviews/create.php', form);
    if (res.success) { toast.success("Review submitted!"); setModal(false); setForm({ target_type: "vet", target_id: "", rating: 5, comment: "" }); fetch(); }
    else toast.error(res.message);
  };

  if (loading) return <div className="dash-loading"><div className="spinner"/><p>Loading reviews...</p></div>;

  return (
    <div className="page-reviews">
      <div className="page-head"><h1>Reviews</h1><button className="btn-primary" onClick={() => setModal(true)}><Star size={16}/> Write Review</button></div>
      {reviews.length === 0 ? (
        <div className="empty-state big"><Star size={48}/><h3>No reviews yet</h3><p>Rate a veterinarian or product you've used.</p></div>
      ) : (
        <div className="reviews-list">{reviews.map(r => (
          <div key={r.id} className="review-card">
            <div className="review-top"><strong>{r.target_name}</strong><div className="stars">{Array.from({length:5}, (_,i) => <Star key={i} size={14} fill={i < r.rating ? "currentColor" : "none"}/>)}</div></div>
            <p>{r.comment}</p><small>{r.created_at}</small>
          </div>
        ))}</div>
      )}
      <AnimatePresence>
        {modal && (
          <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setModal(false)}>
            <motion.div className="modal" initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} onClick={e=>e.stopPropagation()}>
              <div className="modal-head"><h2>Write a Review</h2><button onClick={() => setModal(false)}><X size={20}/></button></div>
              <form onSubmit={handleSubmit}>
                <label>Review Type<select value={form.target_type} onChange={set("target_type")}><option value="vet">Veterinarian</option><option value="product">Product</option></select></label>
                <label>Select<select value={form.target_id} onChange={set("target_id")} required><option value="">Choose...</option>{targets.map(t => <option key={t.id} value={t.id}>{form.target_type === "vet" ? t.full_name : t.name}</option>)}</select></label>
                <label>Rating<div className="star-picker">{[1,2,3,4,5].map(n => <button key={n} type="button" onClick={() => setForm(p=>({...p,rating:n}))}><Star size={24} fill={n <= form.rating ? "currentColor" : "none"}/></button>)}</div></label>
                <label>Comment<textarea value={form.comment} onChange={set("comment")} rows={4} placeholder="Share your experience..."/></label>
                <div className="modal-actions"><button type="button" className="btn-ghost" onClick={() => setModal(false)}>Cancel</button><button type="submit" className="btn-primary">Submit Review</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
