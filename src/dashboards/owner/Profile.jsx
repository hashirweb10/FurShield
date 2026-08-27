import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Lock, Camera, Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import api from "../../services/api";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", address: "" });
  const [pwForm, setPwForm] = useState({ current: "", new_pass: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setForm({ full_name: user.name || "", email: user.email || "", phone: user.phone || "", address: user.address || "" });
  }, [user]);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const setPw = (k) => (e) => setPwForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await api.post('/users/owner_profile.php', form);
    if (res.success) { toast.success("Profile updated!"); updateUser(res.data); }
    else toast.error(res.message);
    setLoading(false);
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_pass !== pwForm.confirm) return toast.error("Passwords do not match");
    setLoading(true);
    const res = await api.post('/users/change_password.php', { current_password: pwForm.current, new_password: pwForm.new_pass });
    if (res.success) { toast.success("Password changed!"); setPwForm({ current: "", new_pass: "", confirm: "" }); }
    else toast.error(res.message);
    setLoading(false);
  };

  return (
    <div className="page-profile">
      <div className="page-head"><h1>My Profile</h1></div>
      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-avatar"><User size={40}/></div>
          <h3>{user?.name || "User"}</h3>
          <span>{user?.email}</span>
          <small className="role-tag">{user?.role === "owner" ? "Pet Owner" : user?.role === "vet" ? "Veterinarian" : "Shelter"}</small>
        </div>
        <div className="profile-form-card">
          <h3>Personal Information</h3>
          <form onSubmit={handleSave}>
            <label><User size={14}/> Full Name<input value={form.full_name} onChange={set("full_name")}/></label>
            <label><Mail size={14}/> Email<input type="email" value={form.email} onChange={set("email")}/></label>
            <label><Phone size={14}/> Phone<input value={form.phone} onChange={set("phone")}/></label>
            <label><MapPin size={14}/> Address<input value={form.address} onChange={set("address")}/></label>
            <button className="btn-primary" type="submit" disabled={loading}><Save size={14}/> {loading ? "Saving..." : "Save Changes"}</button>
          </form>
        </div>
        <div className="profile-form-card">
          <h3>Change Password</h3>
          <form onSubmit={handlePassword}>
            <label><Lock size={14}/> Current Password<input type="password" value={pwForm.current} onChange={setPw("current")} required/></label>
            <label><Lock size={14}/> New Password<input type="password" value={pwForm.new_pass} onChange={setPw("new_pass")} required/></label>
            <label><Lock size={14}/> Confirm Password<input type="password" value={pwForm.confirm} onChange={setPw("confirm")} required/></label>
            <button className="btn-primary" type="submit" disabled={loading}><Lock size={14}/> Change Password</button>
          </form>
        </div>
      </div>
    </div>
  );
}
