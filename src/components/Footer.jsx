import React from "react";
import { useNavigate } from "react-router-dom";
import { PawPrint, ShieldCheck } from "lucide-react";

export default function Footer({ onOpenAssistant }) {
  const navigate = useNavigate();

  const scrollTo = (id) => {
    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-brand">
        <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <span className="brand-mark"><ShieldCheck size={22}/><PawPrint size={12} className="brand-paw"/></span>
          <span>Fur<span>Shield</span></span>
        </button>
        <p>Every Paw & Wing Deserves a Shield of Love.</p>
      </div>
      <div className="footer-cols">
        <div>
          <b>Platform</b>
          <button onClick={() => scrollTo("passport")}>For Pets</button>
          <button onClick={() => scrollTo("vets")}>Veterinarians</button>
          <button onClick={() => scrollTo("adoption")}>Adoption</button>
          <button onClick={() => scrollTo("care")}>Care</button>
          <button onClick={() => navigate("/products")}>Shop</button>
        </div>
        <div>
          <b>Company</b>
          <button onClick={() => scrollTo("mission")}>About</button>
          <button onClick={() => scrollTo("contact")}>Contact</button>
          <button>Privacy</button>
          <button>Terms</button>
        </div>
        <div>
          <b>Support</b>
          <button>Help center</button>
          <button>FAQ</button>
          <button onClick={() => onOpenAssistant && onOpenAssistant(true)}>Ask FurShield</button>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; 2026 FurShield</span>
        <span>Designed with care for every companion.</span>
      </div>
    </footer>
  );
}
