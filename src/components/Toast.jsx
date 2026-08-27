import React, { useState, useEffect, createContext, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, AlertCircle, Info } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = { success: (m) => addToast(m, "success"), error: (m) => addToast(m, "error"), info: (m) => addToast(m, "info") };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} className={`toast toast-${t.type}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80 }} transition={{ duration: 0.25 }}>
              <span className="toast-icon">{t.type === "success" ? <Check size={16}/> : t.type === "error" ? <AlertCircle size={16}/> : <Info size={16}/>}</span>
              <span className="toast-msg">{t.message}</span>
              <button className="toast-close" onClick={() => removeToast(t.id)}><X size={14}/></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
