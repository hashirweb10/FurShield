import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, CalendarDays, Check, Heart, MapPin, PawPrint, ShieldCheck,
  ShoppingBag, Sparkles, Stethoscope, Syringe, Star, Leaf, Activity, Home,
  Shield, Send, X, MessageCircle, Utensils, Scissors, Dumbbell, GraduationCap,
  Bone, Search
} from "lucide-react";
import Reveal from "../components/Reveal";
import SectionTitle from "../components/SectionTitle";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const fallbackPets = [
  { name: "Luna", breed: "Golden Retriever", age: "3 Years", image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1000&q=85", score: 94 },
  { name: "Milo", breed: "Mixed Breed", age: "2 Years", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=85", score: 91 },
  { name: "Coco", breed: "Persian Cat", age: "1 Year", image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=1000&q=85", score: 96 }
];
const fallbackVets = [
  { name: "Dr. Sarah Ahmed", spec: "Veterinary Medicine", rating: "4.9", distance: "2.4 km", available: "Today" },
  { name: "Dr. Hamza Khan", spec: "Pet Surgery", rating: "4.8", distance: "3.1 km", available: "Tomorrow" },
  { name: "Dr. Ayesha Malik", spec: "Dermatology", rating: "4.9", distance: "4.7 km", available: "Today" }
];
const fallbackProducts = [
  { name: "Premium Adult Dog Food", cat: "Nutrition", price: "Rs. 4,850", image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=700&q=80" },
  { name: "Gentle Pet Shampoo", cat: "Grooming", price: "Rs. 1,450", image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=700&q=80" },
  { name: "Interactive Chew Toy", cat: "Toys", price: "Rs. 1,100", image: "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&w=700&q=80" }
];
const fallbackAdoptable = [
  { name: "Milo", breed: "Mixed Breed", age: "2 Years", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1000&q=85" },
  { name: "Bella", breed: "Cockatiel", age: "2 Years", image: "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=900&q=85" },
  { name: "Simba", breed: "Labrador", age: "4 Years", image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=85" }
];

function Role({ icon: Icon, title, text, tag, dark }) {
  return (
    <motion.div className={"role " + (dark ? "role-dark" : "")} whileHover={{ y: -7 }}>
      <div className="role-top"><span className="role-icon"><Icon size={21}/></span><span>{tag}</span></div>
      <h3>{title}</h3><p>{text}</p>
      <button>Explore experience <ArrowRight size={15}/></button>
      <div className="role-line"/>
    </motion.div>
  );
}

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, 80]);
  const [assistant, setAssistant] = useState(false);
  const [activePet, setActivePet] = useState(0);
  const [care, setCare] = useState("Grooming");
  const [cart, setCart] = useState(0);
  const [liked, setLiked] = useState(false);
  const [pets, setPets] = useState(fallbackPets);
  const [vets, setVets] = useState(fallbackVets);
  const [products, setProducts] = useState(fallbackProducts);
  const [adoptable, setAdoptable] = useState(fallbackAdoptable);
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = assistant ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [assistant]);

  // Load public API data safely. If an endpoint fails or returns an
  // unexpected shape, the premium fallback content remains visible.
  useEffect(() => {
    api.get('/products/list.php')
      .then(r => {
        if (r?.success && Array.isArray(r.data) && r.data.length) setProducts(r.data);
      })
      .catch(() => {});

    api.get('/vets/list.php')
      .then(r => {
        if (r?.success && Array.isArray(r.data) && r.data.length) setVets(r.data);
      })
      .catch(() => {});

    api.get('/adoption/listings.php')
      .then(r => {
        if (r?.success && Array.isArray(r.data) && r.data.length) setAdoptable(r.data);
      })
      .catch(() => {});
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatMsgs(prev => [...prev, { role: "user", text: msg }]);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await api.post('/chat.php', { message: msg, history: chatMsgs });
      setChatMsgs(prev => [...prev, {
        role: "assistant",
        text: res?.success ? (res?.data?.reply || "I'm here to help with your pet-care questions.") : "Sorry, I couldn't process that right now."
      }]);
    } catch {
      setChatMsgs(prev => [...prev, { role: "assistant", text: "Connection error. Please try again." }]);
    }
    setChatLoading(false);
  };

  const activePetData = pets[activePet] || fallbackPets[0];
  const featuredAdoption = adoptable[0] || fallbackAdoptable[0];

  return (
    <>
      <main>
        {/* HERO */}
        <section id="home" className="hero">
          <motion.div className="hero-orb orb-one" style={{ y: heroY }}/>
          <motion.div className="hero-orb orb-two" style={{ y: heroY }}/>
          <div className="hero-copy">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="eyebrow"><span className="pulse-dot"/> THE COMPLETE PET-CARE ECOSYSTEM</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
              One home for <em>every part</em> of their care.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}>
              Health, appointments, care, adoption and everyday essentials — beautifully connected in one place.
            </motion.p>
            <motion.div className="hero-actions" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
              <button className="btn-primary" onClick={() => scrollTo("passport")}>Explore FurShield <ArrowRight size={17}/></button>
              <button className="btn-ghost" onClick={() => scrollTo("ecosystem")}><span className="play">▶</span> See how it works</button>
            </motion.div>
            <motion.div className="hero-proof" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
              <span><Check/> Health tracking</span><span><Check/> Vet appointments</span><span><Check/> Adoption</span>
            </motion.div>
          </div>
          <div className="hero-visual">
            <motion.div className="hero-image-wrap" initial={{ opacity: 0, scale: 0.9, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
              <img src={activePetData.image} alt="Luna the golden retriever"/>
              <div className="image-shape"/>
            </motion.div>
            <motion.div className="float-card health-card" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.65 }}>
              <div className="mini-icon green"><Activity size={16}/></div>
              <div><small>HEALTH SCORE</small><strong>94%</strong><span>Healthy</span></div>
            </motion.div>
            <motion.div className="float-card appt-card" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
              <div className="mini-icon coral"><CalendarDays size={16}/></div>
              <div><small>NEXT VISIT</small><strong>Today · 4:30</strong><span>Dr. Sarah Ahmed</span></div>
            </motion.div>
            <motion.div className="float-card vaccine-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }}>
              <Syringe size={15}/><span>Rabies · Due tomorrow</span><Check size={14}/>
            </motion.div>
            <div className="hero-sticker"><Shield size={15}/> <span>Protected by FurShield</span></div>
          </div>
        </section>

        {/* ECOSYSTEM */}
        <section id="ecosystem" className="ecosystem section">
          <SectionTitle eyebrow="CONNECTED CARE" title={<>One pet. One journey.<br/><i>Everything connected.</i></>}>
            FurShield brings every important part of a companion's life into one calm, organized experience.
          </SectionTitle>
          <div className="orbit">
            <div className="orbit-ring ring-a"/><div className="orbit-ring ring-b"/>
            <motion.div className="orbit-pet" whileHover={{ scale: 1.04 }}>
              <img src={activePetData.image} alt="Luna"/>
              <span className="shield-small"><ShieldCheck size={18}/></span>
              <strong>{activePetData.name}</strong><small>{activePetData.breed} · {activePetData.age}</small>
            </motion.div>
            {[
              ["Health", Activity, "health", 0], ["Appointments", CalendarDays, "appt", 1], ["Vets", Stethoscope, "vet", 2],
              ["Care", Leaf, "care", 3], ["Adoption", Home, "adopt", 4], ["Essentials", ShoppingBag, "shop", 5]
            ].map(([name, Icon, cls]) => (
              <motion.button key={name} className={"orbit-node " + cls} whileHover={{ scale: 1.08 }}
                onClick={() => scrollTo(cls === "health" ? "health" : cls === "vet" ? "vets" : cls === "adopt" ? "adoption" : cls === "shop" ? "shop" : "care")}>
                <Icon size={18}/><span>{name}</span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* PASSPORT */}
        <section id="passport" className="passport section">
          <div className="passport-intro">
            <SectionTitle eyebrow="SIGNATURE FEATURE" title={<>Their entire story.<br/><i>One beautiful passport.</i></>}>
              A living timeline for vaccinations, checkups, treatments, grooming and every milestone that matters.
            </SectionTitle>
            <div className="pet-switcher">
              {pets.map((p, i) => (
                <button className={activePet === i ? "active" : ""} key={p.name || i} onClick={() => setActivePet(i)}>
                  <img src={p.image} alt=""/><span>{p.name || "Pet"}</span>
                </button>
              ))}
            </div>
          </div>
          <Reveal className="passport-card">
            <div className="passport-top">
              <div className="passport-avatar"><img src={activePetData.image} alt=""/></div>
              <div><span className="label">DIGITAL PET PASSPORT</span><h3>{activePetData.name}</h3><p>{activePetData.breed} · {activePetData.age}</p></div>
              <div className="passport-seal"><ShieldCheck size={20}/><span>VERIFIED<br/>CARE</span></div>
            </div>
            <div className="timeline">
              {[
                ["Born", "2023", "birth"], ["Vaccination", "May 2025", "vaccine"], ["Checkup", "Aug 2025", "check"],
                ["Treatment", "Jan 2026", "treat"], ["Grooming", "Aug 2026", "groom"], ["Next Visit", "Sep 2026", "next"]
              ].map(([a, b], i) => (
                <div className={"timeline-item " + (i === 5 ? "next" : "")} key={a}>
                  <div className="timeline-dot">{i < 5 ? <Check size={13}/> : <CalendarDays size={13}/>}</div>
                  <small>{a}</small><strong>{b}</strong>
                </div>
              ))}
            </div>
            <div className="passport-detail">
              <div><span>RECENT MILESTONE</span><strong>Annual vaccination</strong><small>Rabies vaccine · Dr. Sarah Ahmed · 14 May 2026</small></div>
              <button>View record <ArrowRight size={16}/></button>
            </div>
          </Reveal>
        </section>

        {/* HEALTH */}
        <section id="health" className="health section">
          <div className="health-glow"/>
          <SectionTitle dark eyebrow="HEALTH, AT A GLANCE" title={<>Know how they're doing.<br/><i>Before they say a word.</i></>}>
            A clear picture of wellbeing, built around the records and routines that matter.
          </SectionTitle>
          <div className="health-grid">
            <Reveal className="score-card">
              <div className="score-ring">
                <svg viewBox="0 0 180 180"><circle cx="90" cy="90" r="72"/><motion.circle className="progress" cx="90" cy="90" r="72" initial={{ pathLength: 0 }} whileInView={{ pathLength: 0.94 }} viewport={{ once: true }}/></svg>
                <div><strong>94</strong><span>/ 100</span></div>
              </div>
              <span className="score-label"><span className="status-dot"/> FURSHIELD SCORE</span>
              <p>Excellent wellbeing. Luna's core care is on track.</p>
            </Reveal>
            <div className="metric-grid">
              {[
                [Syringe, "Vaccinations", "Up to date", "green"], [Activity, "Weight", "24.8 kg", "mint"],
                [Stethoscope, "Last checkup", "12 Aug", "coral"], [CalendarDays, "Next visit", "12 Sep", "gold"]
              ].map(([I, a, b, c], i) => (
                <Reveal delay={i * 0.07} className="metric" key={a}>
                  <div className={"metric-icon " + c}><I size={18}/></div><span>{a}</span><strong>{b}</strong>
                </Reveal>
              ))}
              <div className="health-insight"><Sparkles size={17}/><span><b>Care insight</b> Luna's grooming is due in 4 days.</span><ArrowRight size={16}/></div>
            </div>
          </div>
        </section>

        {/* VETS */}
        <section id="vets" className="vets section">
          <div className="vet-head">
            <SectionTitle eyebrow="VETERINARIANS" title={<>The right vet.<br/><i>Right when they need one.</i></>}/>
            <button className="btn-outline" onClick={() => navigate("/vets")}>Explore vets <ArrowRight size={16}/></button>
          </div>
          <div className="vet-discovery">
            <div className="vet-map">
              <div className="map-grid"/><div className="map-road r1"/><div className="map-road r2"/><div className="map-road r3"/>
              <div className="map-pin user"><PawPrint size={15}/></div>
              <div className="map-pin p1"><Stethoscope size={15}/></div>
              <div className="map-pin p2"><Stethoscope size={15}/></div>
              <div className="map-pin p3"><Stethoscope size={15}/></div>
              <div className="map-label"><MapPin size={14}/> Nearby care</div>
            </div>
            <div className="vet-list">
              <div className="search-box"><Search size={17}/><span>Search condition, specialty or location…</span></div>
              <div className="filters"><button className="active">Nearby</button><button>Available today</button><button>Top rated</button></div>
              {vets.map((v, i) => {
                const vetName = v?.name || v?.full_name || v?.fullName || "Veterinarian";
                const vetSpec = v?.spec || v?.specialization || v?.specialty || "Veterinary Care";
                const vetRating = v?.rating ?? v?.average_rating ?? "—";
                const vetDistance = v?.distance || "Nearby";
                const vetAvailable = v?.available || v?.availability || "Available";
                const initials = vetName
                  .trim()
                  .split(/\s+/)
                  .map(x => x[0])
                  .filter(Boolean)
                  .join("")
                  .slice(-2)
                  .toUpperCase();

                return (
                  <Reveal delay={i * 0.06} className="vet-row" key={v?.id || vetName || i}>
                    <div className="vet-avatar">{initials || "VT"}</div>
                    <div className="vet-info">
                      <strong>{vetName}</strong>
                      <span>{vetSpec}</span>
                      <small><Star size={12} fill="currentColor"/> {vetRating} · {vetDistance}</small>
                    </div>
                    <div className="available"><span/> {vetAvailable}</div>
                    <button className="circle-arrow"><ArrowRight size={16}/></button>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* APPOINTMENT */}
        <section className="appointment section">
          <div className="appointment-copy">
            <span className="eyebrow">EFFORTLESS APPOINTMENTS</span>
            <h2>Better care starts with the <i>right appointment.</i></h2>
            <p>From finding a trusted veterinarian to choosing a time that fits, make the next step feel simple.</p>
            <button className="btn-primary" onClick={() => navigate("/login")}>Book an appointment <ArrowRight size={17}/></button>
          </div>
          <div className="booking-card">
            <div className="booking-step"><span>01</span><div><small>YOUR PET</small><strong>Luna</strong></div><Check/></div>
            <div className="booking-step"><span>02</span><div><small>VETERINARIAN</small><strong>Dr. Sarah Ahmed</strong></div><Check/></div>
            <div className="calendar-head"><span>SEPTEMBER 2026</span><div><button>‹</button><button>›</button></div></div>
            <div className="days">{["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i}>{d}</span>)}</div>
            <div className="dates">{[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map(d => <button className={d === 12 ? "selected" : ""} key={d}>{d}</button>)}</div>
            <div className="times"><span>AVAILABLE TIMES</span><div><button>09:00</button><button>10:30</button><button className="selected">04:30</button><button>06:00</button></div></div>
          </div>
        </section>

        {/* ADOPTION */}
        <section id="adoption" className="adoption section">
          <div className="adoption-bg"/>
          <div className="adoption-head">
            <SectionTitle eyebrow="ADOPTION" title={<>Maybe your best friend<br/><i>is waiting.</i></>}>
              <span>Give a companion a second chapter — and make room for a new kind of love.</span>
            </SectionTitle>
            <button className="btn-light" onClick={() => navigate("/adoption")}>Meet adoptable pets <ArrowRight size={16}/></button>
          </div>
          <div className="adoption-grid">
            <div className="featured-pet">
              <img src={featuredAdoption.image} alt={featuredAdoption.name || "Adoptable pet"}/>
              <button className={"heart-btn " + (liked ? "liked" : "")} onClick={() => setLiked(!liked)}><Heart fill={liked ? "currentColor" : "none"}/></button>
              <div className="pet-caption">
                <div><span>FEATURED MATCH</span><h3>{featuredAdoption.name || "Milo"}</h3><p>{featuredAdoption.breed || "Mixed Breed"} · {featuredAdoption.age || "2 Years"} · Healthy</p></div>
                <div className="match">92%<small>match</small></div>
              </div>
            </div>
            {adoptable.slice(1).map((p, i) => (
              <div className="mini-adopt" key={p?.id || p?.name || i}>
                <img src={p?.image} alt={p?.name || "Adoptable pet"}/>
                <div><strong>{p?.name || "Pet"}</strong><span>{p?.breed || "Mixed Breed"} · {p?.age || "Age unknown"}</span><button>Meet {p?.name || "Pet"} <ArrowRight size={14}/></button></div>
              </div>
            ))}
          </div>
        </section>

        {/* CARE */}
        <section id="care" className="care section">
          <SectionTitle eyebrow="EVERYDAY CARE" title={<>Better care starts with<br/><i>little things.</i></>}>
            Simple guidance for the routines that make a difference every day.
          </SectionTitle>
          <div className="care-tabs">
            {[
              ["Feeding", Utensils, "Balanced routines"], ["Hygiene", Leaf, "Fresh & healthy"], ["Exercise", Dumbbell, "Move with joy"],
              ["Vaccination", Syringe, "Stay protected"], ["Grooming", Scissors, "Look & feel good"], ["Training", GraduationCap, "Grow together"]
            ].map(([x, I, sub]) => (
              <button className={care === x ? "active" : ""} onMouseEnter={() => setCare(x)} onClick={() => setCare(x)} key={x}>
                <I size={18}/><span>{x}</span><small>{sub}</small>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div className="care-feature" key={care} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="care-photo"><img src={activePetData.image} alt="Pet care"/><span className="floating-tag"><Sparkles size={14}/> Curated for better care</span></div>
              <div className="care-copy">
                <span className="eyebrow">CARE GUIDE · {care.toUpperCase()}</span>
                <h3>{care === "Grooming" ? "A little grooming goes a long way." : care === "Feeding" ? "Good nutrition builds better days." : care === "Exercise" ? "Happy paws need room to move." : care === "Vaccination" ? "Protection starts with staying on schedule." : care === "Hygiene" ? "Clean routines support healthy lives." : "Small lessons become lifelong habits."}</h3>
                <p>Practical, easy-to-follow guidance designed around real routines — so caring feels less like another task and more like time well spent together.</p>
                <button className="text-link">Read the guide <ArrowRight size={16}/></button>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* SHOP */}
        <section id="shop" className="shop section">
          <div className="shop-head">
            <SectionTitle eyebrow="PET ESSENTIALS" title={<>Good care has the<br/><i>right essentials.</i></>}/>
            <div className="shop-cats"><button className="active">All</button><button>Nutrition</button><button>Grooming</button><button>Toys</button></div>
          </div>
          <div className="products">
            {products.map((p, i) => (
              <Reveal delay={i * 0.08} className={"product " + (i === 0 ? "featured" : "")} key={p?.id || p?.name || i}>
                <div className="product-image">
                  <img src={p?.image} alt={p?.name || "Pet product"}/><span>{p?.cat || p?.category || "Essentials"}</span>
                  <button onClick={() => setCart(cart + 1)}><ShoppingBag size={16}/></button>
                </div>
                <div className="product-meta"><div><strong>{p?.name || "Pet essential"}</strong><span><Star size={12} fill="currentColor"/> 4.8</span></div><b>{p?.price || "Price unavailable"}</b></div>
              </Reveal>
            ))}
          </div>
          <div className="shop-foot">
            <span><ShieldCheck size={17}/> Curated with care</span>
            <span><ShoppingBag size={17}/> Thoughtful essentials</span>
            <button className="btn-outline" onClick={() => navigate("/products")}>Explore all products <ArrowRight size={16}/></button>
          </div>
        </section>

        {/* ROLES */}
        <section className="roles section">
          <SectionTitle eyebrow="ONE ECOSYSTEM" title={<>One platform.<br/><i>Three perspectives.</i></>}/>
          <div className="role-grid">
            <Role icon={PawPrint} title="Pet Owners" text="A calmer way to manage their complete care journey." tag="FOR PET PARENTS"/>
            <Role icon={Stethoscope} title="Veterinarians" text="Better context, clearer history, more informed care." tag="FOR VETERINARIANS" dark/>
            <Role icon={Home} title="Animal Shelters" text="More visibility, better records, more forever homes." tag="FOR SHELTERS"/>
          </div>
        </section>

        {/* SMART CARE */}
        <section className="smart section">
          <div className="smart-copy"><span className="eyebrow">SMART CARE</span><h2>Nothing important<br/><i>gets forgotten.</i></h2><p>Gentle reminders keep health, appointments and everyday routines moving without adding noise.</p></div>
          <div className="notifications">
            {[
              [Syringe, "Vaccination due tomorrow", "Luna · Rabies vaccine", "2m ago", "coral"],
              [CalendarDays, "Vet appointment confirmed", "Today · 4:30 PM", "12m ago", "mint"],
              [Scissors, "Grooming is coming up", "In 4 days · Luna", "1h ago", "gold"]
            ].map(([I, a, b, t, c], i) => (
              <Reveal delay={i * 0.1} className="notification" key={a}>
                <div className={"notif-icon " + c}><I size={17}/></div>
                <div><strong>{a}</strong><span>{b}</span></div><small>{t}</small>
              </Reveal>
            ))}
          </div>
        </section>

        {/* IMPACT */}
        <section className="impact section">
          <div className="impact-top">
            <SectionTitle eyebrow="THE BIGGER PICTURE" title={<>Care that connects.<br/><i>Impact that grows.</i></>}/>
            <p>FurShield is designed to make better pet care feel more accessible, organized and human.</p>
          </div>
          <div className="stats">
            {[["10K+", "Pet profiles"], ["2.5K+", "Health records"], ["850+", "Vet connections"], ["500+", "Adoption stories"]].map(([n, l], i) => (
              <Reveal delay={i * 0.08} className="stat" key={l}><strong>{n}</strong><span>{l}</span></Reveal>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="testimonials section">
          <SectionTitle eyebrow="REAL REASONS TO CARE" title={<>Made for the people<br/><i>behind every paw.</i></>}/>
          <div className="quotes">
            {[
              ["“Finally, Luna’s health records, appointments and care reminders feel like one story instead of five different places.”", "Sarah M.", "Pet parent · Luna"],
              ["“The idea is beautifully simple: better context means better conversations with the people caring for your pet.”", "Dr. Ayesha M.", "Veterinarian"],
              ["“Every adoption story deserves visibility. FurShield makes the journey feel hopeful from the first hello.”", "Nadia K.", "Shelter volunteer"]
            ].map(([q, n, r], i) => (
              <Reveal delay={i * 0.08} className="quote" key={n}>
                <div className="quote-stars">★★★★★</div><p>{q}</p>
                <div className="quote-person"><span>{n[0]}</span><div><strong>{n}</strong><small>{r}</small></div></div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* MISSION */}
        <section id="mission" className="mission section">
          <div className="mission-image"><img src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1300&q=85" alt="Pet and owner"/></div>
          <div className="mission-copy">
            <span className="eyebrow">OUR MISSION</span>
            <h2>Technology should make <i>caring feel easier.</i></h2>
            <p>We believe every pet deserves organized care, timely attention and a better chance at a healthy, happy life.</p>
            <div className="mission-badge"><ShieldCheck size={21}/><span>Every Paw & Wing<br/><b>Deserves a Shield of Love.</b></span></div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="contact section">
          <div>
            <span className="eyebrow">LET'S CONNECT</span><h2>Let's make pet care<br/><i>better together.</i></h2>
            <p>Questions, ideas or a future partnership? We'd love to hear from you.</p>
            <div className="contact-links"><span><MessageCircle size={17}/> hello@furshield.example</span><span><MapPin size={17}/> Karachi · Pakistan</span></div>
          </div>
          <form className="contact-form" onSubmit={e => e.preventDefault()}>
            <label>Your name<input placeholder="Sarah Ahmed"/></label>
            <label>Email address<input type="email" placeholder="you@example.com"/></label>
            <label>Your message<textarea placeholder="Tell us what you're thinking…"/></label>
            <button className="btn-primary" type="submit">Send message <Send size={16}/></button>
          </form>
        </section>
      </main>

      {/* FLOATING ELEMENTS */}
      <button className="assistant-fab" onClick={() => setAssistant(true)}><span><PawPrint size={19}/></span><b>Ask FurShield</b></button>
      {cart > 0 && <motion.div className="cart-pill" initial={{ scale: 0 }} animate={{ scale: 1 }}><ShoppingBag size={16}/>{cart}</motion.div>}

      {/* ASSISTANT DRAWER */}
      <AnimatePresence>
        {assistant && (
          <motion.div className="assistant-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAssistant(false)}>
            <motion.div className="assistant-drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} onClick={e => e.stopPropagation()}>
              <div className="assistant-head">
                <div><span className="assistant-icon"><PawPrint size={20}/></span><div><strong>FurShield Care Assistant</strong><small>Here to help you care better.</small></div></div>
                <button onClick={() => setAssistant(false)}><X/></button>
              </div>
              <div className="assistant-body">
                {chatMsgs.length === 0 && (
                  <div className="assistant-welcome">
                    <Sparkles size={17}/><span>What can I help you with today?</span>
                  </div>
                )}
                <div className="chat-messages">
                  {chatMsgs.map((m, i) => (
                    <div key={i} className={`chat-msg chat-${m.role}`}>
                      <div className="chat-bubble">{m.text}</div>
                    </div>
                  ))}
                  {chatLoading && <div className="chat-msg chat-assistant"><div className="chat-bubble typing">Thinking...</div></div>}
                </div>
                {chatMsgs.length === 0 && (
                  <div className="suggestions">
                    {["My dog isn't eating.", "When is the next vaccine?", "How often should I groom my cat?", "What should I prepare for a vet visit?"].map(x => (
                      <button key={x} onClick={() => { setChatInput(x); }}>{x}<ArrowRight size={14}/></button>
                    ))}
                  </div>
                )}
              </div>
              <div className="assistant-input">
                <input placeholder="Ask FurShield…" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()}/>
                <button onClick={sendChat}><Send size={16}/></button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
