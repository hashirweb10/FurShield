import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PawPrint, Users, Heart, ClipboardList, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function ShelterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, available: 0, applications: 0, adopted: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/adoption/shelter_listings.php'), api.get('/adoption/shelter_applications.php')]).then(([l, a]) => {
      const listings = l.success ? (l.data || []) : [];
      const apps = a.success ? (a.data || []) : [];
      setStats({
        total: listings.length,
        available: listings.filter(x => x.adoption_status === "available").length,
        applications: apps.filter(x => x.status === "pending").length,
        adopted: listings.filter(x => x.adoption_status === "adopted").length,
      });
      setRecent(apps.slice(0, 5));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="dash-loading"><div className="spinner"/><p>Loading...</p></div>;

  const cards = [
    { icon: PawPrint, label: "Total Animals", value: stats.total, color: "green" },
    { icon: Heart, label: "Available for Adoption", value: stats.available, color: "coral" },
    { icon: Users, label: "Pending Applications", value: stats.applications, color: "gold" },
    { icon: ClipboardList, label: "Adopted", value: stats.adopted, color: "mint" },
  ];

  return (
    <div className="shelter-dash">
      <div className="dash-welcome"><h1>Welcome, {user?.name?.split(" ")[0] || "there"}!</h1><p>Manage your shelter's adoption program.</p></div>
      <div className="stat-cards">{cards.map(c => (
        <div key={c.label} className={`stat-card stat-${c.color}`}><div className="stat-icon"><c.icon size={22}/></div><div className="stat-info"><span>{c.label}</span><strong>{c.value}</strong></div></div>
      ))}</div>
      <div className="dash-panel">
        <div className="panel-head"><h3>Recent Applications</h3><button onClick={() => navigate("/dashboard/shelter/applications")}>View all</button></div>
        {recent.length === 0 ? <div className="empty-state"><Users size={32}/><p>No recent applications</p></div> : (
          <div className="appt-list">{recent.map(a => (
            <div key={a.id} className="appt-row"><div className="appt-info"><strong>{a.applicant_name}</strong><span>For: {a.pet_name} · {a.created_at}</span></div><span className={`status-badge status-${a.status}`}>{a.status}</span></div>
          ))}</div>
        )}
      </div>
    </div>
  );
}
