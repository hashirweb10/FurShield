import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import api from "../../services/api";

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/health/records.php').then(r => { if (r.success) setRecords(r.data || []); setLoading(false); }); }, []);
  if (loading) return <div className="dash-loading"><div className="spinner"/><p>Loading records...</p></div>;
  return (
    <div className="page-records">
      <div className="page-head"><h1>Medical Records</h1></div>
      {records.length === 0 ? <div className="empty-state big"><FileText size={48}/><h3>No records</h3><p>Records from completed appointments will appear here.</p></div> : (
        <div className="timeline-list">{records.map(r => (
          <div key={r.id} className="timeline-entry"><div className="timeline-content">
            <span className="type-badge">{r.type}</span><h4>{r.title}</h4><p>{r.description}</p>
            {r.notes && <small>Notes: {r.notes}</small>}
            <small>Date: {r.date} · Pet: {r.pet_name} · Owner: {r.owner_name}</small>
          </div></div>
        ))}</div>
      )}
    </div>
  );
}
