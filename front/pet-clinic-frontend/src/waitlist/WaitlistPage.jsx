// src/waitlist/WaitlistPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WaitlistPage.css';

const API_BASE = 'http://localhost:8080/api';
const fmtDate = (iso) => new Date(iso).toLocaleDateString('sr-RS', { year:'numeric', month:'2-digit', day:'2-digit' });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('sr-RS', { hour:'2-digit', minute:'2-digit' });

export default function WaitlistPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = useMemo(() => {
    const token = localStorage.getItem('token');
    const h = { Accept: 'application/json', 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, []);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { navigate('/'); return; }
    const parsed = JSON.parse(u);
    setUser(parsed);
    load(parsed.id);
  // eslint-disable-next-line
  }, []);

  const load = async (ownerId) => {
    try {
      setLoading(true);
      // backend: /api/waitlist?ownerId=...&onlyActive=true
      const res = await fetch(`${API_BASE}/waitlist?ownerId=${ownerId}&onlyActive=true`, { headers });
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (window.confirm('Da li ste sigurni da se želite odjaviti?')) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  return (
    <div className="wl-page">
      {/* Header */}
      <div className="wl-header">
        <div className="brand">
          <div className="brand-text">
            <p className="pet-clinic-title">PetClinic</p>
            <p className="ambulanta-subtitle">Ambulanta za ljubimce</p>
          </div>
        </div>

        <div className="actions">
          <button className="btn" onClick={() => navigate('/schedule-appointment')}>Zakaži termin</button>
          <button className="btn" onClick={() => navigate('/user')}>Nazad na ljubimce</button>
        </div>

        <div className="userbox">
       
        
        </div>
      </div>

      {/* Title bar */}
      <div className="wl-toolbar">
        <h1>Moja lista čekanja</h1>
        <p>Prikaz aktivnih stavki na listi čekanja. Kada se oslobodi termin, bićete automatski prebačeni.</p>
      </div>

      {/* Content */}
      <div className="wl-content">
        {loading ? (
          <div className="wl-loading">Učitavanje…</div>
        ) : items.length === 0 ? (
          <div className="wl-empty">
            Trenutno nemate aktivne stavke na listi čekanja.
          </div>
        ) : (
          <div className="wl-list">
            {items
              .slice()
              .sort((a, b) => new Date(a.desiredStart) - new Date(b.desiredStart))
              .map((w) => (
                <div key={w.id} className="wl-card">
                  <div className="wl-row">
                    <span className="tag">Ljubimac</span>
                    <span className="val">{w.petName || `#${w.petId}`}</span>
                  </div>
                  <div className="wl-row">
                    <span className="tag">Željeni termin</span>
                    <span className="val">{fmtDate(w.desiredStart)} • {fmtTime(w.desiredStart)}</span>
                  </div>
                  {w.veterinarianName && (
                    <div className="wl-row">
                      <span className="tag">Veterinar</span>
                      <span className="val">{w.veterinarianName}</span>
                    </div>
                  )}
                  <div className="wl-meta">
                    Kreirano: {fmtDate(w.createdAt)} {fmtTime(w.createdAt)}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
