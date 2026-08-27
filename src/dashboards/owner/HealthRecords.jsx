import React, { useState, useEffect } from "react";
import { Heart, Plus, X, FileText, Upload, Syringe, AlertTriangle, Pill, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { useToast } from "../../components/Toast";

export default function HealthRecords() {
  const [records, setRecords] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState("");
  const [form, setForm] = useState({ pet_id: "", type: "vaccination", title: "", description: "", date: "", veterinarian: "", medication: "", follow_up_date: "", document: null });
  const toast = useToast();

  const fetch = () => {
    Promise.all([api.get('/health/records.php'), api.get('/pets/list.php')]).then(([r, p]) => {
      if (r.success) setRecords(r.data || []);
      if (p.success) { setPets(p.data || []); if (p.data?.[0]) { setSelectedPet(p.data[0].id); setForm(f => ({...f, pet_id: p.data[0].id})); } }
      setLoading(false);
    });
  };
  useEffect(() => { fetch(); }, []);
  useEffect(() => { if (selectedPet) setForm(f => ({...f, pet_id: selectedPet})); }, [selectedPet]);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target?.value ?? e }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v); });
    const res = await api.upload('/health/add_record.php', fd);
    if (res.success) { toast.success("Health record added!"); setModal(false); fetch(); }
    else toast.error(res.message);
  };

  const typeIcon = { vaccination: Syringe, allergy: AlertTriangle, illness: Activity, treatment: Pill };
  const filtered = selectedPet ? records.filter(r => r.pet_id == selectedPet) : records;

  if (loading) return <div className="dash-loading"><div className="spinner"/><p>Loading records...</p></div>;

  return (
    <div className="page-health">
      <div className="page-head">
        <h1>Health Records</h1>
        <button className="btn-primary" onClick={() => setModal(true)}><Plus size={16}/> Add Record</button>
      </div>
      {pets.length > 1 && (
        <div className="pet-tabs">{pets.map(p => (
          <button key={p.id} className={selectedPet == p.id ? "active" : ""} onClick={() => setSelectedPet(p.id)}>{p.name}</button>
        ))}</div>
      )}
      {filtered.length === 0 ? (
        <div className="empty-state big"><Heart size={48}/><h3>No health records</h3><p>Start tracking your pet's health history.</p></div>
      ) : (
        <div className="timeline-list">
          {filtered.map(r => {
            const Icon = typeIcon[r.type] || FileText;
            return (
              <div key={r.id} className="timeline-entry">
                <div className="timeline-dot-wrap"><div className={`timeline-dot dot-${r.type}`}><Icon size={14}/></div><div className="timeline-line"/></div>
                <div className="timeline-content">
                  <div className="timeline-top"><span className={`type-badge type-${r.type}`}>{r.type}</span><span className="timeline-date">{r.date}</span></div>
                  <h4>{r.title}</h4>
                  {r.description && <p>{r.description}</p>}
                  {r.veterinarian && <small>Vet: {r.veterinarian}</small>}
                  {r.medication && <small>Medication: {r.medication}</small>}
                  {r.follow_up_date && <small>Follow-up: {r.follow_up_date}</small>}
                  {r.document && <a href={`/uploads/${r.document}`} target="_blank" className="doc-link"><FileText size={14}/> View Document</a>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <AnimatePresence>
        {modal && (
          <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setModal(false)}>
            <motion.div className="modal" initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} exit={{scale:0.9}} onClick={e=>e.stopPropagation()}>
              <div className="modal-head"><h2>Add Health Record</h2><button onClick={() => setModal(false)}><X size={20}/></button></div>
              <form onSubmit={handleSubmit}>
                <label>Pet<select value={form.pet_id} onChange={set("pet_id")} required>{pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
                <label>Type<select value={form.type} onChange={set("type")}><option value="vaccination">Vaccination</option><option value="allergy">Allergy</option><option value="illness">Illness</option><option value="treatment">Treatment</option><option value="checkup">Checkup</option></select></label>
                <label>Title<input value={form.title} onChange={set("title")} required placeholder="e.g. Rabies Vaccination"/></label>
                <label>Description<textarea value={form.description} onChange={set("description")} rows={3}/></label>
                <div className="form-grid">
                  <label>Date<input type="date" value={form.date} onChange={set("date")} required/></label>
                  <label>Veterinarian<input value={form.veterinarian} onChange={set("veterinarian")}/></label>
                </div>
                <label>Medication<input value={form.medication} onChange={set("medication")} placeholder="Prescribed medication if any"/></label>
                <label>Follow-up Date<input type="date" value={form.follow_up_date} onChange={set("follow_up_date")}/></label>
                <label>Document (optional)
                  <div className="file-upload"><Upload size={20}/><span>{form.document?.name || "Upload certificate/report"}</span><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => set("document")(e.target.files[0])}/></div>
                </label>
                <div className="modal-actions"><button type="button" className="btn-ghost" onClick={() => setModal(false)}>Cancel</button><button type="submit" className="btn-primary">Add Record</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
