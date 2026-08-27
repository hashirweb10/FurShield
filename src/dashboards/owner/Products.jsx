import React, { useState, useEffect } from "react";
import { ShoppingBag, Search, Star, ShoppingCart, SlidersHorizontal } from "lucide-react";
import api from "../../services/api";
import { useToast } from "../../components/Toast";

const UPLOAD = '/uploads';
const img = (src, fallback = "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=500&q=80") =>
  src ? (src.startsWith('http') ? src : `${UPLOAD}/${src}`) : fallback;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("name");
  const toast = useToast();

  useEffect(() => {
    api.get('/products/list.php').then(r => {
      if (r.success) setProducts(r.data || []);
      setLoading(false);
    });
  }, []);

  const addToCart = async (productId) => {
    const res = await api.post('/cart/add.php', { product_id: productId, quantity: 1 });
    if (res.success) toast.success("Added to cart!");
    else toast.error(res.message || "Could not add to cart");
  };

  const categories = ["All", ...new Set(products.map(p => p.category_name || p.category).filter(Boolean))];
  let filtered = products.filter(p => {
    const matchCat = category === "All" || (p.category_name || p.category) === category;
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });
  filtered.sort((a, b) => sort === "price" ? (a.price - b.price) : sort === "rating" ? (b.rating - a.rating) : a.name?.localeCompare(b.name));

  if (loading) return <div className="dash-loading"><div className="spinner"/><p>Loading products...</p></div>;

  return (
    <div className="page-products">
      <div className="page-head"><h1>Products</h1></div>
      <div className="products-toolbar">
        <div className="search-input"><Search size={16}/><input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}/></div>
        <div className="filter-group">
          <div className="cat-pills">{categories.map(c => <button key={c} className={category === c ? "active" : ""} onClick={() => setCategory(c)}>{c}</button>)}</div>
          <select value={sort} onChange={e => setSort(e.target.value)} className="sort-select">
            <option value="name">Sort by Name</option><option value="price">Sort by Price</option><option value="rating">Sort by Rating</option>
          </select>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state big"><ShoppingBag size={48}/><h3>No products found</h3><p>Try adjusting your search or filters.</p></div>
      ) : (
        <div className="products-grid">
          {filtered.map(p => (
            <div key={p.id} className="product-card">
              <div className="product-card-img"><img src={img(p.image)} alt={p.name}/></div>
              <div className="product-card-body">
                <span className="product-cat">{p.category_name || p.category}</span>
                <h3>{p.name}</h3>
                <p className="product-desc">{p.description?.slice(0, 80)}</p>
                <div className="product-card-footer">
                  <strong>Rs. {Number(p.price).toLocaleString()}</strong>
                  <span className="product-rating"><Star size={12} fill="currentColor"/> {p.rating || "4.5"}</span>
                </div>
                {p.stock > 0 ? (
                  <button className="btn-primary btn-sm btn-full" onClick={() => addToCart(p.id)}><ShoppingCart size={14}/> Add to Cart</button>
                ) : <span className="out-of-stock">Out of Stock</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
