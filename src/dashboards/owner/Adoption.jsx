import React, { useState, useEffect } from "react";
import { Home, Heart, Send, Eye } from "lucide-react";
import api from "../../services/api";
import { useToast } from "../../components/Toast";

const UPLOAD = '/uploads';
const img = (src) => src ? (src.startsWith('http') ? src : `${UPLOAD}/${src}`) : "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80";

export default function Adoption() {
  const [listings, setListings] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const toast = useToast();

  const fetch = () => {
    Promise.all([api.get('/adoption/listings.php'), api.get('/adoption/my_applications.php')]).then(([l, a]) => {
      if (l.success) setListings(l.data || []);
      if (a.success) setMyApps(a.data || []);
      setLoading(false);
    });
  };
  useEffect(() => { fetch(); }, []);

  const apply = async (listingId) => {
    const res = await api.post('/adoption/apply.php', { listing_id: listingId, reason: "I am interested in adopting this pet." });
    if (res.success) { toast.success("Application submitted!"); fetch(); }
    else toast.error(res.message);
  };

  const appliedIds = myApps.map(a => a.listing_id);
  const filtered = filter === "all" ? listings : listings.filter(l => l.status === filter);

  if (loading) return <div className="dash-loading"><div className="spinner"/><p>Loading listings...</p></div>;

  return (
    <div className="page-adoption">
      <div className="page-head"><h1>Adoption</h1></div>
      <div className="filter-tabs">
        {["all", "available", "pending", "adopted"].map(f => (
          <button key={f} className={filter === f ? "active" : ""} onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>
      {myApps.length > 0 && (
        <div className="my-applications">
          <h3>My Applications ({myApps.length})</h3>
          <div className="app-list">{myApps.map(a => (
            <div key={a.id} className="app-row"><span>{a.pet_name || `Listing #${a.listing_id}`}</span><span className={`status-badge status-${a.status}`}>{a.status}</span><small>{a.created_at}</small></div>
          ))}</div>
        </div>
      )}
      {filtered.length === 0 ? (
        <div className="empty-state big"><Home size={48}/><h3>No adoption listings</h3></div>
      ) : (
        <div className="adoption-grid">
          {filtered.map(l => (
            <div key={l.id} className="adoption-card">
              <div className="adoption-card-img"><img src={img(l.image)} alt={l.name}/></div>
              <div className="adoption-card-body">
                <h3>{l.name}</h3>
                <span>{l.species} · {l.breed} · {l.age}</span>
                <p>{l.gender} · {l.health_status}</p>
                <small>Shelter: {l.shelter_name || "Unknown"}</small>
                {l.description && <p className="adopt-desc">{l.description.slice(0, 100)}</p>}
                <span className={`status-badge status-${l.adoption_status || l.status}`}>{l.adoption_status || l.status}</span>
                {appliedIds.includes(l.id) ? (
                  <button className="btn-outline btn-sm btn-full" disabled>Application Sent</button>
                ) : (l.adoption_status === "available" || l.status === "available") ? (
                  <button className="btn-primary btn-sm btn-full" onClick={() => apply(l.id)}><Heart size={14}/> Submit Interest</button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
