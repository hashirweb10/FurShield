import React, { useState, useEffect } from "react";
import { Package, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  const fetch = () => { api.get('/orders/list.php').then(r => { if (r.success) setOrders(r.data || []); setLoading(false); }); };
  useEffect(() => { fetch(); }, []);

  const viewDetail = async (id) => {
    const r = await api.get(`/orders/detail.php?id=${id}`);
    if (r.success) setDetail(r.data);
  };

  if (loading) return <div className="dash-loading"><div className="spinner"/><p>Loading orders...</p></div>;

  return (
    <div className="page-orders">
      <div className="page-head"><h1>My Orders</h1></div>
      {orders.length === 0 ? (
        <div className="empty-state big"><Package size={48}/><h3>No orders yet</h3><p>Your order history will appear here.</p></div>
      ) : (
        <div className="orders-table-wrap">
          <table className="dash-table">
            <thead><tr><th>Order ID</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td>#{o.id}</td><td>{o.created_at}</td><td>{o.item_count || "-"}</td>
                  <td>Rs. {Number(o.total).toLocaleString()}</td>
                  <td><span className={`status-badge status-${o.status?.toLowerCase()}`}>{o.status}</span></td>
                  <td><button className="btn-sm btn-outline" onClick={() => viewDetail(o.id)}><Eye size={14}/> View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AnimatePresence>
        {detail && (
          <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setDetail(null)}>
            <motion.div className="modal" initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} onClick={e => e.stopPropagation()}>
              <div className="modal-head"><h2>Order #{detail.id}</h2><button onClick={() => setDetail(null)}>✕</button></div>
              <p>Status: <span className={`status-badge status-${detail.status?.toLowerCase()}`}>{detail.status}</span></p>
              <p>Date: {detail.created_at}</p>
              <h4>Items</h4>
              {(detail.items || []).map(i => <div key={i.id} className="order-detail-item"><span>{i.name} x{i.quantity}</span><strong>Rs. {(i.price * i.quantity).toLocaleString()}</strong></div>)}
              <div className="summary-total"><span>Total</span><strong>Rs. {Number(detail.total).toLocaleString()}</strong></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
