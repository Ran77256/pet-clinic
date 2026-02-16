import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './ScheduleAppointmentPage.css';

const API_BASE = 'http://localhost:8080/api';

const APPOINTMENT_DURATIONS = {
    'Vakcinacija': 30, // 30 minuta
    'Redovan pregled': 45, // 45 minuta
    'Zdravstveni problem': 45, // 45 minuta
    'Laboratorijske analize': 30, // 30 minuta
    'Čipovanje': 30, // 30 minuta
    'Ultrazvuk': 60, // 60 minuta
    'Kastracija/sterilizacija': 120, // 2 sata (operativni termini)
    'Ostalo': 60, // 60 minuta
    // Napomena: BE treba da proverava i validira trajanje termina, ovo je samo za UI.
};

const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString('sr-RS', { year: 'numeric', month: '2-digit', day: '2-digit' });

export default function ScheduleAppointmentPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [pets, setPets] = useState([]);
    const [waitlist, setWaitlist] = useState([]);

    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        petId: '',
        appointmentDate: '',
        appointmentTime: '',
        reason: '',
        notes: ''
    });

    // Izračunato trajanje termina
    const appointmentDurationMinutes = useMemo(() => {
        return APPOINTMENT_DURATIONS[formData.reason] || 30; // Podrazumevano 30 min
    }, [formData.reason]);

    const today = useMemo(() => new Date().toISOString().split('T')[0], []);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login'); // Preusmeri ako nema korisnika
            return;
        }
        try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            if (parsedUser?.id) {
                fetchUserPets(parsedUser.id);
                fetchWaitlist(parsedUser.id);
            }
        } catch (e) {
            console.error('Error parsing user data:', e);
            navigate('/login');
        }
    }, [navigate]);

    const authHeaders = () => {
        const token = localStorage.getItem('token');
        const h = { Accept: 'application/json', 'Content-Type': 'application/json' };
        if (token) h['Authorization'] = `Bearer ${token}`;
        return h;
    };

    const fetchUserPets = async (userId) => {
        try {
            const res = await fetch(`${API_BASE}/pets/by-owner/${userId}`, { headers: authHeaders() });
            if (!res.ok) throw new Error('Pets fetch failed');
            const petsData = await res.json();
            setPets(Array.isArray(petsData) ? petsData : []);
            // Ako ima samo 1 pet, automatski ga izaberi
            if (petsData.length === 1 && !formData.petId) {
                setFormData(prev => ({ ...prev, petId: String(petsData[0].id) }));
            }
        } catch (e) {
            console.error(e);
            setPets([]);
        }
    };

    // GET waitlist za vlasnika
    const fetchWaitlist = async (ownerId) => {
        try {
            const url = `${API_BASE}/waitlist?ownerId=${ownerId}&onlyActive=true`;
            const r = await fetch(url, { headers: authHeaders() });
            if (!r.ok) throw new Error('Waitlist fetch failed');
            const data = await r.json();
            setWaitlist(Array.isArray(data) ? data : []);
        } catch (e) {
            console.warn('Waitlist fetch:', e.message);
            setWaitlist([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Glavna submit funkcija
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.petId) return alert('Molimo izaberite ljubimca');
        if (!formData.appointmentDate) return alert('Molimo unesite datum termina');
        if (!formData.appointmentTime) return alert('Molimo unesite vreme termina');
        if (!formData.reason.trim()) return alert('Molimo izaberite razlog posete');

        const payloadBase = {
            petId: Number(formData.petId),
            appointmentDate: formData.appointmentDate, // "YYYY-MM-DD"
            appointmentTime: formData.appointmentTime, // "HH:mm"
            durationMinutes: appointmentDurationMinutes, // DODATO TRAJANJE
            reason: formData.reason,
            notes: formData.notes
        };

        setSubmitting(true);
        try {
            let res = await fetch(`${API_BASE}/appointments`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(payloadBase)
            });

            if (res.ok && res.status < 300) {
                const created = await res.json();
                console.log('✅ Kreiran termin:', created);
                alert('Termin je uspešno zakazan.');
                navigate('/user');
                return;
            }

            if (res.status === 202) {
                alert('Traženi termin je zauzet. Dodati ste na listu čekanja. Obavestićemo Vas pri oslobađanju.');
                if (user?.id) await fetchWaitlist(user.id);
                return;
            }

            const txt = await res.text();
            const isSlotTaken = res.status === 409 || /zauzet|exists|conflict|already/i.test(txt);

            if (isSlotTaken) {
                const wants = window.confirm(
                    `Termin ${formData.appointmentDate} u ${formData.appointmentTime} (trajanje ${appointmentDurationMinutes} min) je zauzet.\n` +
                    `Da li želite da dodamo ljubimca na listu čekanja?`
                );
                if (!wants) return;

                const payloadWait = { ...payloadBase, joinWaitlist: true };
                const res2 = await fetch(`${API_BASE}/appointments`, {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify(payloadWait)
                });

                if (res2.status === 202) {
                    alert('Dodati ste na listu čekanja za traženi termin.');
                    if (user?.id) await fetchWaitlist(user.id);
                    return;
                }
                
                const t2 = await res2.text();
                throw new Error(t2 || 'Neuspešno dodavanje na listu čekanja.');
            }

            throw new Error(txt || 'Greška pri zakazivanju.');
        } catch (err) {
            console.error(err);
            alert(`Greška: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Da li ste sigurni da se želite odjaviti?')) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            navigate('/');
        }
    };

    const handlePriceList = () => navigate('/price-list');
    const handleAddPet = () => navigate('/add-pet');
    const handleWaitlist = () => navigate('/waitlist');
    const handleBackToDashboard = () => navigate('/user');

    // Novi slots niz bez 17:00
    const availableSlots = useMemo(() => [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', // Poslednji termin počinje u 16:00
    ], []);

    return (
        <div className="schedule-appointment-page">
            {/* Header: Čistiji izgled, bez suvišnog "Nazad na dashboard" */}
            <header className="schedule-header">
                <div className="brand-section" onClick={handleBackToDashboard} style={{ cursor: 'pointer' }}>
                    <p className="pet-clinic-title">PetClinic</p>
                    <p className="ambulanta-subtitle">Ambulanta za ljubimce</p>
                </div>
                <h1 className="page-title">Zakaži novi termin</h1>
                <div className="action-buttons">
                    <button className="action-btn secondary" onClick={handlePriceList}>Cenovnik</button>
                    <button className="action-btn secondary" onClick={handleAddPet}>Dodaj ljubimca</button>
                    <button className="action-btn secondary" onClick={handleWaitlist}>
                        Lista čekanja ({waitlist.length})
                    </button>
                    <div className="user-section">
                        <span className="user-name">{user?.firstName || 'Korisnik'}</span>
                        <button className="logout-btn" onClick={handleLogout}>Log out</button>
                    </div>
                </div>
            </header>

            {/* Main Content: Dve kolone, fokus na formi */}
            <div className="schedule-content">
                
                {/* LEVA STRANA: Forma za zakazivanje */}
                <div className="appointment-form-container">
                    <div className="form-header">
                        <h2>Detalji termina</h2>
                        <p>Izaberite ljubimca i uslugu da biste odredili datum i vreme.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="appointment-form">
                        
                        {/* Pet Selection */}
                        <div className="form-group pet-select">
                            <label htmlFor="petId">Izaberite ljubimca *</label>
                            <select id="petId" name="petId" value={formData.petId} onChange={handleInputChange} required>
                                <option value="">Izaberite ljubimca...</option>
                                {pets.map((pet) => (
                                    <option key={pet.id} value={pet.id}>
                                        {pet.name} 
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Reason (Usluga) */}
                        <div className="form-group reason-select">
                            <label htmlFor="reason">Razlog posete / Usluga *</label>
                            <select id="reason" name="reason" value={formData.reason} onChange={handleInputChange} required>
                                <option value="">Izaberite uslugu...</option>
                                {Object.keys(APPOINTMENT_DURATIONS).map(reason => (
                                     <option key={reason} value={reason}>
                                        {reason} (trajanje: {APPOINTMENT_DURATIONS[reason]} min)
                                    </option>
                                ))}
                            </select>
                            {formData.reason && (
                                <p className="duration-info">
                                    ⏱️ Izabrana usluga traje približno **{appointmentDurationMinutes} minuta**.
                                </p>
                            )}
                        </div>

                        {/* Date Selection */}
                        <div className="form-group date-select">
                            <label htmlFor="appointmentDate">Datum termina *</label>
                            <input
                                type="date"
                                id="appointmentDate"
                                name="appointmentDate"
                                value={formData.appointmentDate}
                                onChange={handleInputChange}
                                min={today}
                                required
                            />
                        </div>

                        {/* Time Slot Selection */}
                        <div className="form-group time-select">
                            <label htmlFor="appointmentTime">Vreme termina *</label>
                            <div className="time-slots-grid">
                                {availableSlots.map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        className={`slot-btn ${formData.appointmentTime === t ? 'selected' : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, appointmentTime: t }))}
                                    >
                                        {t} - {t.replace(/(\d+):(\d+)/, (m, h, min) => {
                                            const start = new Date(1970, 0, 1, h, min);
                                            start.setMinutes(start.getMinutes() + appointmentDurationMinutes);
                                            return `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
                                        })}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="hidden"
                                id="appointmentTime"
                                name="appointmentTime"
                                value={formData.appointmentTime}
                                required
                            />
                        </div>
                        
                        {/* Notes */}
                        <div className="form-group notes-area">
                            <label htmlFor="notes">Dodatne napomene (Opciono)</label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="Opišite dodatne simptome ili napomene..."
                            />
                        </div>

                        {/* Form Actions */}
                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={handleBackToDashboard}>
                                Otkaži
                            </button>
                            <button type="submit" className="btn-submit" disabled={submitting || !formData.appointmentTime}>
                                {submitting ? 'Slanje…' : 'Zakaži termin'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* DESNA STRANA: Informacije + Lista čekanja */}
                <div className="appointment-info-container">
                    <div className="appointment-info">
                        <h3>ℹ️ Informacije o klinici</h3>
                        <ul>
                            <li>**Radno vreme:** pon–ned: 08:00–16:30</li>
                
                            <li>**Hitni slučajevi:** pozovite 021/123-456</li>
                            <li>Termin je rezervisan tek nakon potvrde klinike</li>
                        </ul>
                    </div>

                    <div className="waitlist-box">
                        <h3 className="waitlist-title">📋 Moja lista čekanja</h3>
                        {waitlist.length === 0 ? (
                            <p className="waitlist-empty"></p>
                        ) : (
                            <div className="waitlist-list">
                          {waitlist.slice(0, 3).map((item) => (
    <div key={item.id} className="waitlist-item">
        <div className="w-row">
           
        </div>
        <div className="w-row">
          
        </div>
        <div className="w-row">
     
        </div>
    </div>
))}
                                {waitlist.length > 3 && (
                                    <p className="waitlist-more" onClick={handleWaitlist} style={{cursor: 'pointer', color: '#667eea', fontWeight: 'bold'}}>
                                        ...i još {waitlist.length - 3} ({'Prikaži sve'})
                                    </p>
                                )}
                            </div>
                        )}
                        <button className="action-btn secondary full-width mt-3" onClick={handleWaitlist}>
                            Upravljaj listom
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Pomoćna klasa za celu širinu dugmeta
// Dodajte u CSS
// .full-width { width: 100%; }