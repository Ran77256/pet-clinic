// src/pages/VetCalendarPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './VetCalendarPage.css';

const API_BASE = 'http://localhost:8080/api';

// --- helperi za DATUME ---
const toDate = (val) => {
  if (val == null) return new Date(NaN);
  if (val instanceof Date) return val;
  if (typeof val === 'number') return new Date(val);
  if (typeof val !== 'string') return new Date(NaN);

  let s = val.trim().replace(' ', 'T');
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) s += 'T00:00:00';          // samo datum → dodaj vreme
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) s += ':00';     // bez sekundi → dodaj sekunde
  return new Date(s);
};

const addMinutes = (val, mins) => {
  const d = toDate(val);
  if (isNaN(d)) return new Date(NaN);
  d.setMinutes(d.getMinutes() + mins);
  return d.toISOString().slice(0,19).replace('T', 'T'); // ISO bez Z
};

const fmt = (val) => {
  const d = toDate(val);
  return isNaN(d) ? '—' : d.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' });
};

/** Layout ose (08-16) */
const useTimeLayout = (startHour = 8, endHour = 16) => {
  const dayStartMin = startHour * 60;
  const dayEndMin = endHour * 60;
  const totalMin = dayEndMin - dayStartMin;

  const calcStyle = (isoStart, minutes = 30) => {
    const d = toDate(isoStart);
    const mins = isNaN(d) ? dayStartMin : d.getHours() * 60 + d.getMinutes();
    const offset = Math.max(mins - dayStartMin, 0);
    const topPct = (offset / totalMin) * 100;
    const heightPct = (minutes / totalMin) * 100;
    return { top: `${topPct}%`, height: `${heightPct}%` };
  };

  const ticks = useMemo(() => {
    const arr = [];
    for (let h = startHour; h <= endHour; h++) arr.push(`${h.toString().padStart(2, '0')}:00`);
    return arr;
  }, [startHour, endHour]);

  return { calcStyle, ticks, startHour, endHour };
};

export default function VetCalendarPage() {
  const { veterinarianId: idFromRoute } = useParams();
  const navigate = useNavigate();

  const [vetId, setVetId] = useState(idFromRoute || null);
  const [vet, setVet] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const { calcStyle, ticks } = useTimeLayout(8, 16);

  // pronađi vetId iz usera ako nije u URL-u
  useEffect(() => {
    (async () => {
      if (vetId) return;
      const userRaw = localStorage.getItem('user');
      if (!userRaw) return;
      const u = JSON.parse(userRaw);
      if (!u?.id) return;

      try {
        const r = await fetch(`${API_BASE}/veterinarians/by-user/${u.id}`);
        if (r.ok) {
          const v = await r.json();
          setVetId(v.id);
          setVet(v);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [vetId]);

  // učitaj detalje veta (za header)
  useEffect(() => {
    (async () => {
      if (!vetId) return;
      try {
        if (vet?.id === Number(vetId)) return;
        let r = await fetch(`${API_BASE}/veterinarians/summary/${vetId}`);
        if (!r.ok) r = await fetch(`${API_BASE}/veterinarians/${vetId}`);
        if (r.ok) setVet(await r.json());
      } catch (e) {
        console.error(e);
      }
    })();
  }, [vetId]); // eslint-disable-line

  // učitaj termine
  const load = async () => {
    if (!vetId || !date) return;
    try {
      setLoading(true);
      const url = `${API_BASE}/vet-appointments/${vetId}?date=${date}&status=${statusFilter}`;
      const r = await fetch(url);
      if (!r.ok) throw new Error(`Greška ${r.status}`);
      const data = await r.json();

      // ⬇⬇⬇ NORMALIZACIJA
      // BE nekad vraća appointmentDate; napravi startAt/endAt (30min by default)
      const normalized = (Array.isArray(data) ? data : []).map((x) => {
        const start = x.startAt || x.appointmentDate || x.appointmentStart || x.appointment_time || x.dateTime;
    
        return {
          ...x,
          startAt: start,
         
        };
      });

      setItems(normalized);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [vetId, date, statusFilter]); // eslint-disable-line

  const legend = [
    { key: 'SCHEDULED',   label: 'Zakazan' },
    { key: 'IN_PROGRESS', label: 'U toku' },
    { key: 'COMPLETED',   label: 'Završen' },
    { key: 'CANCELLED',   label: 'Otkazan' },
    { key: 'H1',          label: 'Hitan' },
  ];

  const openCard = (petId) => navigate(`/pet-details/${petId}`);

  return (
    <div className="vetcal">
      {/* Header */}
      <div className="vetcal-header">
        <div className="brand">
      
          <div className="brand-text">
            <div className="title">PetClinic</div>
            <div className="sub">Ambulanta za ljubimce</div>
          </div>
        </div>

        <div className="header-center">
          <button className="btn btn-primary" onClick={() => setDate(todayStr)}>
            Pregled kalendara
          </button>
        </div>

        <div className="userbox">
          <span className="user">{vet?.lastName ? `Dr.${vet.lastName}` : 'Veterinar'}</span>
          <button className="btn btn-ghost" onClick={() => { localStorage.clear(); navigate('/'); }}>
            Log out
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="vetcal-toolbar">
        <div className="headline">
          <strong>Pregled kalendara — {vet?.lastName ? `Dr. ${vet.lastName}` : 'Veterinar'}</strong>
          <div className="small">
            Danas • {toDate(date).toLocaleDateString('sr-RS')} — statusi: Zakazan, U toku, Završен, Otkazan, Hitan
          </div>
        </div>

        <div className="filters">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="date" />
          <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">Svi</option>
            <option value="SCHEDULED">Zakazani</option>
            <option value="IN_PROGRESS">U toku</option>
            <option value="COMPLETED">Završeni</option>
            <option value="CANCELLED">Otkazani</option>
          </select>
        </div>
      </div>

      {/* Main layout */}
      <div className="vetcal-main">
        {/* Kalendar */}
        <div className="calendar">
          <div className="timeline">
            {ticks.map((t) => (
              <div key={t} className="tick">
                <span className="tick-label">{t}</span>
                <span className="tick-line" />
              </div>
            ))}
          </div>

          <div className="slots">
            {loading ? (
              <div className="loading">Učitavanje termina...</div>
            ) : items.length === 0 ? (
              <div className="empty">Nema termina za izabrani dan.</div>
            ) : (
              items.map((it) => {
                const start = toDate(it.startAt);
                const end = toDate(it.endAt);
                const minutes = isNaN(start) || isNaN(end)
                  ? 30
                  : Math.max(15, (end.getTime() - start.getTime()) / 60000);
                const style = calcStyle(start, minutes);

                const cls = [
                  'slot',
                  it.status ? `st-${it.status.toLowerCase()}` : 'st-unknown',
                  it.urgent ? 'is-urgent' : ''
                ].join(' ');

                return (
                  <div
                    key={it.id}
                    className={cls}
                    style={style}
                    title={`${fmt(it.startAt)} - ${fmt(it.endAt)}`}
                  >
                    <div className="slot-title">
                      {fmt(it.startAt)}–{fmt(it.endAt)} • {it.serviceName || it.reason || '—'}
                    </div>
                    <div className="slot-sub">{it.petName || `#${it.petId}`}</div>
                  </div>
                );
              })
            )}
          </div>

          <div className="legend">
            {legend.map((l) => (
              <div key={l.key} className="legend-item">
                <span className={`dot st-${l.key.toLowerCase()}`} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Desna kolona */}
        <div className="right-panel">
          <div className="rp-title">Pacijenti danas</div>
          <div className="rp-list">
            {loading ? (
              <div className="loading small">Učitavanje…</div>
            ) : items.length === 0 ? (
              <div className="empty small">Nema zakazanih pacijenata.</div>
            ) : (
              items
                .slice()
                .sort((a, b) => toDate(a.startAt) - toDate(b.startAt))
                .map((it) => (
                  <div key={it.id} className="rp-item">
                    <div className="rp-time">
                      {fmt(it.startAt)} • {it.petName || `#${it.petId}`} — {it.serviceName || it.reason || '—'}
                    </div>
                    <div className="rp-sub">
                      Status:{' '}
                      <span className={`tag st-${(it.status || 'unknown').toLowerCase()}`}>{it.status}</span>
                      {it.urgent && <span className="tag urgent">Hitan</span>}
                    </div>
                    <button className="btn btn-primary sm" onClick={() => navigate(`/pet-details/${it.petId}`)}>
                      Otvori karton
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
