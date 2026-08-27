import React, { useState, useRef, useEffect } from "react";
import { PawPrint, Send, Sparkles, Trash2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";

export default function Chat() {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  const send = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setMsgs(p => [...p, { role: "user", text: msg }]);
    setInput("");
    setLoading(true);
    try {
      const res = await api.post('/chat/send.php', { message: msg, history: msgs });
      setMsgs(p => [...p, { role: "assistant", text: res.success ? res.data.reply : "I'm sorry, I couldn't process that right now. Please try again." }]);
    } catch { setMsgs(p => [...p, { role: "assistant", text: "Connection error. Please try again later." }]); }
    setLoading(false);
  };

  const clear = () => setMsgs([]);

  const suggestions = ["My dog isn't eating.", "When should I vaccinate my puppy?", "How often should I groom my cat?", "What should I prepare for a vet visit?"];

  return (
    <div className="page-chat">
      <div className="chat-header">
        <div><span className="chat-logo"><PawPrint size={20}/></span><div><h2>FurShield AI Assistant</h2><small>Powered by Google Gemini — here to help with pet care questions</small></div></div>
        {msgs.length > 0 && <button className="btn-outline btn-sm" onClick={clear}><Trash2 size={14}/> Clear</button>}
      </div>

      <div className="chat-window">
        {msgs.length === 0 && (
          <div className="chat-welcome">
            <Sparkles size={24}/>
            <h3>Hi! I'm FurShield AI.</h3>
            <p>How can I help you care for your pet today?</p>
            <div className="chat-suggestions">
              {suggestions.map(s => <button key={s} onClick={() => { setInput(s); }}>{s}</button>)}
            </div>
            <div className="chat-disclaimer"><AlertCircle size={14}/><span>For serious medical concerns, please consult a qualified veterinarian.</span></div>
          </div>
        )}
        <AnimatePresence>
          {msgs.map((m, i) => (
            <motion.div key={i} className={`chat-msg chat-${m.role}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="chat-bubble">{m.text}</div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && <motion.div className="chat-msg chat-assistant" initial={{opacity:0}} animate={{opacity:1}}><div className="chat-bubble typing"><span/><span/><span/></div></motion.div>}
        <div ref={endRef}/>
      </div>

      <div className="chat-input-bar">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask FurShield AI..." disabled={loading}/>
        <button onClick={send} disabled={loading || !input.trim()}><Send size={18}/></button>
      </div>
    </div>
  );
}
