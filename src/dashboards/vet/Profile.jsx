import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Lock, Save, GraduationCap } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import api from "../../services/api";

export default function VetProfile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", address: "", specialization: "", experience: "", qualifications: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/users/profile.php').then(r => {
      if (r.success) setForm({ full_name: r.data.name || "", email: r.data.email || "", phone: r.data.phone || "", address: r.data.address || "", specialization: r.data.specialization || "", experience: r.data.experience || "", qualifications: r.data.qualifications || "" });
    });
  }, []);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await api.post('/users/vet_profile.php', form);
    if (res.success) { toast.success("Profile updated!"); updateUser(res.data); }
    else toast.error(res.message);
    setLoading(false);
  };

  return (
    <div className="page-profile">
      <div className="page-head"><h1>My Profile</h1></div>
      <div className="profile-grid">
        <div className="profile-card"><div className="profile-avatar"><User size={40}/></div><h3>{user?.name}</h3><span>{user?.email}</span><small className="role-tag">Veterinarian</small></div>
        <div className="profile-form-card">
          <h3>Professional Information</h3>
          <form onSubmit={handleSave}>
            <label><User size={14}/> Full Name<input value={form.full_name} onChange={set("full_name")}/></label>
            <label><Mail size={14}/> Email<input type="email" value={form.email} onChange={set("email")}/></label>
            <label><Phone size={14}/> Phone<input value={form.phone} onChange={set("phone")}/></label>
            <label><MapPin size={14}/> Address<input value={form.address} onChange={set("address")}/></label>
            <label><GraduationCap size={14}/> Specialization<input value={form.specialization} onChange={set("specialization")} placeholder="e.g. Veterinary Medicine, Surgery"/></label>
            <label>Experience (years)<input value={form.experience} onChange={set("experience")} placeholder="e.g. 8 years"/></label>
            <label>Qualifications<textarea value={form.qualifications} onChange={set("qualifications")} rows={3}/></label>
            <button className="btn-primary" type="submit" disabled={loading}><Save size={14}/> {loading ? "Saving..." : "Save Changes"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
