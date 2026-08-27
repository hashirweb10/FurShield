import React, { useState, useEffect } from "react";
import { Users, Check, X, MessageCircle, Clock, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { useToast } from "../../components/Toast";

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [msgModal, setMsgModal] = useState(null);
  const [message, setMessage] = useState("");
  const toast = useToast();

  const fetch = () => { api.get('/adoption/shelter_applications.php').then(r => { if (r.success) setApps(r.data || []); setLoading(false); }); };
  useEffect(() => { fetch(); }, []);

  const filtered = filter === "all" ? apps : apps.filter(a => a.status === filter);

  const handleAction = async (id, action) => {
    const res = await api.post('/adoption/update_application.php', { id, status: action });
    if (res.success) { toast.success(`Application ${action}`); fetch(); }
    else toast.error(res.message);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const res = await api.post('/adoption/application_message.php', { application_id: msgModal.id, message });
    if (res.success) { toast.success("Message sent"); setMessage(""); setMsgModal(null); }
    else toast.error(res.message);
  };

  const statusIcon = (s) => {
    if (s === "approved") return <Check size={14}/>;
    if (s === "rejected") return <X size={14}/>;
    return <Clock size={14}/>;
  };

  if (loading) return <div className="dash-loading"><div className="spinner"/><p>Loading...</p></div>;

  return (
    <div className="page-applications">
      <div className="page-head"><h1>Adoption Applications</h1></div>
      <div className="filter-tabs">
        {["all","pending","approved","rejected"].map(t => (
          <button key={t} className={filter===t?"active":""} onClick={()=>setFilter(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)} {t==="pending" && <span className="tab-count">{apps.filter(a=>a.status==="pending").length}</span>}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state big"><Users size={48}/><h3>No applications</h3><p>Applications from interested adopters will appear here.</p></div>
      ) : (
        <div className="app-list">
          {filtered.map(a => (
            <div key={a.id} className="app-card">
              <div className="app-card-top">
                <div className="app-applicant">
                  <div className="app-avatar">{a.applicant_name?.charAt(0) || "A"}</div>
                  <div>
                    <strong>{a.applicant_name}</strong>
                    <span>{a.applicant_email}</span>
                  </div>
                </div>
                <span className={`status-badge status-${a.status}`}>{statusIcon(a.status)} {a.status}</span>
              </div>
              <div className="app-card-body">
                <div className="app-detail"><span>Pet</span><strong>{a.pet_name}</strong></div>
                <div className="app-detail"><span>Applied</span><strong>{a.created_at}</strong></div>
                {a.reason && <div className="app-detail full"><span>Reason</span><p>{a.reason}</p></div>}
              </div>
              {a.status === "pending" && (
                <div className="app-card-actions">
                  <button className="btn-sm btn-approve" onClick={()=>handleAction(a.id,"approved")}><Check size={14}/> Approve</button>
                  <button className="btn-sm btn-reject" onClick={()=>handleAction(a.id,"rejected")}><X size={14}/> Reject</button>
                  <button className="btn-sm btn-ghost" onClick={()=>setMsgModal(a)}><MessageCircle size={14}/> Message</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <AnimatePresence>
        {msgModal && (
          <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setMsgModal(null)}>
            <motion.div className="modal" initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} onClick={e=>e.stopPropagation()}>
              <div className="modal-head"><h2>Message {msgModal.applicant_name}</h2><button onClick={()=>setMsgModal(null)}><X size={20}/></button></div>
              <form onSubmit={sendMessage}>
                <label>Message<textarea value={message} onChange={e=>setMessage(e.target.value)} rows={4} placeholder="Write your message..."/></label>
                <div className="modal-actions"><button type="button" className="btn-ghost" onClick={()=>setMsgModal(null)}>Cancel</button><button type="submit" className="btn-primary"><Mail size={14}/> Send</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
