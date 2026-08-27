import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PawPrint, CalendarDays, Syringe, ShoppingCart, Package, Bell, Heart, ArrowRight, TrendingUp, Activity } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pets: 0, appointments: 0, vaccinations: 0, cart: 0, orders: 0, adoptions: 0, notifications: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [upcomingAppts, setUpcomingAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/pets/list.php'),
      api.get('/appointments/list.php'),
      api.get('/orders/list.php'),
      api.get('/cart/list.php'),
      api.get('/notifications/list.php'),
    ]).then(([pets, appts, orders, cart, notifs]) => {
      setStats(s => ({
        ...s,
        pets: pets.success ? (pets.data?.length || 0) : 0,
        appointments: appts.success ? (appts.data?.length || 0) : 0,
        cart: cart.success ? (cart.data?.length || 0) : 0,
        orders: orders.success ? (orders.data?.length || 0) : 0,
        notifications: notifs.success ? (notifs.data?.length || 0) : 0,
      }));
      if (orders.success) setRecentOrders(orders.data || []);
      if (appts.success) setUpcomingAppts(appts.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="dash-loading"><div className="spinner"/><p>Loading dashboard...</p></div>;

  const cards = [
    { icon: PawPrint, label: "My Pets", value: stats.pets, color: "green", to: "/dashboard/owner/pets" },
    { icon: CalendarDays, label: "Upcoming Appointments", value: stats.appointments, color: "coral", to: "/dashboard/owner/appointments" },
    { icon: Syringe, label: "Vaccinations Due", value: stats.vaccinations, color: "gold", to: "/dashboard/owner/health" },
    { icon: ShoppingCart, label: "Cart Items", value: stats.cart, color: "mint", to: "/dashboard/owner/cart" },
    { icon: Package, label: "Total Orders", value: stats.orders, color: "lav", to: "/dashboard/owner/orders" },
    { icon: Bell, label: "Unread Notifications", value: stats.notifications, color: "coral", to: "/dashboard/owner/notifications" },
  ];

  return (
    <div className="owner-dash">
      <div className="dash-welcome">
        <h1>Welcome back, {user?.name?.split(" ")[0] || "there"}!</h1>
        <p>Here's an overview of your pet care activity.</p>
      </div>

      <div className="stat-cards">
        {cards.map(c => (
          <div key={c.label} className={`stat-card stat-${c.color}`} onClick={() => navigate(c.to)}>
            <div className="stat-icon"><c.icon size={22}/></div>
            <div className="stat-info"><span>{c.label}</span><strong>{c.value}</strong></div>
            <ArrowRight size={16} className="stat-arrow"/>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="dash-panel">
          <div className="panel-head"><h3>Upcoming Appointments</h3><button onClick={() => navigate("/dashboard/owner/appointments")}>View all</button></div>
          {upcomingAppts.length === 0 ? (
            <div className="empty-state"><CalendarDays size={32}/><p>No upcoming appointments</p><button className="btn-primary btn-sm" onClick={() => navigate("/dashboard/owner/appointments")}>Book one</button></div>
          ) : (
            <div className="appt-list">
              {upcomingAppts.slice(0, 5).map(a => (
                <div key={a.id} className="appt-row">
                  <div className="appt-date"><strong>{a.date}</strong><span>{a.time}</span></div>
                  <div className="appt-info"><strong>{a.vet_name}</strong><span>{a.pet_name} · {a.reason}</span></div>
                  <span className={`status-badge status-${a.status}`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dash-panel">
          <div className="panel-head"><h3>Recent Orders</h3><button onClick={() => navigate("/dashboard/owner/orders")}>View all</button></div>
          {recentOrders.length === 0 ? (
            <div className="empty-state"><Package size={32}/><p>No orders yet</p><button className="btn-primary btn-sm" onClick={() => navigate("/dashboard/owner/products")}>Browse products</button></div>
          ) : (
            <div className="order-list">
              {recentOrders.slice(0, 5).map(o => (
                <div key={o.id} className="order-row">
                  <div><strong>Order #{o.id}</strong><span>{o.created_at}</span></div>
                  <span className="order-total">Rs. {Number(o.total).toLocaleString()}</span>
                  <span className={`status-badge status-${o.status?.toLowerCase()}`}>{o.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-grid">
          {[
            { icon: PawPrint, label: "Add a Pet", to: "/dashboard/owner/pets" },
            { icon: CalendarDays, label: "Book Appointment", to: "/dashboard/owner/appointments" },
            { icon: Heart, label: "Health Records", to: "/dashboard/owner/health" },
            { icon: ShoppingBag, label: "Shop Products", to: "/dashboard/owner/products" },
          ].map(a => (
            <button key={a.label} className="action-btn" onClick={() => navigate(a.to)}>
              <a.icon size={20}/><span>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShoppingBag(p) { return <Package {...p}/>; }
