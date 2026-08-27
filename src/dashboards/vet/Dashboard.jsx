import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Users, CheckCircle, Clock, ArrowRight, Star } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function VetDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pending: 0, approved: 0, completed: 0, patients: 0 });
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/appointments/list.php?status=pending'),
      api.get('/appointments/list.php?status=approved'),
      api.get('/appointments/list.php?status=completed'),
      api.get('/vets/patients.php'),
    ]).then(([p, a, c, pts]) => {
      setStats({
        pending: p.success ? (p.data?.length || 0) : 0,
        approved: a.success ? (a.data?.length || 0) : 0,
        completed: c.success ? (c.data?.length || 0) : 0,
        patients: pts.success ? (pts.data?.length || 0) : 0,
      });
      if (p.success) setPending(p.data || []);
      setLoading(false);
    });
  }, []);

  const handleAction = async (id, action) => {
    const res = await api.post('/appointments/update_status.php', { id, status: action });
    if (res.success) { window.location.reload(); }
  };

  if (loading) return <div className="dash-loading"><div className="spinner"/><p>Loading dashboard...</p></div>;

  const cards = [
    { icon: Clock, label: "Pending Requests", value: stats.pending, color: "gold" },
    { icon: CheckCircle, label: "Approved", value: stats.approved, color: "green" },
    { icon: CalendarDays, label: "Completed", value: stats.completed, color: "mint" },
    { icon: Users, label: "Total Patients", value: stats.patients, color: "coral" },
  ];

  return (
    <div className="vet-dash">
      <div className="dash-welcome"><h1>Welcome, {user?.name || "Doctor"}!</h1><p>Manage your appointments and patient records.</p></div>
      <div className="stat-cards">{cards.map(c => (
        <div key={c.label} className={`stat-card stat-${c.color}`}><div className="stat-icon"><c.icon size={22}/></div><div className="stat-info"><span>{c.label}</span><strong>{c.value}</strong></div></div>
      ))}</div>
      <div className="dash-panel">
        <div className="panel-head"><h3>Pending Appointment Requests</h3><button onClick={() => navigate("/dashboard/vet/appointments")}>View all</button></div>
        {pending.length === 0 ? <div className="empty-state"><CalendarDays size={32}/><p>No pending requests</p></div> : (
          <div className="appt-list">{pending.slice(0, 5).map(a => (
            <div key={a.id} className="appt-row">
              <div className="appt-info"><strong>{a.owner_name}</strong><span>{a.pet_name} · {a.date} at {a.time}</span><span>{a.reason}</span></div>
              <div className="appt-actions">
                <button className="btn-sm btn-primary" onClick={() => handleAction(a.id, 'approved')}>Approve</button>
                <button className="btn-sm btn-outline" onClick={() => handleAction(a.id, 'rejected')}>Reject</button>
              </div>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}
