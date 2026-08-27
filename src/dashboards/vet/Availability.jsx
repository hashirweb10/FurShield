import React, { useState, useEffect } from "react";
import { Clock, Plus, Trash2 } from "lucide-react";
import api from "../../services/api";
import { useToast } from "../../components/Toast";

export default function Availability() {
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ available_date: "", start_time: "09:00", end_time: "17:00" });
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetch = () => { api.get('/vets/set_availability.php').then(r => { if (r.success) setSlots(r.data || []); setLoading(false); }); };
  useEffect(() => { fetch(); }, []);

  const addSlot = async (e) => {
    e.preventDefault();
    const res = await api.post('/vets/set_availability.php', form);
    if (res.success) { toast.success("Slot added!"); fetch(); }
    else toast.error(res.message);
  };

  const removeSlot = async (id) => {
    const res = await api.delete(`/vets/remove_slot.php?id=${id}`);
    if (res.success) { toast.success("Removed"); fetch(); }
  };

  const today = new Date().toISOString().split("T")[0];
  const grouped = {};
  slots.forEach(s => {
    const d = s.available_date;
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(s);
  });
  const sortedDates = Object.keys(grouped).sort();

  if (loading) return <div className="dash-loading"><div className="spinner"/><p>Loading...</p></div>;

  return (
    <div className="page-availability">
      <div className="page-head"><h1>Availability</h1></div>
      <form className="avail-form" onSubmit={addSlot}>
        <label>Date<input type="date" value={form.available_date} onChange={e => setForm(p => ({...p, available_date: e.target.value}))} min={today} required/></label>
        <label>Start<input type="time" value={form.start_time} onChange={e => setForm(p => ({...p, start_time: e.target.value}))}/></label>
        <label>End<input type="time" value={form.end_time} onChange={e => setForm(p => ({...p, end_time: e.target.value}))}/></label>
        <button className="btn-primary" type="submit"><Plus size={14}/> Add Slot</button>
      </form>
      {sortedDates.length === 0 ? <div className="empty-state"><Clock size={32}/><p>No availability set</p></div> : (
        <div className="slots-grid">{sortedDates.map(date => (
          <div key={date} className="day-slots"><h4>{date}</h4>{grouped[date].map(s => (
            <div key={s.id} className="slot-chip"><Clock size={12}/>{s.start_time} - {s.end_time}
              {s.is_booked == 0 && <button onClick={() => removeSlot(s.id)}><Trash2 size={12}/></button>}
            </div>
          ))}</div>
        ))}</div>
      )}
    </div>
  );
}
