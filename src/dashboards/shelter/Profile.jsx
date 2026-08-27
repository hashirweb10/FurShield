import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Save, Home, Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import api from "../../services/api";

export default function ShelterProfile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ shelter_name: "", contact_person: "", email: "", phone: "", address: "", description: "", operating_hours: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/users/profile.php').then(r => {
      if (r.success) setForm({ shelter_name: r.data.shelter_name || "", contact_person: r.data.name || "", email: r.data.email || "", phone: r.data.phone || "", address: r.data.address || "", description: r.data.description || "", operating_hours: r.data.operating_hours || "" });
    });
  }, []);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await api.post('/users/shelter_profile.php', form);
    if (res.success) { toast.success("Profile updated!"); updateUser(res.data); }
    else toast.error(res.message);
    setLoading(false);
  };

  return (
    <div className="page-profile">
      <div className="page-head"><h1>Shelter Profile</h1></div>
      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-avatar"><Home size={40}/></div>
          <h3>{user?.name}</h3>
          <span>{user?.email}</span>
          <small className="role-tag">Animal Shelter</small>
        </div>
        <div className="profile-form-card">
          <h3>Shelter Information</h3>
          <form onSubmit={handleSave}>
            <label><Home size={14}/> Shelter Name<input value={form.shelter_name} onChange={set("shelter_name")}/></label>
            <label><User size={14}/> Contact Person<input value={form.contact_person} onChange={set("contact_person")}/></label>
            <label><Mail size={14}/> Email<input type="email" value={form.email} onChange={set("email")}/></label>
            <label><Phone size={14}/> Phone<input value={form.phone} onChange={set("phone")}/></label>
            <label><MapPin size={14}/> Address<input value={form.address} onChange={set("address")}/></label>
            <label><Clock size={14}/> Operating Hours<input value={form.operating_hours} onChange={set("operating_hours")} placeholder="e.g. Mon-Sat 9AM-6PM"/></label>
            <label>Description<textarea value={form.description} onChange={set("description")} rows={3} placeholder="Tell people about your shelter..."/></label>
            <button className="btn-primary" type="submit" disabled={loading}><Save size={14}/> {loading ? "Saving..." : "Save Changes"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
