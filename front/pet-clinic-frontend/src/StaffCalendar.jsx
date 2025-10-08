import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './StaffCalendar.css';

const API = 'http://localhost:8080/api';

const statusColor = (s) => {
  switch (s) {
    case 'SCHEDULED':   return 'status-blue';
    case 'IN_PROGRESS': return 'status-yellow';
    case 'COMPLETED':   return 'status-green';
    case 'CANCELLED':   return 'status-gray';
    default:            return 'status-blue';
  }
};

export default function StaffCalendar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [view, setView]   = useState('day'); // 'day' | 'vet' | 'patient'
  const [date, setDate]   = useState(() => new Date().toISOString().slice(0,10));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // dropdowns
  const [vets, setVets] = useState([]);
  const [selectedVet, setSelectedVet] = useState('');

  // pacijenti (flat DTO)
  const [pets, setPets] = useState([]);                // [{id,label,owner}]
  const [selectedPet, setSelectedPet] = useState('');
  const [petSearch, setPetSearch] = useState('');      // tekst iz pretrage
  const [loadingPets, setLoadingPets] = useState(false);
  const debounceRef = useRef(null);

  // guard – mora STAFF_ADMIN
  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) { navigate('/'); return; }
    const u = JSON.parse(raw);
    setUser(u);
    if (u.role !== 'STAFF_ADMIN') {
      if (u.role === 'USER') navigate('/user');
      else navigate('/');
    }
  }, [navigate]);

// helper za različite forme odgovora
const pickArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
};

// učitaj veterinare jednom (KORIGUJ URL!)
useEffect(() => {
  fetch(`${API}/veterinarians`) // ili `${API}/users?role=VETERINARIAN`
    .then(async r => r.ok ? r.json() : [])
    .then(d => {
      const list = pickArray(d);
      setVets(list);
      if (list.length && !selectedVet) setSelectedVet(list[0].id);
    })
    .catch(err => console.error('Vets fetch error:', err));
}, []);

// ako se prebaciš na "vet" i nema izabrano – postavi prvog
useEffect(() => {
  if (view === 'vet' && !selectedVet && vets.length) {
    setSelectedVet(vets[0].id);
  }
}, [view, vets, selectedVet]);

// u renderu:
{view === 'vet' && (
  <div className="control-right">
    <label>Veterinar</label>
    <select
      value={selectedVet}
      onChange={e => setSelectedVet(Number(e.target.value))}
    >
      {vets.map(v => (
        <option key={v.id} value={v.id}>
          {v.firstName} {v.lastName}
        </option>
      ))}
    </select>
  </div>
)}


  // učitaj PETS flat (bez/sa pretragom), sa debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoadingPets(true);
      try {
        const url = petSearch?.trim()
          ? `${API}/pets/flat/search?q=${encodeURIComponent(petSearch.trim())}`
          : `${API}/pets/flat`;
        const r = await fetch(url);
        const data = r.ok ? await r.json() : [];
        setPets(Array.isArray(data) ? data : []);
        if (data?.length && !selectedPet) setSelectedPet(data[0].id);
        // ako je trenutni selectedPet izbačen filtriranjem, pomeri ga na prvi
        if (data?.length && selectedPet && !data.find(p => p.id === selectedPet)) {
          setSelectedPet(data[0].id);
        }
      } finally {
        setLoadingPets(false);
      }
    }, 300); // 300ms debounce
    return () => clearTimeout(debounceRef.current);
  }, [petSearch]); // svaki put kad se menja search

  // učitaj prema view-u
  useEffect(() => {
    if (view === 'day') fetchDay();
    if (view === 'vet') fetchVetDay();
    if (view === 'patient') fetchPet();
    // eslint-disable-next-line
  }, [view, date, selectedVet, selectedPet]);

  const fetchDay = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/calendars/day?date=${date}`);
      const data = res.ok ? await res.json() : [];
      setEvents(data);
    } finally { setLoading(false); }
  };

  const fetchVetDay = async () => {
    if (!selectedVet) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/calendars/veterinarians/${selectedVet}/day?date=${date}`);
      const data = res.ok ? await res.json() : [];
      setEvents(data);
    } finally { setLoading(false); }
  };

  const fetchPet = async () => {
    if (!selectedPet) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/calendars/patients/${selectedPet}/appointments`);
      const data = res.ok ? await res.json() : [];
      setEvents(data);
    } finally { setLoading(false); }
  };

  // slotovi na timeline-u (08:00–16:00 kao kod tebe)
  const hours = useMemo(() => {
    const h = [];
    for (let i = 8; i <= 16; i++) h.push(`${String(i).padStart(2,'0')}:00`);
    return h;
  }, []);

  const onLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="staff-wrap">
      {/* Header */}
      <header className="staff-header">
        <div className="brand">
          <div className="logo-dot">🐾</div>
          <div>
            <h1 className="brand-title">PetClinic</h1>
            <p className="brand-sub">Ambulanta za ljubimce</p>
          </div>
        </div>

        <div className="nav-center">
          <button className={`pill ${view==='day'?'active':''}`} onClick={()=>setView('day')}>Pregled po danu</button>
          <button className={`pill ${view==='vet'?'active':''}`} onClick={()=>setView('vet')}>Pregled po veterinaru</button>
          <button className={`pill ${view==='patient'?'active':''}`} onClick={()=>setView('patient')}>Pregled po pacijentu</button>
        </div>

        <div className="userbox">
          <span className="role-label">Administrator</span>
          <button className="logout" onClick={onLogout}>Log out</button>
        </div>
      </header>

      {/* Controls */}
      <div className="controls">
        <div className="control-left">
          <label>Datum</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        </div>

        {view === 'vet' && (
          <div className="control-right">
            <label>Veterinar</label>
            <select value={selectedVet} onChange={e=>setSelectedVet(Number(e.target.value))}>
              {vets.map(v => (
                <option key={v.id} value={v.id}>
                  {v.firstName} {v.lastName}
                </option>
              ))}
            </select>
          </div>
        )}

        {view === 'patient' && (
          <>
            <div className="control-right">
              <label>Pretraga pacijenata</label>
              <input
                type="text"
                className="pet-search"
                placeholder="npr. Maza, Luna, Nada…"
                value={petSearch}
                onChange={(e)=>setPetSearch(e.target.value)}
              />
            </div>

            <div className="control-right">
              <label>Pacijent</label>
         <select
  value={selectedPet}
  onChange={e => setSelectedPet(Number(e.target.value))}
  disabled={loadingPets}
>
  {pets.map(p => {
    // title iz više mogućih polja (flat DTO ili full Pet)
    const label =
      p.label ??
      p.name ??
      p.description ??
      `Ljubimac #${p.id}`;

    // owner može biti string (flat DTO: 'owner') ili objekat (full Pet: { owner: { firstName,lastName } })
    let ownerText = '';
    if (typeof p.owner === 'string') {
      ownerText = p.owner;
    } else if (p.owner && typeof p.owner === 'object') {
      const fn = p.owner.firstName || '';
      const ln = p.owner.lastName || '';
      ownerText = `${fn} ${ln}`.trim();
    } else {
      // ako DTO ima drugačije ime polja, pokrij i to
      ownerText =
        p.ownerName ??
        p.owner_full ??
        [p.ownerFirstName, p.ownerLastName].filter(Boolean).join(' ');
    }

    return (
      <option key={p.id} value={p.id}>
        {label}{ownerText ? ` — ${ownerText}` : ''}
      </option>
    );
  })}
</select>

              {loadingPets && <small className="hint-muted">Učitavam listu…</small>}
            </div>
          </>
        )}
      </div>

      {/* Timeline */}
      <div className="calendar-card">
        <div className="times">
          {hours.map(h => <div key={h} className="time">{h}</div>)}
        </div>

        <div className="events">
          {loading && <div className="loading">Učitavanje…</div>}
          {!loading && events.map(ev => (
            <div key={ev.id} className={`event ${statusColor(ev.status)}`}>
              <div className="event-time">
                {ev.startAt?.slice(11,16)}–{ev.endAt?.slice(11,16)}
              </div>
              <div className="event-title">
                <strong>{ev.serviceName}</strong>
              </div>
              <div className="event-desc">
                {view !== 'vet' && <span>{ev.vetName}</span>}
                {view !== 'patient' && <span> • {ev.petName}</span>}
                {ev.urgent && <span className="urgent"> • Hitan</span>}
              </div>
            </div>
          ))}
          {!loading && events.length === 0 && (
            <div className="no-data">Nema termina za izabrane filtere.</div>
          )}
        </div>
      </div>

      {/* Legenda */}
      <div className="legend">
        <span><i className="dot dot-blue" /> Zakazan</span>
        <span><i className="dot dot-yellow" /> U toku</span>
        <span><i className="dot dot-green" /> Završen</span>
        <span><i className="dot dot-gray" /> Otkažan</span>
        <span><i className="dot dot-red" /> Hitan</span>
      </div>
    </div>
  );
}
