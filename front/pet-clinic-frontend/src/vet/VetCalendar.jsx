import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VetCalendar.css';

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

export default function VetCalendar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);             // ulogovani vet (User)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // guard – samo veterinari
  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) { navigate('/'); return; }
    const u = JSON.parse(raw);
    setUser(u);
    if (u.role !== 'VETERINARIAN') {
      // po potrebi preusmeri druge role
      if (u.role === 'STAFF_ADMIN') navigate('/staff');
      else navigate('/user');
    }
  }, [navigate]);

  // učitaj dane vet termina
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/calendars/veterinarians/${user.id}/day?date=${date}`);
        const data = res.ok ? await res.json() : [];
        setEvents(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id, date]);

  // vremenska osa (08–16)
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

  const vetDisplayName = user ? `${user.firstName ?? 'Dr.'} ${user.lastName ?? ''}`.trim() : 'Veterinar';

  return (
    <div className="vet-wrap">
      {/* Header */}
      <header className="vet-header">
        <div className="brand">
          <div className="logo-dot">🐾</div>
          <div>
            <h1 className="brand-title">PetClinic</h1>
            <p className="brand-sub">Ambulanta za ljubimce</p>
          </div>
        </div>

        <button className="primary-cta" onClick={() => { /* eventualno prebacivanje na dnevni summary */ }}>
          Pregled kalendara
        </button>

        <div className="userbox">
          <span className="role-label">Dr. {vetDisplayName}</span>
          <button className="logout" onClick={onLogout}>Log out</button>
        </div>
      </header>

      {/* Naslov i filter datuma */}
      <section className="topbar">
        <h2 className="page-title">Pregled kalendara — {vetDisplayName}</h2>

        <div className="topbar-controls">
          <div className="control">
            <label>Datum</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="layout">
        {/* Timeline levo */}
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
                  {ev.urgent && <span className="urgent"> • HITNO</span>}
                </div>
                <div className="event-desc">• {ev.petName}</div>
              </div>
            ))}
            {!loading && events.length === 0 && (
              <div className="no-data">Nema termina za izabrani dan.</div>
            )}
          </div>
        </div>

        {/* Desni panel – Pacijenti danas */}
        <aside className="side-panel">
          <h3>Pacijenti danas</h3>
          <div className="side-list">
            {events.map(ev => (
              <div key={`side-${ev.id}`} className="side-item">
                <div className="side-time">
                  {ev.startAt?.slice(11,16)}
                </div>
                <div className="side-info">
                  <div className="side-title">
                    {ev.petName} — {ev.serviceName}
                  </div>
                  <div className="side-status">
                    Status: {ev.status === 'IN_PROGRESS' ? 'U toku' :
                             ev.status === 'COMPLETED'  ? 'Završen' :
                             ev.status === 'CANCELLED'  ? 'Otkažan' : 'Zakazan'}
                    {ev.urgent && <span className="side-urgent"> • Hitan</span>}
                  </div>
                </div>
                <button className="btn-open">Otvori karton</button>
              </div>
            ))}
            {!events.length && <div className="muted">Nema pacijenata za danas.</div>}
          </div>
        </aside>
      </section>

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
