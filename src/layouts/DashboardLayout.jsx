import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, PawPrint, LayoutDashboard, Heart, CalendarDays, Stethoscope,
  ShoppingBag, ShoppingCart, Package, Home, Leaf, Bell, MessageCircle,
  Star, User, Settings, LogOut, Menu, X, Sun, Moon, ChevronDown, Activity,
  ClipboardList, Users, Clock
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const navConfig = {
  owner: [
    { to: "/dashboard/owner", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/dashboard/owner/pets", icon: PawPrint, label: "My Pets" },
    { to: "/dashboard/owner/health", icon: Heart, label: "Health Records" },
    { to: "/dashboard/owner/appointments", icon: CalendarDays, label: "Appointments" },
    { to: "/dashboard/owner/vets", icon: Stethoscope, label: "Veterinarians" },
    { to: "/dashboard/owner/products", icon: ShoppingBag, label: "Products" },
    { to: "/dashboard/owner/cart", icon: ShoppingCart, label: "Cart" },
    { to: "/dashboard/owner/orders", icon: Package, label: "Orders" },
    { to: "/dashboard/owner/adoption", icon: Home, label: "Adoption" },
    { to: "/dashboard/owner/care", icon: Leaf, label: "Care Center" },
    { to: "/dashboard/owner/notifications", icon: Bell, label: "Notifications" },
    { to: "/dashboard/owner/chat", icon: MessageCircle, label: "AI Assistant" },
    { to: "/dashboard/owner/reviews", icon: Star, label: "Reviews" },
    { to: "/dashboard/owner/profile", icon: User, label: "Profile" },
  ],
  vet: [
    { to: "/dashboard/vet", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/dashboard/vet/appointments", icon: CalendarDays, label: "Appointments" },
    { to: "/dashboard/vet/patients", icon: PawPrint, label: "Patients" },
    { to: "/dashboard/vet/records", icon: ClipboardList, label: "Medical Records" },
    { to: "/dashboard/vet/availability", icon: Clock, label: "Availability" },
    { to: "/dashboard/vet/reviews", icon: Star, label: "Reviews" },
    { to: "/dashboard/vet/profile", icon: User, label: "Profile" },
  ],
  shelter: [
    { to: "/dashboard/shelter", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/dashboard/shelter/listings", icon: PawPrint, label: "Adoption Listings" },
    { to: "/dashboard/shelter/applications", icon: Users, label: "Applications" },
    { to: "/dashboard/shelter/care", icon: Leaf, label: "Care Logs" },
    { to: "/dashboard/shelter/profile", icon: User, label: "Profile" },
  ],
};

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const role = user?.role || "owner";
  const links = navConfig[role] || navConfig.owner;

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className={`dashboard ${collapsed ? "collapsed" : ""}`}>
      {/* SIDEBAR */}
      <aside className={`dash-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <NavLink to="/" className="brand">
            <span className="brand-mark"><ShieldCheck size={20}/><PawPrint size={10} className="brand-paw"/></span>
            {!collapsed && <span>Fur<span>Shield</span></span>}
          </NavLink>
          <button className="collapse-btn desktop-only" onClick={() => setCollapsed(!collapsed)}>
            <ChevronDown size={16} style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(90deg)", transition: "0.3s" }}/>
          </button>
        </div>

        {!collapsed && (
          <div className="sidebar-user">
            <div className="user-avatar">{user?.name?.[0] || user?.email?.[0] || "U"}</div>
            <div className="user-info">
              <strong>{user?.name || "User"}</strong>
              <small>{role === "owner" ? "Pet Owner" : role === "vet" ? "Veterinarian" : "Animal Shelter"}</small>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {links.map(link => (
            <NavLink key={link.to} to={link.to} end={link.end}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              <link.icon size={18}/>
              {!collapsed && <span>{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={toggleTheme}>
            {theme === "light" ? <Moon size={18}/> : <Sun size={18}/>}
            {!collapsed && <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>}
          </button>
          <button className="sidebar-link logout" onClick={handleLogout}>
            <LogOut size={18}/>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="dash-main">
        <header className="dash-topbar">
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22}/> : <Menu size={22}/>}
          </button>
          <div className="topbar-title">
            <h2>{links.find(l => l.to === location.pathname)?.label || "Dashboard"}</h2>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn" onClick={() => navigate(`/dashboard/${role}`)}><Bell size={18}/></button>
            <button className="icon-btn" onClick={toggleTheme}>
              {theme === "light" ? <Moon size={18}/> : <Sun size={18}/>}
            </button>
          </div>
        </header>
        <div className="dash-content">
          {children}
        </div>
      </div>

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="sidebar-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}/>
        )}
      </AnimatePresence>
    </div>
  );
}
