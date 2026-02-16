import React, { useEffect, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import {

  ResponsiveContainer,

  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,

  BarChart, Bar,

  PieChart, Pie, Cell

} from 'recharts';

import './StaffPage.css';



const API_BASE = 'http://localhost:8080/api/analyticss';



const fmtDate = (d) => new Date(d).toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit' });



// helper za query

const qs = (o) =>

  Object.entries(o)

    .filter(([, v]) => v !== undefined && v !== null && v !== '')

    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)

    .join('&');



// za boje grafika

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#64748B'];



export default function StaffPage() {

  const navigate = useNavigate();



  // period: poslednjih 30 dana

  const today = new Date();

  const fromDefault = new Date(today); fromDefault.setDate(today.getDate() - 29);

  const [from, setFrom] = useState(fromDefault.toISOString().slice(0, 10));

  const [to, setTo] = useState(today.toISOString().slice(0, 10));



  const [status, setStatus] = useState('ALL');

  const [veterinarianId, setVeterinarianId] = useState(''); // opciono



  const [dataAll, setDataAll] = useState(null);

  const [dataCompleted, setDataCompleted] = useState(null);

  const [dataScheduled, setDataScheduled] = useState(null);



  const [loading, setLoading] = useState(false);

  const [err, setErr] = useState('');

 



  const handleLogout = () => {

    if (window.confirm('Da li ste sigurni da se želite odjaviti?')) {

      localStorage.removeItem('user');

      localStorage.removeItem('token');

      navigate('/');

    }

  };



  const handleBackToDashboard = () => navigate('/manager-dashboard');



  // ===== FETCH =====

  const fetchOne = async (statusParam = 'ALL') => {

    const query = qs({

      from, to,

      status: statusParam,

      veterinarianId: veterinarianId || undefined

    });

    const r = await fetch(`${API_BASE}/appointments?${query}`);

    if (!r.ok) throw new Error(`Greška ${r.status}`);

    return r.json();

  };



  const load = async () => {

    try {

      setLoading(true);

      setErr('');

      // uvek povuci ALL + COMPLETED + SCHEDULED (za utilization),

      // a izabrani status koristi se za KPI-ove (ispod)

      const [all, done, sched] = await Promise.all([

        fetchOne('ALL'),

        fetchOne('COMPLETED'),

        fetchOne('SCHEDULED'),

      ]);

      setDataAll(all);

      setDataCompleted(done);

      setDataScheduled(sched);

    } catch (e) {

      console.error(e);

      setErr(e.message || 'Greška pri učitavanju analitike.');

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => { load(); /* eslint-disable-next-line */ }, [from, to, veterinarianId]);



  // ===== DERIVATIONS =====

  // za KPI prikaz po statusu koristi izabrani status (ako je ALL, prikaži raspad po svim statusima iz dataAll)

  const kpis = useMemo(() => {

    if (!dataAll) return null;

    const total = dataAll.total || 0;

    const byStatus = dataAll.byStatus || {};

    const scheduled = byStatus.SCHEDULED || 0;

    const completed = byStatus.COMPLETED || 0;

    const cancelled = byStatus.CANCELLED || 0;

    const inProgress = byStatus.IN_PROGRESS || 0;

    return { total, scheduled, completed, cancelled, inProgress };

  }, [dataAll]);



  // daily (linijski)

  const dailySeries = useMemo(() => {

    if (!dataAll?.daily) return [];

    return dataAll.daily.map((d) => ({ day: fmtDate(d.day), count: d.count }));

  }, [dataAll]);



  // po vrsti životinje (bar)

  const byAnimal = useMemo(() => {

    if (!dataAll?.byAnimalType) return [];

    return dataAll.byAnimalType.map((x) => ({ key: x.key || '(Nepoznato)', count: x.count }));

  }, [dataAll]);



  // po intervenciji (pie)

  const byIntervention = useMemo(() => {

    if (!dataAll?.byIntervention) return [];

    return dataAll.byIntervention.map((x) => ({ key: x.key || '(Nedef.)', value: x.count }));

  }, [dataAll]);



  // utilization: completed / (completed + scheduled) po vrsti životinje i po intervenciji

  const utilizationBy = (doneArr = [], schedArr = []) => {

    const mapDone = new Map(doneArr.map((x) => [x.key || '(?)', x.count]));

    const mapSched = new Map(schedArr.map((x) => [x.key || '(?)', x.count]));

    const allKeys = new Set([...mapDone.keys(), ...mapSched.keys()]);

    const rows = [];

    for (const k of allKeys) {

      const d = mapDone.get(k) || 0;

      const s = mapSched.get(k) || 0;

      const denom = d + s;

      const rate = denom > 0 ? +( (d / denom) * 100 ).toFixed(1) : 0;

      rows.push({ key: k, rate, completed: d, scheduled: s });

    }

    return rows.sort((a,b)=>b.rate-a.rate);

  };



  const utilizationAnimal = useMemo(() => {

    const done = (dataCompleted?.byAnimalType || []).map(x => ({ key: x.key, count: x.count }));

    const sched = (dataScheduled?.byAnimalType || []).map(x => ({ key: x.key, count: x.count }));

    return utilizationBy(done, sched);

  }, [dataCompleted, dataScheduled]);



  const utilizationInterv = useMemo(() => {

    const done = (dataCompleted?.byIntervention || []).map(x => ({ key: x.key, count: x.count }));

    const sched = (dataScheduled?.byIntervention || []).map(x => ({ key: x.key, count: x.count }));

    return utilizationBy(done, sched);

  }, [dataCompleted, dataScheduled]);



  return (

    <div className="staff-page">

      {/* Header */}

      <div className="staff-header">

        <div className="brand-section">

          <div className="brand-text">

            <p className="pet-clinic-title">PetClinic</p>

            <p className="ambulanta-subtitle">Ambulanta za ljubimce</p>

          </div>

        </div>



        <div className="filters-row">

          <div className="field">

            <label>Od</label>

            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />

          </div>

          <div className="field">

            <label>Do</label>

            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />

          </div>

          <div className="field">

            <label>Vet ID (opciono)</label>

            <input type="number" min="1" placeholder="npr. 3"

                   value={veterinarianId}

                   onChange={(e) => setVeterinarianId(e.target.value)} />

          </div>

          <button className="btn ghost" onClick={load} disabled={loading}>Osveži</button>

        </div>



        <div className="user-section">

          <button className="logout-btn" onClick={handleLogout}>Log out</button>

        </div>

      </div>



      {/* Main Content */}

      <div className="staff-content">

        <div className="content-header">

          <button className="back-btn" onClick={handleBackToDashboard}>← Nazad na Dashboard</button>

          <h1>Analitika zakazivanja</h1>

          <p>Broj termina i iskorišćenost po vrsti životinje i vrsti intervencije</p>

        </div>



        {err && <div className="error">{err}</div>}

        {loading && <div className="loading">Učitavanje analitike…</div>}



        {/* KPIs */}

        {kpis && (

          <div className="kpi-grid">

            <div className="kpi">

              <div className="kpi-label">Ukupno termina</div>

              <div className="kpi-value">{kpis.total}</div>

            </div>

            <div className="kpi">

              <div className="kpi-label">Zakazani</div>

              <div className="kpi-value blue">{kpis.scheduled}</div>

            </div>

            <div className="kpi">

              <div className="kpi-label">U toku</div>

              <div className="kpi-value violet">{kpis.inProgress}</div>

            </div>

            <div className="kpi">

              <div className="kpi-label">Završeni</div>

              <div className="kpi-value green">{kpis.completed}</div>

            </div>

            <div className="kpi">

              <div className="kpi-label">Otkazani</div>

              <div className="kpi-value red">{kpis.cancelled}</div>

            </div>

          </div>

        )}



        {/* Charts */}

        <div className="charts-grid">

          <div className="card">

            <div className="card-title">Termini po danu</div>

            <div className="chart-wrap">

              <ResponsiveContainer width="100%" height={260}>

                <LineChart data={dailySeries}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="day" />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Legend />

                  <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} dot={false} name="Broj termina" />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </div>



          <div className="card">

            <div className="card-title">Po vrsti životinje</div>

            <div className="chart-wrap">

              <ResponsiveContainer width="100%" height={260}>

                <BarChart data={byAnimal}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="key" />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Bar dataKey="count" name="Termini">

                    {byAnimal.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}

                  </Bar>

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>



     <div className="card">

  <div className="card-title">Po intervenciji</div>

  <div className="chart-wrap">

    <ResponsiveContainer width="100%" height={260}>

      <PieChart>

        {/* Legend će koristiti nameKey iz Pie */}

        <Legend />

        <Tooltip

          // pokaži: "Hirurgija: 12"

          formatter={(v, _name, props) => [v, props?.payload?.key ?? 'Intervencija']}

        />

        <Pie

          data={byIntervention}

          dataKey="value"   // broj termina

          nameKey="key"     // NAZIV INTERVENCIJE  👈 ključni deo

          outerRadius={100}

          label={(entry) => `${entry.key} (${entry.value})`}

        >

          {byIntervention.map((_, i) => (

            <Cell key={i} fill={COLORS[i % COLORS.length]} />

          ))}

        </Pie>

      </PieChart>

    </ResponsiveContainer>

  </div>

</div>





          <div className="card">

            <div className="card-title">Iskorišćenost po vrsti životinje</div>

            <div className="chart-wrap">

              <ResponsiveContainer width="100%" height={260}>

                <BarChart data={utilizationAnimal}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="key" />

                  <YAxis unit="%" domain={[0, 100]} />

                  <Tooltip formatter={(v) => `${v}%`} />

                  <Legend />

                  <Bar dataKey="rate" name="Završeno/(Zak.+Zavr.)">

                    {utilizationAnimal.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}

                  </Bar>

                </BarChart>

              </ResponsiveContainer>

            </div>

            <div className="hint">Formula: COMPLETED / (COMPLETED + SCHEDULED)</div>

          </div>



          <div className="card">

            <div className="card-title">Iskorišćenost po intervenciji</div>

            <div className="chart-wrap">

              <ResponsiveContainer width="100%" height={260}>

                <BarChart data={utilizationInterv}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="key" />

                  <YAxis unit="%" domain={[0, 100]} />

                  <Tooltip formatter={(v) => `${v}%`} />

                  <Legend />

                  <Bar dataKey="rate" name="Završeno/(Zak.+Zavr.)">

                    {utilizationInterv.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}

                  </Bar>

                </BarChart>

              </ResponsiveContainer>

            </div>

            <div className="hint">Više znači bolju realizaciju termina za datu intervenciju.</div>

          </div>

        </div>

      </div>

    </div>

  );

}