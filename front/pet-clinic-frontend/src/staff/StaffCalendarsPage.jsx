// src/staff/StaffCalendarsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StaffCalendarsPage.css';

const API = 'http://localhost:8080/api';

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric' });
const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' });

const statuses = ['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

// 👇 helper: normalizuj naziv intervencije/usluge
const getItemTitle = (it) =>
  it?.serviceName ||
  it?.service?.name ||
  it?.interventionName ||
  it?.procedureName ||
  it?.title ||
  it?.name ||
  it?.reason ||
  '—';

export default function StaffCalendarsPage() {
  const nav = useNavigate();

  // ----- UI state -----
  const [tab, setTab] = useState('day'); // 'day' | 'vet' | 'patient' | 'waitlist' | 'emergency'
  const today = new Date().toISOString().slice(0, 10);

  // common
  const [vets, setVets] = useState([]);
  const [status, setStatus] = useState('ALL');

  // Po danu
  const [dateDay, setDateDay] = useState(today);
  const [dayData, setDayData] = useState([]); // [{vet, items: []}]
  const [loadingDay, setLoadingDay] = useState(false);

  // Po veterinaru
  const [vetId, setVetId] = useState('');
  const [dateVet, setDateVet] = useState(today);
  const [vetItems, setVetItems] = useState([]);
  const [loadingVet, setLoadingVet] = useState(false);

  // Po pacijentu
  const [q, setQ] = useState('');
  const [suggest, setSuggest] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [patients, setPatients] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [petAppointments, setPetAppointments] = useState([]);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'upcoming' | 'history'

  // Waitlist
  const [waitlist, setWaitlist] = useState([]);
  const [loadingWL, setLoadingWL] = useState(false);

  // Emergency form
  const [emgPet, setEmgPet] = useState(null);
  const [emgReason, setEmgReason] = useState('');
  const [emgDate, setEmgDate] = useState(today);
  const [emgTime, setEmgTime] = useState(() => {
    const d = new Date(); d.setMinutes(d.getMinutes() - (d.getMinutes() % 5)); return d.toTimeString().slice(0,5);
  });
  const [emgAuto, setEmgAuto] = useState(true);
  const [emgVetId, setEmgVetId] = useState('');
  const [emgAutoChosen, setEmgAutoChosen] = useState(null); // {id, name}
  const [creating, setCreating] = useState(false);
  const [emgDayPreview, setEmgDayPreview] = useState([]); // [{vet, items:[]}]


  const authHeaders = () => {
    const token = localStorage.getItem('token');
    const h = { Accept: 'application/json', 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  };

  // helpers
  function debounce(fn, ms = 250) {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }
  const fetchSuggest = debounce(async (term) => {
    if (!term || term.trim().length < 1) { setSuggest([]); return; }
    try {
      const r = await fetch(`${API}/pets/search?q=${encodeURIComponent(term)}`, { headers: authHeaders() });
      const data = r.ok ? await r.json() : [];
      setSuggest(Array.isArray(data) ? data.slice(0, 8) : []);
    } catch { setSuggest([]); }
  }, 200);

  const overlaps = (startA, startB) => {
    const a = new Date(startA).getTime();
    const b = new Date(startB).getTime();
    return Math.abs(a - b) < 60 * 60 * 1000;
  };

  // ---- init: veterinari
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/veterinarians/getall`, { headers: authHeaders() });
        const data = await r.json();
        setVets(Array.isArray(data) ? data : []);
      } catch {
        setVets([]);
      }
    })();
  }, []);

  // ---- Po veterinaru
  const loadVetDay = async () => {
    if (!vetId || !dateVet) return;
    setLoadingVet(true);
    try {
      const url = `${API}/vet-appointments/${vetId}?date=${dateVet}&status=${status}`;
      const r = await fetch(url, { headers: authHeaders() });
      const data = await r.json();
      setVetItems(Array.isArray(data) ? data : []);
    } catch {
      setVetItems([]);
    } finally {
      setLoadingVet(false);
    }
  };
  useEffect(() => { loadVetDay(); /* eslint-disable-next-line */ }, [vetId, dateVet, status]);

  // ---- Po danu (za SVE veterinare)
  const loadAllForDay = async () => {
    if (!dateDay) return;
    setLoadingDay(true);
    try {
      const groups = await Promise.all(
        vets.map(async (v) => {
          const url = `${API}/vet-appointments/${v.id}?date=${dateDay}&status=${status}`;
          const r = await fetch(url, { headers: authHeaders() });
          const items = r.ok ? await r.json() : [];
          return { vet: v, items: Array.isArray(items) ? items : [] };
        })
      );
      setDayData(groups);
    } catch {
      setDayData([]);
    } finally {
      setLoadingDay(false);
    }
  };
  useEffect(() => { if (tab === 'day') loadAllForDay(); /* eslint-disable-next-line */ }, [vets, dateDay, status, tab]);

  // ---- “Pregled po danu” — FLAT lista svih termina za dan
  const dayAll = useMemo(() => {
    const flat = dayData.flatMap(g => (g.items || []).map(it => ({ ...it, _vet: g.vet })));
    return flat.sort((a,b) =>
      new Date(a.startAt || a.appointmentDate) - new Date(b.startAt || b.appointmentDate)
    );
  }, [dayData]);

  // ---- Pacijent (search)
  const searchPets = async () => {
    if (!q.trim()) { setPatients([]); return; }
    try {
      const r = await fetch(`${API}/pets/search?q=${encodeURIComponent(q)}`, { headers: authHeaders() });
      const data = await r.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch {
      setPatients([]);
    }
  };

  const onSearchChange = (e) => {
    const v = e.target.value;
    setQ(v);
    setShowSuggest(true);
    setHighlight(-1);
    fetchSuggest(v);
  };
  const onSearchKeyDown = (e) => {
    if (!showSuggest || suggest.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, suggest.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const sel = suggest[highlight] || suggest[0];
      if (sel) selectFromSuggest(sel);
    } else if (e.key === 'Escape') {
      setShowSuggest(false);
    }
  };
  const selectFromSuggest = (pet) => {
    setQ(pet.name || '');
    setShowSuggest(false);
    setPatients([pet]);
    loadPetAppointments(pet);
    setEmgPet(pet);
  };

  const loadPetAppointments = async (pet) => {
    setSelectedPet(pet);
    setLoadingPatient(true);
    try {
      const r = await fetch(`${API}/pets/${pet.id}/appointments`, { headers: authHeaders() });
      const data = r.ok ? await r.json() : [];
      setPetAppointments(Array.isArray(data) ? data : []);
    } catch {
      setPetAppointments([]);
    } finally {
      setLoadingPatient(false);
    }
  };

  // ---- Waitlist
  const loadWaitlist = async () => {
    setLoadingWL(true);
    try {
      const r = await fetch(`${API}/waitlist?onlyActive=true`, { headers: authHeaders() });
      const data = await r.json();
      setWaitlist(Array.isArray(data) ? data : []);
    } catch {
      setWaitlist([]);
    } finally {
      setLoadingWL(false);
    }
  };
  useEffect(() => { if (tab === 'waitlist') loadWaitlist(); }, [tab]);

  // ---- EMERGENCY preview
  const loadEmergencyPreview = async () => {
    if (vets.length === 0 || !emgDate) return;
    const groups = await Promise.all(
      vets.map(async (v) => {
        const url = `${API}/vet-appointments/${v.id}?date=${emgDate}&status=ALL`;
        const r = await fetch(url, { headers: authHeaders() });
        const items = r.ok ? await r.json() : [];
        return { vet: v, items: Array.isArray(items) ? items : [] };
      })
    );
    setEmgDayPreview(groups);

    const best = groups
      .map(g => ({ id: g.vet.id, name: g.vet.lastName ? `Dr. ${g.vet.lastName}` : `Vet #${g.vet.id}`, count: g.items.length }))
      .sort((a,b)=>a.count-b.count)[0];
    setEmgAutoChosen(best || null);
  };
  useEffect(() => { if (tab === 'emergency') loadEmergencyPreview(); /* eslint-disable-next-line */ }, [tab, emgDate, vets.length]);

  // ---- EMERGENCY create
  const createEmergency = async () => {
    if (!emgPet) return alert('Izaberite pacijenta.');
    if (!emgDate || !emgTime) return alert('Unesite datum i vreme.');
    setCreating(true);
    try {
      const payload = {
        petId: emgPet.id,
        appointmentDate: emgDate,
        appointmentTime: emgTime,
        reason: emgReason || 'Hitan termin',
        notes: 'HITNO — dozvoljeno preklapanje',
        veterinarianId: emgAuto ? (emgAutoChosen?.id || null) : (emgVetId || null)
      };
      if (!payload.veterinarianId) delete payload.veterinarianId;

      const r = await fetch(`${API}/emergency-appointments`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });
      if (!r.ok) {
        const t = await r.text();
        throw new Error(t || 'Greška pri kreiranju hitnog termina.');
      }
      await r.json();
      alert('Hitan termin je kreiran.');
      loadEmergencyPreview();
      setSelectedPet(emgPet);
      await loadPetAppointments(emgPet);
      setTab('patient');
    } catch (e) {
      alert(e.message);
    } finally {
      setCreating(false);
    }
  };

  const StatusTag = ({ s }) => <span className={`tag st-${(s || 'unknown').toLowerCase()}`}>{s}</span>;

  const VetSlot = ({ it }) => (
    <div className={`slot-card st-${(it.status || 'unknown').toLowerCase()}`}>
      <div className="slot-time">
        {fmtTime(it.startAt || it.appointmentDate)}
      </div>
      <div className="slot-title">{getItemTitle(it)}</div>
      <div className="slot-sub">
        <span>{it.petName || `#${it.petId}`}</span>
        <StatusTag s={it.status} />
        {it.urgent && <span className="tag urgent">HITNO</span>}
      </div>
    </div>
  );

  return (
    <div className="staffcal">
      {/* Header */}
      <div className="staffcal-header">
        <div className="brand">
          <div className="brand-text">
            <div className="title">PetClinic</div>
            <div className="sub">Ambulanta za ljubimce</div>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${tab==='day'?'active':''}`} onClick={()=>setTab('day')}>Pregled po danu</button>
          <button className={`tab ${tab==='vet'?'active':''}`} onClick={()=>setTab('vet')}>Pregled po veterinaru</button>
          <button className={`tab ${tab==='patient'?'active':''}`} onClick={()=>setTab('patient')}>Pregled po pacijentu</button>
          <button className={`tab ${tab==='waitlist'?'active':''}`} onClick={()=>setTab('waitlist')}>Lista čekanja</button>
          <button className={`tab ${tab==='emergency'?'active':''}`} onClick={()=>setTab('emergency')}>Hitna intervencija</button>
        </div>

        <div className="userbox">
          <button className="btn ghost" onClick={()=>{localStorage.clear(); nav('/');}}>Log out</button>
        </div>
      </div>

      {/* Toolbar (global) */}
      {tab!=='emergency' && (
        <div className="toolbar">
          <div className="field">
            <label>Status</label>
            <select value={status} onChange={(e)=>setStatus(e.target.value)}>
              {statuses.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {tab==='day' && (
            <div className="field">
              <label>Datum</label>
              <input type="date" value={dateDay} onChange={(e)=>setDateDay(e.target.value)} />
            </div>
          )}

          {tab==='vet' && (
            <>
              <div className="field">
                <label>Veterinar</label>
                <select value={vetId} onChange={(e)=>setVetId(e.target.value)}>
                  <option value="">Izaberite…</option>
                  {vets.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.firstName ? `${v.firstName} ${v.lastName||''}` : `Vet #${v.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Datum</label>
                <input type="date" value={dateVet} onChange={(e)=>setDateVet(e.target.value)} />
              </div>
            </>
          )}

          {tab==='patient' && (
            <div className="field">
              <label>Pretraži pacijenta</label>
              <div className="search-compact">
                <div className="search-row">
                  <input
                    value={q}
                    onChange={onSearchChange}
                    onKeyDown={onSearchKeyDown}
                    onFocus={()=> setShowSuggest(true)}
                    placeholder="Pretraga po vlasniku/ mikro-čipu…"
                  />
                  <button className="btn" onClick={() => { searchPets(); setShowSuggest(false); }}>
                    Pretraži
                  </button>
                </div>

                {showSuggest && suggest.length > 0 && (
                  <div className="search-suggest" onMouseLeave={()=>setHighlight(-1)}>
                    {suggest.map((p, i) => (
                      <div
                        key={p.id}
                        className={`search-suggest-item ${i===highlight?'active':''}`}
                        onMouseDown={(e)=>e.preventDefault()}
                        onClick={()=>selectFromSuggest(p)}
                        onMouseEnter={()=>setHighlight(i)}
                      >
                        <div className="s-name">{p.name}</div>
                        <div className="s-owner">
                          {p.ownerName ||
                           (p.owner ? `${p.owner.firstName||''} ${p.owner.lastName||''}`.trim() : '—')}
                        </div>
                        <div className="s-type">{p.animalType?.name || p.animaltype?.name || '—'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTENT */}
      {tab==='day' && (
        <div className="cards">
          <div className="card">
            <div className="card-title">Pregled dana — {fmtDate(dateDay)}</div>
            {loadingDay ? (
              <div className="loading">Učitavam…</div>
            ) : dayAll.length === 0 ? (
              <div className="empty">Nema termina za izabrani dan.</div>
            ) : (
              <div className="slots-col">
                {dayAll.map(it => {
                  const start = it.startAt || it.appointmentDate;
                  const end   = it.endAt || null;
                  const vetLabel =
                    it.veterinarianName
                    || (it._vet
                          ? (it._vet.lastName
                              ? `Dr. ${it._vet.lastName}`
                              : (it._vet.firstName ? `${it._vet.firstName} ${it._vet.lastName||''}` : `Vet #${it._vet.id}`))
                          : (it.veterinarianId ? `#${it.veterinarianId}` : '—'));

                  return (
                    <div key={it.id} className={`slot-card st-${(it.status||'unknown').toLowerCase()}`}>
                      <div className="slot-time">
                        {fmtTime(start)}{end ? ` — ${fmtTime(end)}` : ''}
                      </div>
                      <div className="slot-title">{getItemTitle(it)}</div>
                      <div className="slot-sub">
                        <span>{it.petName || `#${it.petId}`}</span>
                        <span>• Veterinar: {vetLabel}</span>
                        <StatusTag s={it.status} />
                        {it.urgent && <span className="tag urgent">HITNO</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {tab==='vet' && (
        <div className="cards">
          <div className="card">
            <div className="card-title">Raspored</div>
            {loadingVet ? <div className="loading">Učitavam…</div> :
              <div className="slots-col">
                {vetItems.length === 0 ? <div className="empty">Nema termina.</div> :
                  vetItems.map(it => <VetSlot key={it.id} it={it} />)}
              </div>
            }
          </div>
        </div>
      )}

      {tab==='patient' && (
        <div className="split">
          <div className="left">
            <div className="card">
              <div className="card-title">Rezultati pretrage</div>
              <div className="list">
                {patients.length===0 ? <div className="muted">Nema rezultata.</div> :
                  patients.map(p => (
                    <button key={p.id}
                            className={`list-item ${selectedPet?.id===p.id?'active':''}`}
                            onClick={()=>loadPetAppointments(p)}>
                      <div className="li-title">{p.name}</div>
                      <div className="li-sub">
                        {p.animalType?.name || p.animaltype?.name || '—'} • {p.microchipNumber || 'bez čipa'}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <div className="right">
            <div className="card patient-card">
              <div className="card-title sticky">
                Pacijent — {selectedPet ? selectedPet.name : '—'}
                {selectedPet && (
                  <span className="subtitle">
                    {' '}• Vlasnik: {selectedPet.ownerName ||
                      (selectedPet.owner
                        ? `${selectedPet.owner.firstName||''} ${selectedPet.owner.lastName||''}`.trim()
                        : '—')}
                  </span>
                )}
              </div>

              {selectedPet && (
                <div className="segmented sticky-top">
                  <button className={viewMode==='upcoming'?'active':''} onClick={()=>setViewMode('upcoming')}>Predstojeći</button>
                  <button className={viewMode==='history'?'active':''} onClick={()=>setViewMode('history')}>Istorija</button>
                  <button className={viewMode==='all'?'active':''} onClick={()=>setViewMode('all')}>Sve</button>
                </div>
              )}

              {loadingPatient ? (
                <div className="loading">Učitavam…</div>
              ) : !selectedPet ? (
                <div className="muted">Izaberite pacijenta.</div>
              ) : petAppointments.length===0 ? (
                <div className="empty">Nema termina.</div>
              ) : (
                <div className="patient-scroll">
                  {petAppointments
                    .slice()
                    .filter(it => {
                      if (viewMode === 'all') return true;
                      const dt = new Date(it.startAt || it.appointmentDate);
                      const isFuture = dt.getTime() >= Date.now();
                      return viewMode === 'upcoming' ? isFuture : !isFuture;
                    })
                    .sort((a,b)=> new Date((a.startAt||a.appointmentDate)) - new Date((b.startAt||b.appointmentDate)))
                    .map(it => (
                      <div key={it.id} className={`slot-card st-${(it.status||'unknown').toLowerCase()}`}>
                        <div className="slot-time">{fmtDate(it.startAt||it.appointmentDate)} • {fmtTime(it.startAt||it.appointmentDate)}</div>
                        <div className="slot-title">{getItemTitle(it)}</div>
                        <div className="slot-sub">
                          <span>Veterinar: {it.veterinarianName || (it.veterinarianId?`#${it.veterinarianId}`:'—')}</span>
                          <StatusTag s={it.status}/>
                          {it.urgent && <span className="tag urgent">HITNO</span>}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab==='waitlist' && (
        <div className="cards">
          <div className="card">
            <div className="card-title">Aktivna lista čekanja</div>
            {loadingWL ? <div className="loading">Učitavam…</div> :
              <div className="wl-table">
                <div className="wl-header">
                  <span>Željeni termin</span><span>Ljubimac</span><span>Veterinar</span><span>Beleška</span><span>Kreirano</span>
                </div>
                {waitlist.length===0 ? <div className="empty">Nema aktivnih stavki.</div> :
                  waitlist
                    .slice().sort((a,b)=>new Date(a.desiredStart) - new Date(b.desiredStart))
                    .map(w => (
                      <div key={w.id} className="wl-row">
                        <span>{fmtDate(w.desiredStart)} • {fmtTime(w.desiredStart)}</span>
                        <span>{w.petName}</span>
                        <span>{w.veterinarianName || `#${w.veterinarianId}`}</span>
                        <span className="muted">{w.note || '—'}</span>
                        <span className="muted">{fmtDate(w.createdAt)} • {fmtTime(w.createdAt)}</span>
                      </div>
                    ))
                }
              </div>
            }
          </div>
        </div>
      )}

      {tab==='emergency' && (
        <div className="emg-wrapper">
          <div className="emg-grid">
            {/* leva forma */}
            <div className="emg-form">
              <div className="emg-title">Podrška za hitne intervencije</div>
              <div className="emg-help">
                Hitan termin se može preklapati sa redovnim i dobija prioritetnu dodelu veterinara.
              </div>

              <div className="frow">
                <label>Pacijent</label>
                <div className="search-compact">
                  <div className="search-row">
                    <input
                      value={q}
                      onChange={(e)=>{ setQ(e.target.value); setShowSuggest(true); setHighlight(-1); fetchSuggest(e.target.value); }}
                      onKeyDown={(e)=> {
                        if (!showSuggest || suggest.length===0) return;
                        if (e.key==='ArrowDown'){ e.preventDefault(); setHighlight(h=>Math.min(h+1, suggest.length-1)); }
                        else if (e.key==='ArrowUp'){ e.preventDefault(); setHighlight(h=>Math.max(h-1, 0)); }
                        else if (e.key==='Enter'){ e.preventDefault(); const sel=suggest[highlight]||suggest[0]; if (sel) selectFromSuggest(sel); }
                        else if (e.key==='Escape'){ setShowSuggest(false); }
                      }}
                      onFocus={()=> setShowSuggest(true)}
                      placeholder="Ime ljubimca ili mikro-čip…"
                    />
                    <button className="btn" onClick={() => { searchPets(); setShowSuggest(false); }}>
                      Pretraži
                    </button>
                  </div>
                  {showSuggest && suggest.length > 0 && (
                    <div className="search-suggest" onMouseLeave={()=>setHighlight(-1)}>
                      {suggest.map((p, i) => (
                        <div
                          key={p.id}
                          className={`search-suggest-item ${i===highlight?'active':''}`}
                          onMouseDown={(e)=>e.preventDefault()}
                          onClick={()=>selectFromSuggest(p)}
                          onMouseEnter={()=>setHighlight(i)}
                        >
                          <div className="s-name">{p.name}</div>
                          <div className="s-owner">
                            {p.ownerName ||
                            (p.owner ? `${p.owner.firstName||''} ${p.owner.lastName||''}`.trim() : '—')}
                          </div>
                          <div className="s-type">{p.animalType?.name || p.animaltype?.name || '—'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

             <div className="frow">
  <label>Intervencija</label>
  <input type="text" value={emgReason} onChange={(e)=>setEmgReason(e.target.value)} placeholder="Hirurgija, dijagnostika…" />
</div>

<div className="frow-row">
  <div className="field">
    <label>Datum</label>
    <input type="date" value={emgDate} onChange={(e)=>setEmgDate(e.target.value)} />
  </div>
  <div className="field">
    <label>Vreme</label>
    <input type="time" value={emgTime} onChange={(e)=>setEmgTime(e.target.value)} />
  </div>
</div>


              <div className="frow">
                <label>Označi kao „Hitan”</label>
                <div className="pill">
                  <span className="dot-red" /> HITNO — omogućeno preklapanje
                </div>
              </div>

              <div className="frow">
                <label>Dodela veterinara</label>
                {emgAuto ? (
                  <div className="emg-assign" onClick={()=>setEmgAuto(false)}>
                    Automatski: {emgAutoChosen ? `${emgAutoChosen.name} (najbrže raspoloživ)` : 'tražim…'}
                  </div>
                ) : (
                  <div style={{display:'grid', gridTemplateColumns:'1fr auto', gap:12}}>
                    <select value={emgVetId} onChange={(e)=>setEmgVetId(e.target.value)}>
                      <option value="">Izaberite veterinara…</option>
                      {vets.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.firstName ? `${v.firstName} ${v.lastName||''}` : `Vet #${v.id}`}
                        </option>
                      ))}
                    </select>
                    <button className="btn" onClick={()=>setEmgAuto(true)}>Automatski</button>
                  </div>
                )}
              </div>

              <div className="frow">
                <button className="btn-primary" disabled={creating} onClick={createEmergency}>
                  {creating ? 'Kreiram…' : 'Kreiraj hitan termin'}
                </button>
              </div>

              <div className="emg-note">
                Notifikacija će biti poslata dodeljenom veterinaru. Hitan termin se može prikazati preko već zakazanog.
              </div>
            </div>

            {/* desni panel – pregled rasporeda */}
            <div className="emg-calendar">
              <div className="emg-cal-title">Dnevni raspored — preklapanje dozvoljeno za HITNO</div>
              <div className="emg-cal-col">
                {emgDayPreview.length===0
                  ? <div className="muted">Nema podataka.</div>
                  : emgDayPreview.map(g => (
                      <div key={g.vet.id} className="card" style={{padding:12}}>
                        <div className="card-title" style={{marginBottom:10}}>
                          {g.vet.lastName ? `Dr. ${g.vet.lastName}` : `Vet #${g.vet.id}`}
                        </div>
                        <div className="slots-col">
                          {g.items.length===0 ? <div className="muted">Slobodno.</div> :
                            g.items.map(it => {
                              const clash = overlaps((it.startAt||it.appointmentDate), `${emgDate}T${emgTime}:00`);
                              return (
                                <div key={it.id} className={`slot-card ${clash?'overlap':''} st-${(it.status||'unknown').toLowerCase()}`}>
                                  <div className="slot-time">
                                    {fmtTime(it.startAt||it.appointmentDate)} 
                                  </div>
                                  <div className="slot-title">{getItemTitle(it)}</div>
                                  <div className="slot-sub">
                                    <span>{it.petName || `#${it.petId}`}</span>
                                    <StatusTag s={it.status}/>
                                    {clash && <span className="tag urgent">Preklapanje</span>}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ))
                }
              </div>
            </div>
          </div>

          <div className="legend" style={{marginTop:16}}>
            <span className="dot st-scheduled"/> Regularan termin
            <span className="tag urgent small">Hitan (dozvoljeno preklapanje)</span>
            <span className="dot st-completed"/> Završeni/Kontrolni
          </div>
        </div>
      )}

      {/* legenda zajednička */}
      {tab!=='emergency' && (
        <div className="legend">
          <span className="dot st-scheduled"/> Zakazan
          <span className="dot st-in_progress"/> U toku
          <span className="dot st-completed"/> Završen
          <span className="dot st-cancelled"/> Otkazan
          <span className="tag urgent small">HITNO</span>
        </div>
      )}
    </div>
  );
}
