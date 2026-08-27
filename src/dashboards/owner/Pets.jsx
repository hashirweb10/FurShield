import React, { useState, useEffect } from "react";
import { PawPrint, Plus, Edit, Trash2, X, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { useToast } from "../../components/Toast";

const API_UPLOAD = '/uploads';

export default function Pets() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", species: "Dog", breed: "", age: "", gender: "Male", weight: "", description: "", image: null });
  const toast = useToast();

  const fetchPets = () => {
    api.get('/pets/list.php').then(r => {
      if (r.success) setPets(r.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { fetchPets(); }, []);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target?.value ?? e }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v); });
    if (modal.editId) fd.append('id', modal.editId);
    const res = await api.upload(modal.editId ? '/pets/update.php' : '/pets/create.php', fd);
    if (res.success) {
      toast.success(modal.editId ? "Pet updated!" : "Pet added!");
      setModal(null);
      setForm({ name: "", species: "Dog", breed: "", age: "", gender: "Male", weight: "", description: "", image: null });
      fetchPets();
    } else {
      toast.error(res.message || "Failed to save pet");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this pet?")) return;
    const res = await api.delete(`/pets/delete.php?id=${id}`);
    if (res.success) { toast.success("Pet deleted"); fetchPets(); }
    else toast.error(res.message);
  };

  const openEdit = (pet) => {
    setForm({ name: pet.name, species: pet.species, breed: pet.breed, age: pet.age, gender: pet.gender, weight: pet.weight || "", description: pet.description || "", image: null });
    setModal({ editId: pet.id });
  };

  if (loading) return <div className="dash-loading"><div className="spinner"/><p>Loading pets...</p></div>;

  return (
    <div className="page-pets">
      <div className="page-head">
        <h1>My Pets</h1>
        <button className="btn-primary" onClick={() => { setForm({ name: "", species: "Dog", breed: "", age: "", gender: "Male", weight: "", description: "", image: null }); setModal({ editId: null }); }}>
          <Plus size={16}/> Add Pet
        </button>
      </div>

      {pets.length === 0 ? (
        <div className="empty-state big"><PawPrint size={48}/><h3>No pets yet</h3><p>Add your first pet to start tracking their care.</p>
          <button className="btn-primary" onClick={() => setModal({ editId: null })}><Plus size={16}/> Add Pet</button>
        </div>
      ) : (
        <div className="pet-grid">
          {pets.map(pet => (
            <motion.div key={pet.id} className="pet-card" whileHover={{ y: -4 }}>
              <div className="pet-card-img">
                <img src={pet.image ? `${API_UPLOAD}/${pet.image}` : `https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80`} alt={pet.name}/>
                <div className="pet-card-actions">
                  <button onClick={() => openEdit(pet)}><Edit size={14}/></button>
                  <button onClick={() => handleDelete(pet.id)}><Trash2 size={14}/></button>
                </div>
              </div>
              <div className="pet-card-body">
                <h3>{pet.name}</h3>
                <span>{pet.species} · {pet.breed}</span>
                <p>{pet.age} {pet.age && "old"} {pet.gender && `· ${pet.gender}`}</p>
                {pet.description && <small>{pet.description}</small>}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(null)}>
            <motion.div className="modal" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="modal-head">
                <h2>{modal.editId ? "Edit Pet" : "Add New Pet"}</h2>
                <button onClick={() => setModal(null)}><X size={20}/></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <label>Name<input value={form.name} onChange={set("name")} required placeholder="e.g. Luna"/></label>
                  <label>Species
                    <select value={form.species} onChange={set("species")}>
                      <option>Dog</option><option>Cat</option><option>Bird</option><option>Rabbit</option><option>Hamster</option><option>Fish</option><option>Other</option>
                    </select>
                  </label>
                  <label>Breed<input value={form.breed} onChange={set("breed")} placeholder="e.g. Golden Retriever"/></label>
                  <label>Age<input value={form.age} onChange={set("age")} placeholder="e.g. 3 Years"/></label>
                  <label>Gender
                    <select value={form.gender} onChange={set("gender")}><option>Male</option><option>Female</option></select>
                  </label>
                  <label>Weight (kg)<input type="number" step="0.1" value={form.weight} onChange={set("weight")} placeholder="e.g. 24.5"/></label>
                </div>
                <label>Description<textarea value={form.description} onChange={set("description")} placeholder="Brief description..." rows={3}/></label>
                <label>Photo
                  <div className="file-upload">
                    <Camera size={20}/><span>{form.image?.name || "Choose an image"}</span>
                    <input type="file" accept="image/*" onChange={e => set("image")(e.target.files[0])}/>
                  </div>
                </label>
                <div className="modal-actions">
                  <button type="button" className="btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                  <button type="submit" className="btn-primary">{modal.editId ? "Update Pet" : "Add Pet"}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
