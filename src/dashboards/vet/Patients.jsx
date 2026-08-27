import React, { useState, useEffect } from "react";
import { PawPrint, Activity, Eye } from "lucide-react";
import api from "../../services/api";
const img = (src) => src ? (src.startsWith('http') ? src : `/uploads/${src}`) : "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  useEffect(() => { api.get('/vets/patients.php').then(r => { if (r.success) setPatients(r.data || []); setLoading(false); }); }, []);

  const viewHistory = async (petId) => {
    const r = await api.get(`/health/records.php?pet_id=${petId}`);
    setDetail({ pet: patients.find(p => p.id == petId), records: r.success ? (r.data || []) : [] });
  };

  if (loading) return <div className="dash-loading"><div className="spinner"/><p>Loading patients...</p></div>;

  return (
    <div className="page-patients">
      <div className="page-head"><h1>My Patients</h1></div>
      {patients.length === 0 ? <div className="empty-state big"><PawPrint size={48}/><h3>No patients yet</h3><p>Pets from booked appointments will appear here.</p></div> : (
        <div className="pet-grid">{patients.map(p => (
          <div key={p.id} className="pet-card">
            <div className="pet-card-img"><img src={img(p.image)} alt={p.name}/></div>
            <div className="pet-card-body">
              <h3>{p.name}</h3><span>{p.species} · {p.breed}</span><p>{p.age} · Owner: {p.owner_name}</p>
              <button className="btn-outline btn-sm" onClick={() => viewHistory(p.id)}><Eye size={14}/> View History</button>
            </div>
          </div>
        ))}</div>
      )}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head"><h2>{detail.pet?.name} — Health History</h2><button onClick={() => setDetail(null)}>✕</button></div>
            {detail.records.length === 0 ? <p>No health records available.</p> : (
              <div className="timeline-list">{detail.records.map(r => (
                <div key={r.id} className="timeline-entry"><div className="timeline-content"><span className="type-badge">{r.type}</span><h4>{r.title}</h4><p>{r.description}</p><small>{r.date}</small></div></div>
              ))}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
