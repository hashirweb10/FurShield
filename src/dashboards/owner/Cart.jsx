import React, { useState, useEffect } from "react";
import { ShoppingCart, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useToast } from "../../components/Toast";

const UPLOAD = '/uploads';
const img = (src) => src ? (src.startsWith('http') ? src : `${UPLOAD}/${src}`) : "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=200&q=80";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  const fetch = () => {
    api.get('/cart/list.php').then(r => {
      if (r.success) setItems(r.data || []);
      setLoading(false);
    });
  };
  useEffect(() => { fetch(); }, []);

  const updateQty = async (itemId, qty) => {
    if (qty < 1) return removeItem(itemId);
    const res = await api.post('/cart/update_quantity.php', { item_id: itemId, quantity: qty });
    if (res.success) fetch();
    else toast.error(res.message);
  };

  const removeItem = async (itemId) => {
    const res = await api.post('/cart/remove.php', { item_id: itemId });
    if (res.success) { toast.success("Item removed"); fetch(); }
  };

  const clearCart = async () => {
    const res = await api.post('/cart/clear.php');
    if (res.success) { toast.success("Cart cleared"); fetch(); }
  };

  const placeOrder = async () => {
    if (items.length === 0) return toast.error("Cart is empty");
    const res = await api.post('/orders/place.php');
    if (res.success) { toast.success("Order placed successfully!"); navigate("/dashboard/owner/orders"); }
    else toast.error(res.message || "Could not place order");
  };

  const subtotal = items.reduce((s, i) => s + (i.price * i.quantity), 0);

  if (loading) return <div className="dash-loading"><div className="spinner"/><p>Loading cart...</p></div>;

  if (items.length === 0) return (
    <div className="page-cart">
      <div className="empty-state big"><ShoppingCart size={48}/><h3>Your cart is empty</h3><p>Browse products and add items to your cart.</p>
        <button className="btn-primary" onClick={() => navigate("/dashboard/owner/products")}>Browse Products</button>
      </div>
    </div>
  );

  return (
    <div className="page-cart">
      <div className="page-head"><h1>Shopping Cart</h1><button className="btn-ghost btn-sm" onClick={clearCart}>Clear Cart</button></div>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-img"><img src={img(item.image)} alt={item.name}/></div>
              <div className="cart-item-info"><h4>{item.name}</h4><span>Rs. {Number(item.price).toLocaleString()}</span></div>
              <div className="cart-item-qty">
                <button onClick={() => updateQty(item.id, item.quantity - 1)}><Minus size={14}/></button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQty(item.id, item.quantity + 1)}><Plus size={14}/></button>
              </div>
              <strong>Rs. {(item.price * item.quantity).toLocaleString()}</strong>
              <button className="cart-remove" onClick={() => removeItem(item.id)}><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Subtotal ({items.length} items)</span><strong>Rs. {subtotal.toLocaleString()}</strong></div>
          <div className="summary-row"><span>Delivery</span><span>Free</span></div>
          <div className="summary-total"><span>Total</span><strong>Rs. {subtotal.toLocaleString()}</strong></div>
          <button className="btn-primary btn-full" onClick={placeOrder}>Place Order</button>
        </div>
      </div>
    </div>
  );
}
