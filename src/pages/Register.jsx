import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, PawPrint, ArrowRight, Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Home } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

const roles = [
  { id: "owner", label: "Pet Owner", desc: "Manage your pets' complete care journey", icon: PawPrint },
  { id: "vet", label: "Veterinarian", desc: "Manage appointments and patient records", icon: User },
  { id: "shelter", label: "Animal Shelter", desc: "List adoptable animals and manage care", icon: Home },
];

export default function RegisterPage() {
  const [role, setRole] = useState("owner");
  const [form, setForm] = useState({ full_name: "", shelter_name: "", contact_person: "", email: "", phone: "", password: "", confirm: "", address: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error("Passwords do not match");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    const payload = { ...form, role };
    delete payload.confirm;
    if (role !== "shelter") delete payload.shelter_name;
    if (role !== "shelter") delete payload.contact_person;
    if (role === "shelter") delete payload.full_name;
    const res = await register(payload);
    setLoading(false);
    if (res.success) {
      toast.success("Account created successfully!");
      const map = { owner: "/dashboard/owner", vet: "/dashboard/vet", shelter: "/dashboard/shelter" };
      navigate(map[role] || "/");
    } else {
      toast.error(res.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <motion.div className="auth-card register-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Link to="/" className="auth-brand">
          <span className="brand-mark"><ShieldCheck size={22}/><PawPrint size={12} className="brand-paw"/></span>
          <span>Fur<span>Shield</span></span>
        </Link>
        <h1>Create your account</h1>
        <p>Join FurShield and start caring better.</p>

        <div className="role-selector">
          {roles.map(r => (
            <button key={r.id} className={`role-opt ${role === r.id ? "active" : ""}`} onClick={() => setRole(r.id)}>
              <r.icon size={18}/><span>{r.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {role === "shelter" ? (
            <>
              <div className="input-group"><Home size={16}/><input placeholder="Shelter name" value={form.shelter_name} onChange={set("shelter_name")} required/></div>
              <div className="input-group"><User size={16}/><input placeholder="Contact person name" value={form.contact_person} onChange={set("contact_person")} required/></div>
            </>
          ) : (
            <div className="input-group"><User size={16}/><input placeholder="Full name" value={form.full_name} onChange={set("full_name")} required/></div>
          )}
          <div className="input-group"><Mail size={16}/><input type="email" placeholder="Email address" value={form.email} onChange={set("email")} required/></div>
          <div className="input-group"><Phone size={16}/><input placeholder="Contact number" value={form.phone} onChange={set("phone")} required/></div>
          <div className="input-group"><MapPin size={16}/><input placeholder="Address" value={form.address} onChange={set("address")} required/></div>
          <div className="input-group"><Lock size={16}/><input type={show ? "text" : "password"} placeholder="Password" value={form.password} onChange={set("password")} required/>
            <button type="button" className="eye-btn" onClick={() => setShow(!show)}>{show ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
          </div>
          <div className="input-group"><Lock size={16}/><input type={show ? "text" : "password"} placeholder="Confirm password" value={form.confirm} onChange={set("confirm")} required/></div>
          <button className="btn-primary auth-btn" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"} <ArrowRight size={16}/>
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
}
