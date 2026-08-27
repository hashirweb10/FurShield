import React, { useState, useEffect } from "react";
import { Stethoscope, Star, MapPin, Search, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function OwnerVets() {
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [spec, setSpec] = useState("All");
  const navigate = useNavigate();

  useEffect(() => { api.get('/vets/list.php').then(r => { if (r.success) setVets(r.data || []); setLoading(false); }); }, []);

  const specs = ["All", ...new Set(vets.map(v => v.specialization).filter(Boolean))];
  const filtered = vets.filter(v => {
    const matchSpec = spec === "All" || v.specialization === spec;
    const matchSearch = (v.full_name + " " + v.specialization).toLowerCase().includes(search.toLowerCase());
    return matchSpec && matchSearch;
  });

  if (loading) return <div className="dash-loading"><div className="spinner"/><p>Loading veterinarians...</p></div>;

  return (
    <div className="page-vets">
      <div className="page-head"><h1>Veterinarians</h1></div>
      <div className="products-toolbar">
        <div className="search-input"><Search size={16}/><input placeholder="Search by name or specialty..." value={search} onChange={e => setSearch(e.target.value)}/></div>
        <div className="cat-pills">{specs.map(s => <button key={s} className={spec === s ? "active" : ""} onClick={() => setSpec(s)}>{s}</button>)}</div>
      </div>
      <div className="vet-cards">
        {filtered.map(v => (
          <div key={v.id} className="vet-card">
            <div className="vet-card-avatar">{v.full_name?.split(" ").map(w=>w[0]).join("").slice(0,2) || "V"}</div>
            <div className="vet-card-info">
              <h3>{v.full_name}</h3>
              <span>{v.specialization}</span>
              <div className="vet-card-meta">
                <span><Star size={12} fill="currentColor"/> {v.rating || "4.5"}</span>
                {v.address && <span><MapPin size={12}/> {v.address}</span>}
              </div>
              {v.experience && <small>{v.experience} experience</small>}
            </div>
            <button className="btn-primary btn-sm" onClick={() => navigate("/dashboard/owner/appointments")}>
              <CalendarDays size={14}/> Book
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
