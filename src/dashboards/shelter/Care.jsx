import React, { useState, useEffect } from "react";
import { Utensils, Scissors, Syringe, Plus, X, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { useToast } from "../../components/Toast";

const LOG_TYPES = [
  { key: "feeding", icon: Utensils, label: "Feeding", color: "gold" },
  { key: "grooming", icon: Scissors, label: "Grooming", color: "mint" },
  { key: "medical", icon: Syringe, label: "Medical", color: "coral" },
];

export default function ShelterCare() {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ type: "feeding", title: "", description: "", date: "" });
  const toast = useToast();

  useEffect(() => {
    api.get('/adoption/shelter_listings.php').then(r => {
      if (r.success) { setPets(r.data || []); if (r.data?.length) setSelectedPet(r.data[0].id); }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedPet) return;
    api.get(`/care/shelter_logs.php?pet_id=${selectedPet}`).then(r => { if (r.success) setLogs(r.data || []); });
  }, [selectedPet]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await api.post('/care/add_log.php', { ...form, pet_id: selectedPet });
    if (res.success) { toast.success("Log added"); setModal(null); setLogs(prev => [res.data, ...prev]); }
    else toast.error(res.message);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this log entry?")) return;
    const res = await api.delete(`/care/delete_log.php?id=${id}`);
    if (res.success) { toast.success("Deleted"); setLogs(prev => prev.filter(l => l.id !== id)); }
  };

  const getLogType = (type) => LOG_TYPES.find(t => t.key === type) || LOG_TYPES[0];

  if (loading) return <div className="dash-loading"><div className="spinner"/><p>Loading...</p></div>;

  return (
    <div className="page-care-logs">
      <div className="page-head"><h1>Care Logs</h1><button className="btn-primary" onClick={()=>{ setForm({ type:"feeding", title:"", description:"", date:"" }); setModal(true); }}><Plus size={16}/> Add Log</button></div>
      <div className="pet-tabs">
        {pets.map(p => (
          <button key={p.id} className={selectedPet===p.id?"active":""} onClick={()=>setSelectedPet(p.id)}>
            {p.name}
          </button>
        ))}
      </div>
      {pets.length === 0 ? (
        <div className="empty-state big"><ClipboardList size={48}/><h3>No pets yet</h3><p>Add adoption listings first to track care logs.</p></div>
      ) : logs.length === 0 ? (
        <div className="empty-state"><ClipboardList size={32}/><p>No care logs for this pet yet.</p></div>
      ) : (
        <div className="log-timeline">
          {logs.map(log => {
            const lt = getLogType(log.type);
            const Icon = lt.icon;
            return (
              <div key={log.id} className="log-entry">
                <div className={`log-icon log-${lt.color}`}><Icon size={16}/></div>
                <div className="log-content">
                  <div className="log-top">
                    <strong>{log.title}</strong>
                    <span className="log-type-badge">{lt.label}</span>
                  </div>
                  <p>{log.description}</p>
                  <small>{log.date || log.created_at}</small>
                </div>
                <button className="log-delete" onClick={()=>handleDelete(log.id)}><X size={14}/></button>
              </div>
            );
          })}
        </div>
      )}
      <AnimatePresence>
        {modal && (
          <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setModal(null)}>
            <motion.div className="modal" initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} onClick={e=>e.stopPropagation()}>
              <div className="modal-head"><h2>Add Care Log</h2><button onClick={()=>setModal(null)}><X size={20}/></button></div>
              <form onSubmit={handleAdd}>
                <label>Type
                  <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
                    {LOG_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                  </select>
                </label>
                <label>Title<input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} required placeholder="e.g. Morning feeding"/></label>
                <label>Description<textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3} placeholder="Details..."/></label>
                <label>Date<input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/></label>
                <div className="modal-actions"><button type="button" className="btn-ghost" onClick={()=>setModal(null)}>Cancel</button><button type="submit" className="btn-primary">Add Log</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
