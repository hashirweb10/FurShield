import React, { useState, useEffect } from "react";
import { PawPrint, Plus, Edit, Trash2, X, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { useToast } from "../../components/Toast";
const img = (src) => src ? (src.startsWith('http') ? src : `/uploads/${src}`) : "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=400&q=80";

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", species: "Dog", breed: "", age: "", gender: "Male", health_status: "Healthy", description: "", adoption_status: "available", image: null });
  const toast = useToast();

  const fetch = () => { api.get('/adoption/shelter_listings.php').then(r => { if (r.success) setListings(r.data || []); setLoading(false); }); };
  useEffect(() => { fetch(); }, []);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target?.value ?? e }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v); });
    if (modal?.editId) fd.append('id', modal.editId);
    const res = await api.upload(modal?.editId ? '/adoption/update_listing.php' : '/adoption/create_listing.php', fd);
    if (res.success) { toast.success(modal?.editId ? "Listing updated!" : "Listing created!"); setModal(null); fetch(); }
    else toast.error(res.message);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this listing?")) return;
    const res = await api.delete(`/adoption/delete_listing.php?id=${id}`);
    if (res.success) { toast.success("Deleted"); fetch(); }
  };

  const openEdit = (l) => {
    setForm({ name: l.name, species: l.species, breed: l.breed, age: l.age, gender: l.gender, health_status: l.health_status, description: l.description, adoption_status: l.adoption_status, image: null });
    setModal({ editId: l.id });
  };

  if (loading) return <div className="dash-loading"><div className="spinner"/><p>Loading...</p></div>;

  return (
    <div className="page-listings">
      <div className="page-head"><h1>Adoption Listings</h1><button className="btn-primary" onClick={() => { setForm({ name: "", species: "Dog", breed: "", age: "", gender: "Male", health_status: "Healthy", description: "", adoption_status: "available", image: null }); setModal({}); }}><Plus size={16}/> Add Listing</button></div>
      {listings.length === 0 ? <div className="empty-state big"><PawPrint size={48}/><h3>No listings yet</h3></div> : (
        <div className="pet-grid">{listings.map(l => (
          <div key={l.id} className="pet-card">
            <div className="pet-card-img"><img src={img(l.image)} alt={l.name}/>
              <div className="pet-card-actions"><button onClick={() => openEdit(l)}><Edit size={14}/></button><button onClick={() => handleDelete(l.id)}><Trash2 size={14}/></button></div>
            </div>
            <div className="pet-card-body"><h3>{l.name}</h3><span>{l.species} · {l.breed}</span><p>{l.age} · {l.gender}</p><span className={`status-badge status-${l.adoption_status}`}>{l.adoption_status}</span></div>
          </div>
        ))}</div>
      )}
      <AnimatePresence>
        {modal && (
          <motion.div className="modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setModal(null)}>
            <motion.div className="modal" initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} onClick={e=>e.stopPropagation()}>
              <div className="modal-head"><h2>{modal.editId ? "Edit" : "Add"} Listing</h2><button onClick={() => setModal(null)}><X size={20}/></button></div>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <label>Name<input value={form.name} onChange={set("name")} required/></label>
                  <label>Species<select value={form.species} onChange={set("species")}><option>Dog</option><option>Cat</option><option>Bird</option><option>Rabbit</option><option>Other</option></select></label>
                  <label>Breed<input value={form.breed} onChange={set("breed")}/></label>
                  <label>Age<input value={form.age} onChange={set("age")}/></label>
                  <label>Gender<select value={form.gender} onChange={set("gender")}><option>Male</option><option>Female</option></select></label>
                  <label>Health Status<select value={form.health_status} onChange={set("health_status")}><option>Healthy</option><option>Under Treatment</option><option>Special Needs</option><option>Recovering</option></select></label>
                </div>
                <label>Adoption Status<select value={form.adoption_status} onChange={set("adoption_status")}><option value="available">Available</option><option value="pending">Pending</option><option value="adopted">Adopted</option><option value="not_available">Not Available</option></select></label>
                <label>Description<textarea value={form.description} onChange={set("description")} rows={3}/></label>
                <label>Photo<div className="file-upload"><Camera size={20}/><span>{form.image?.name || "Choose image"}</span><input type="file" accept="image/*" onChange={e => set("image")(e.target.files[0])}/></div></label>
                <div className="modal-actions"><button type="button" className="btn-ghost" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="btn-primary">{modal.editId ? "Update" : "Create"}</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
