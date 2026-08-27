import React, { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, CalendarDays, Syringe, Package, Heart } from "lucide-react";
import api from "../../services/api";

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => { api.get('/notifications/list.php').then(r => { if (r.success) setNotifs(r.data || []); setLoading(false); }); };
  useEffect(() => { fetch(); }, []);

  const markRead = async (id) => { await api.post('/notifications/read.php', { id }); fetch(); };
  const markAllRead = async () => { await api.post('/notifications/read_all.php'); fetch(); };

  const unread = notifs.filter(n => !n.is_read).length;

  if (loading) return <div className="dash-loading"><div className="spinner"/><p>Loading notifications...</p></div>;

  return (
    <div className="page-notifications">
      <div className="page-head">
        <h1>Notifications {unread > 0 && <span className="badge">{unread}</span>}</h1>
        {unread > 0 && <button className="btn-outline btn-sm" onClick={markAllRead}><CheckCheck size={14}/> Mark all read</button>}
      </div>
      {notifs.length === 0 ? (
        <div className="empty-state big"><Bell size={48}/><h3>No notifications</h3><p>You're all caught up!</p></div>
      ) : (
        <div className="notif-list">
          {notifs.map(n => (
            <div key={n.id} className={`notif-item ${!n.is_read ? "unread" : ""}`} onClick={() => !n.is_read && markRead(n.id)}>
              <div className="notif-icon-wrap">
                {n.type?.includes("appointment") ? <CalendarDays size={18}/> :
                 n.type?.includes("vaccination") ? <Syringe size={18}/> :
                 n.type?.includes("order") ? <Package size={18}/> :
                 n.type?.includes("adoption") ? <Heart size={18}/> : <Bell size={18}/>}
              </div>
              <div className="notif-content"><strong>{n.title}</strong><p>{n.message}</p><small>{n.created_at}</small></div>
              {!n.is_read && <div className="unread-dot"/>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
