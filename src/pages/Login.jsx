import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, PawPrint, ArrowRight, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill in all fields");
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      toast.success("Welcome back!");
      const map = { owner: "/dashboard/owner", vet: "/dashboard/vet", shelter: "/dashboard/shelter" };
      navigate(map[res.data.role] || "/");
    } else {
      toast.error(res.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <motion.div className="auth-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Link to="/" className="auth-brand">
          <span className="brand-mark"><ShieldCheck size={22}/><PawPrint size={12} className="brand-paw"/></span>
          <span>Fur<span>Shield</span></span>
        </Link>
        <h1>Welcome back</h1>
        <p>Sign in to continue to your dashboard.</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <Mail size={16}/><input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required/>
          </div>
          <div className="input-group">
            <Lock size={16}/><input type={show ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required/>
            <button type="button" className="eye-btn" onClick={() => setShow(!show)}>{show ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
          </div>
          <button className="btn-primary auth-btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"} <ArrowRight size={16}/>
          </button>
        </form>
        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
        <div className="demo-creds">
          <small><strong>Demo Accounts</strong> (password: password123)</small><br/>
          <small>Owner: sarah@furshield.com</small><br/>
          <small>Vet: dr.sarah@furshield.com</small><br/>
          <small>Shelter: paws@furshield.com</small>
        </div>
      </motion.div>
    </div>
  );
}
