import React, { useState, useEffect } from "react";
import { CalendarDays, Plus, X, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { useToast } from "../../components/Toast";

export default function Appointments() {
  const [appts, setAppts] = useState([]);
  const [pets, setPets] = useState([]);
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ pet_id: "", vet_id: "", date: "", time: "", reason: "" });
  const [slots, setSlots] = useState([]);
  const toast = useToast();

  const fetch = () => {
    Promise.all([
      api.get('/appointments/list.php'),
      api.get('/pets/list.php'),
      api.get('/vets/list.php'),
    ]).then(([a, p, v]) => {
      if (a.success) setAppts(a.data || []);
      if (p.success) setPets(p.data || []);
      if (v.success) setVets(v.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { fetch(); }, []);

  useEffect(() => {
    if (form.vet_id && form.date) {
      api.get(`/vets/availability.php?id=${form.vet_id}`).then(r => {
        if (r.success) setSlots(r.data || []);
      });
    }
  }, [form.vet_id, form.date]);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleBook = async (e) => {
    e.preventDefault();
    const res = await api.post('/appointments/book.php', form);
    if (res.success) { toast.success("Appointment booked!"); setModal(false); setForm({ pet_id: "", vet_id: "", date: "", time: "", reason: "" }); fetch(); }
    else toast.error(res.message || "Could not book appointment");
  };

  const handleCancel = async (id) => {
    if (!confirm("Cancel this appointment?")) return;
    const res = await api.post('/appointments/cancel.php', { id });
    if (res.success) { toast.success("Appointment cancelled"); fetch(); }
    else toast.error(res.message);
  };

  const filtered = filter === "all" ? appts : appts.filter(a => a.status?.toLowerCase() === filter);
  const statusIcon = { pending: AlertCircle, approved: CheckCircle, completed: CheckCircle, rejected: XCircle, cancelled: XCircle, rescheduled: Clock };

  if (loading) return <div className="dash-loading"><div className="spinner"/><p>Loading appointments...</p></div>;

  return (
    <div className="page-appointments">
      <div className="page-head">
        <h1>Appointments</h1>
        <button className="btn-primary" onClick={() => setModal(true)}><Plus size={16}/> Book Appointment</button>
      </div>

      <div className="filter-tabs">
        {["all", "pending", "approved", "completed", "cancelled"].map(f => (
          <button key={f} className={filter === f ? "active" : ""} onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state big"><CalendarDays size={48}/><h3>No appointments</h3><p>Book your first appointment to get started.</p></div>
      ) : (
        <div className="appt-cards">
          {filtered.map(a => {
            const Icon = statusIcon[a.status?.toLowerCase()] || Clock;
            return (
              <div key={a.id} className="appt-card">
                <div className="appt-card-top">
                  <div><strong>{a.vet_name || "Veterinarian"}</strong><span>{a.specialization || ""}</span></div>
                  <span className={`status-badge status-${a.status?.toLowerCase()}`}><Icon size={12}/> {a.status}</span>
                </div>
                <div className="appt-card-details">
                  <span><CalendarDays size={14}/> {a.date}</span>
                  <span><Clock size={14}/> {a.time}</span>
                  <span>Pet: {a.pet_name}</span>
                </div>
                {a.reason && <p className="appt-reason">{a.reason}</p>}
                {(a.status === "pending" || a.status === "approved") && (
                  <button className="btn-outline btn-sm" onClick={() => handleCancel(a.id)}>Cancel</button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(false)}>
            <motion.div className="modal" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="modal-head"><h2>Book Appointment</h2><button onClick={() => setModal(false)}><X size={20}/></button></div>
              <form onSubmit={handleBook}>
                <label>Select Pet
                  <select value={form.pet_id} onChange={set("pet_id")} required>
                    <option value="">Choose a pet...</option>
                    {pets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.species})</option>)}
                  </select>
                </label>
                <label>Select Veterinarian
                  <select value={form.vet_id} onChange={set("vet_id")} required>
                    <option value="">Choose a vet...</option>
                    {vets.map(v => <option key={v.id} value={v.id}>{v.full_name} — {v.specialization}</option>)}
                  </select>
                </label>
                <div className="form-grid">
                  <label>Date<input type="date" value={form.date} onChange={set("date")} required min={new Date().toISOString().split("T")[0]}/></label>
                  <label>Time
                    <select value={form.time} onChange={set("time")} required>
                      <option value="">Select time...</option>
                      {slots.length > 0 ? slots.map(s => <option key={s.id} value={s.start_time}>{s.start_time} - {s.end_time}</option>) :
                        ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </label>
                </div>
                <label>Reason / Condition<textarea value={form.reason} onChange={set("reason")} rows={3} placeholder="Describe the reason for visit..."/></label>
                <div className="modal-actions">
                  <button type="button" className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Book Appointment</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
