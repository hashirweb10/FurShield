import React, { useState, useEffect } from "react";
import { CalendarDays, Check, X, Clock, RefreshCw, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { useToast } from "../../components/Toast";

export default function VetAppointments() {
  const [appts, setAppts] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [noteModal, setNoteModal] = useState(null);
  const [note, setNote] = useState({ diagnosis: "", treatment: "", medication: "", follow_up: "" });
  const toast = useToast();

  const fetch = () => { api.get(`/appointments/list.php?status=${filter}`).then(r => { if (r.success) setAppts(r.data || []); setLoading(false); }); };
  useEffect(() => { fetch(); }, [filter]);

  const action = async (id, act) => {
    const res = await api.post('/appointments/update_status.php', { id, status: act });
    if (res.success) { toast.success(`Appointment updated`); fetch(); }
    else toast.error(res.message);
  };

  const addNotes = async (e) => {
    e.preventDefault();
    const res = await api.post('/appointments/add_notes.php', { id: noteModal, diagnosis: note.diagnosis, treatment_notes: note.treatment, medication: note.medication, follow_up: note.follow_up });
    if (res.success) { toast.success("Notes saved!"); setNoteModal(null); setNote({ diagnosis: "", treatment: "", medication: "", follow_up: "" }); }
    else toast.error(res.message);
  };

  if (loading) return <div className="dash-loading"><div className="spinner"/><p>Loading...</p></div>;

  return (
    <div className="page-vet-appts">
      <div className="page-head"><h1>Appointments</h1></div>
      <div className="filter-tabs">
        {["pending", "approved", "completed", "rejected", "cancelled"].map(f => (
          <button key={f} className={filter === f ? "active" : ""} onClick={() => { setFilter(f); setLoading(true); }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>
      {appts.length === 0 ? <div className="empty-state big"><CalendarDays size={48}/><h3>No {filter} appointments</h3></div> : (
        <div className="appt-cards">{appts.map(a => (
          <div key={a.id} className="appt-card">
            <div className="appt-card-top">
              <div><strong>{a.owner_name}</strong><span>Pet: {a.pet_name} ({a.pet_species || ""})</span></div>
              <span className={`status-badge status-${a.status?.toLowerCase()}`}>{a.status}</span>
            </div>
            <div className="appt-card-details"><span><CalendarDays size={14}/>{a.date}</span><span><Clock size={14}/>{a.time}</span></div>
            {a.reason && <p>{a.reason}</p>}
            {a.diagnosis && <p className="diagnosis"><strong>Diagnosis:</strong> {a.diagnosis}</p>}
            <div className="appt-actions">
              {a.status === "pending" && <><button className="btn-sm btn-primary" onClick={() => action(a.id, 'approved')}><Check size={14}/> Approve</button><button className="btn-sm btn-outline" onClick={() => action(a.id, 'rejected')}><X size={14}/> Reject</button></>}
              {a.status === "approved" && <><button className="btn-sm btn-primary" onClick={() => setNoteModal(a.id)}><FileText size={14}/> Add Notes</button><button className="btn-sm btn-outline" onClick={() => action(a.id, 'completed')}><Check size={14}/> Complete</button></>}
            </div>
          </div>
        ))}</div>
      )}
      <AnimatePresence>
        {noteModal && (
          <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setNoteModal(null)}>
            <motion.div className="modal" initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} onClick={e=>e.stopPropagation()}>
              <div className="modal-head"><h2>Appointment Notes</h2><button onClick={() => setNoteModal(null)}><X size={20}/></button></div>
              <form onSubmit={addNotes}>
                <label>Diagnosis<textarea value={note.diagnosis} onChange={e => setNote(p=>({...p, diagnosis: e.target.value}))} rows={3} required/></label>
                <label>Treatment Notes<textarea value={note.treatment} onChange={e => setNote(p=>({...p, treatment: e.target.value}))} rows={3}/></label>
                <label>Prescribed Medication<input value={note.medication} onChange={e => setNote(p=>({...p, medication: e.target.value}))}/></label>
                <label>Follow-up Date<input type="date" value={note.follow_up} onChange={e => setNote(p=>({...p, follow_up: e.target.value}))}/></label>
                <div className="modal-actions"><button type="button" className="btn-ghost" onClick={() => setNoteModal(null)}>Cancel</button><button type="submit" className="btn-primary">Save & Complete</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
