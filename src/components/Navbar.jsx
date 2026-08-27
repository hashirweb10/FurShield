import logo from "../assets/logo.jpg";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Bell,
  Menu,
  Search,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const [menu, setMenu] = useState(false);
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);

  const scrollTo = (id) => {
    setMenu(false);

    if (!isHome) {
      navigate("/");

      setTimeout(() => {
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const goGetStarted = () => {
    if (user) {
      const map = {
        owner: "/dashboard/owner",
        vet: "/dashboard/vet",
        shelter: "/dashboard/shelter",
      };

      navigate(map[user.role] || "/");
    } else {
      navigate("/register");
    }
  };

  return (
    <>
      <nav className="nav">
        {/* Logo */}
        <Link
          to="/"
          className="brand"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
        >
          <img
            src={logo}
            alt="FurShield Logo"
            className="drawer-logo"
          />

          <span>
            Fur<span>Shield</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links">
          {[
            ["For Pets", "passport"],
            ["Veterinarians", "vets"],
            ["Adoption", "adoption"],
            ["Care", "care"],
            ["Shop", "shop"],
            ["About", "mission"],
          ].map(([label, id]) => (
            <button key={id} onClick={() => scrollTo(id)}>
              {label}
            </button>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="nav-actions">
          {/* Theme Toggle */}
          <button
            className="icon-btn theme-toggle"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {theme === "light" ? (
              <Moon size={18} />
            ) : (
              <Sun size={18} />
            )}
          </button>

          {/* Search */}
          <button
            className="icon-btn"
            onClick={() => navigate("/products")}
            title="Search"
          >
            <Search size={18} />
          </button>

          {/* Notifications */}
          {user && (
            <button
              className="icon-btn"
              onClick={() =>
                navigate(
                  `/dashboard/${user.role}/notifications`
                )
              }
              title="Notifications"
            >
              <Bell size={18} />
              <i />
            </button>
          )}

          {/* Get Started / Dashboard */}
          <button
            className="nav-cta"
            onClick={goGetStarted}
          >
            {user ? "Dashboard" : "Get Started"}
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu"
          onClick={() => setMenu(true)}
          aria-label="Open menu"
        >
          <Menu />
        </button>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menu && (
          <motion.div
            className="mobile-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
          >
            {/* Close Button */}
            <button
              className="drawer-close"
              onClick={() => setMenu(false)}
              aria-label="Close menu"
            >
              <X />
            </button>

            {/* Mobile Logo */}
            <div className="drawer-brand">
              <img
                src={logo}
                alt="FurShield Logo"
                className="brand-logo"
              />

              <span>FurShield</span>
            </div>

            {/* Mobile Navigation Links */}
            {[
              ["passport", "For Pets"],
              ["vets", "Veterinarians"],
              ["adoption", "Adoption"],
              ["care", "Care"],
              ["shop", "Shop"],
              ["mission", "About"],
              ["contact", "Contact"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
              >
                {label}
                <ArrowRight size={18} />
              </button>
            ))}

            {/* User Navigation */}
            {user ? (
              <button
                onClick={() => {
                  setMenu(false);
                  navigate(`/dashboard/${user.role}`);
                }}
              >
                Dashboard
                <ArrowRight size={18} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMenu(false);
                    navigate("/login");
                  }}
                >
                  Login
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={() => {
                    setMenu(false);
                    navigate("/register");
                  }}
                >
                  Register
                  <ArrowRight size={18} />
                </button>
              </>
            )}

            {/* Mobile Theme Toggle */}
            <button
              className="drawer-theme"
              onClick={toggleTheme}
            >
              {theme === "light" ? (
                <>
                  <Moon size={18} />
                  Dark Mode
                </>
              ) : (
                <>
                  <Sun size={18} />
                  Light Mode
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}