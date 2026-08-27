import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import api from "../../services/api";
export default function VetReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/vets/my_reviews.php').then(r => { if (r.success) setReviews(r.data?.reviews || []); setLoading(false); }); }, []);
  if (loading) return <div className="dash-loading"><div className="spinner"/><p>Loading reviews...</p></div>;
  const avg = reviews.length ? (reviews.reduce((s,r) => s + Number(r.rating), 0) / reviews.length).toFixed(1) : "N/A";
  return (
    <div className="page-reviews">
      <div className="page-head"><h1>Reviews & Ratings</h1></div>
      <div className="review-summary"><div className="review-avg"><Star size={28} fill="currentColor"/><strong>{avg}</strong><span>{reviews.length} reviews</span></div></div>
      {reviews.length === 0 ? <div className="empty-state"><Star size={32}/><p>No reviews yet</p></div> : (
        <div className="reviews-list">{reviews.map(r => (
          <div key={r.id} className="review-card"><div className="review-top"><strong>{r.reviewer_name}</strong><div className="stars">{Array.from({length:5},(_,i)=><Star key={i} size={14} fill={i<r.rating?"currentColor":"none"}/>)}</div></div><p>{r.comment}</p><small>{r.created_at}</small></div>
        ))}</div>
      )}
    </div>
  );
}
