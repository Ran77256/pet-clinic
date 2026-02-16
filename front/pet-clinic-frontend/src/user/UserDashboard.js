// src/pages/UserDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';

const API_BASE = 'http://localhost:8080/api';

function UserDashboard() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Zakazani termini
  const [showAppointments, setShowAppointments] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [apptLoading, setApptLoading] = useState(false);
  const [apptFilter, setApptFilter] = useState('ALL');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        if (parsedUser.id) {
          fetchUserPets(parsedUser.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUser({ firstName: 'Klijent' });
        setLoading(false);
      }
    } else {
      setUser({ firstName: 'Klijent' });
      setLoading(false);
    }
  }, [navigate]);

  const fetchUserPets = async (userId) => {
    try {
      setLoading(true);
      const ownerIdForBackend = Number(userId);
      const token = localStorage.getItem('token');

      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let response = await fetch(`${API_BASE}/pets/by-owner/${ownerIdForBackend}`, { headers });
      let data = null;

      if (response.ok) {
        data = await response.json();
        if (!Array.isArray(data)) data = data ? [data] : [];
      } else {
        // fallback: /pets?ownerId
        response = await fetch(`${API_BASE}/pets?ownerId=${ownerIdForBackend}`, { headers });
        if (response.ok) {
          data = await response.json();
        } else {
          // fallback: /pets (pa filtriramo)
          response = await fetch(`${API_BASE}/pets`, { headers });
          if (response.ok) {
            const allPets = await response.json();
            data = Array.isArray(allPets)
              ? allPets.filter(p => (p.owner?.id || p.ownerId || p.owner_id) === ownerIdForBackend)
              : [];
          }
        }
      }
      setPets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Network error fetching pets:', error);
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  // ===== Zakazani termini (GET + CANCEL) =====
  const fetchAppointments = async (ownerId, status = 'ALL') => {
    try {
      setApptLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Accept': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/owner-appointments/${ownerId}?status=${status}`, { headers });
      if (!res.ok) throw new Error(`Greška ${res.status}`);
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setAppointments([]);
    } finally {
      setApptLoading(false);
    }
  };

  const handleOpenAppointments = async () => {
    if (!user?.id) return alert('Nedostaje ID korisnika.');
    await fetchAppointments(user.id, apptFilter);
    setShowAppointments(true);
  };

  const handleChangeFilter = async (value) => {
    setApptFilter(value);
    if (user?.id) await fetchAppointments(user.id, value);
  };

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('Da li želite da otkažete termin?')) return;
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/owner-appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
        headers
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Neuspešno otkazivanje.');
      }
      // Optimistički update
      setAppointments(prev =>
        prev.map(a => (a.id === appointmentId ? { ...a, status: 'CANCELLED' } : a))
      );
    } catch (e) {
      console.error(e);
      alert(`Greška pri otkazivanju: ${e.message}`);
    }
  };
  // ===========================================

  const handleLogout = () => {
    if (window.confirm('Da li ste sigurni da se želite odjaviti?')) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  const handleAddPet = () => navigate('/add-pet');
  const handlePriceList = () => navigate('/user-price-list');
  const handleScheduleAppointment = () => navigate('/schedule-appointment');

  const handlePetDetails = (petId, event) => {
    if (event) event.stopPropagation();
    navigate(`/pet-details/${petId}`);
  };

  return (
    <div className="user-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="brand-section">
          <p className="pet-clinic-title">PetClinic</p>
          <p className="ambulanta-subtitle">Ambulanta za ljubimce</p>
        </div>

        <div className="action-buttons">
          <button className="action-btn primary" onClick={handleScheduleAppointment}>
            Zakaži termin
          </button>
          <button className="action-btn secondary" onClick={handleOpenAppointments}>
            Zakazani termini
          </button>
          <button className="action-btn secondary" onClick={handlePriceList}>
            Cenovnik
          </button>
            <button className="action-btn secondary" onClick={() => navigate('/waitlist')}>
    Moja lista čekanja
  </button>
          <button className="action-btn primary" onClick={handleAddPet}>
            Dodaj ljubimca
          </button>
        </div>

        <div className="user-section">
          <span className="user-name">{user?.firstName || 'Klijent'}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {/* Sekcija ljubimaca */}
        <div className="pets-section">
          <h2 className="section-title">Tvoji ljubimci</h2>

          {loading ? (
            <div className="loading">Učitavanje ljubimaca...</div>
          ) : pets.length === 0 ? (
            <div className="no-pets">
              <p>Nemate registrovane ljubimce</p>
              <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '10px' }}>
                Možete dodati svojeg prvog ljubimca klikom na dugme ispod.
              </p>
              <button className="add-first-pet-btn" onClick={handleAddPet}>
                Dodaj prvog ljubimca
              </button>
            </div>
          ) : (
            <div className="pets-grid">
              {pets.map((pet) => (
                <div key={pet.id} className="pet-card" onClick={() => handlePetDetails(pet.id)}>
                  <div className="pet-info">
                    <h3 className="pet-name">Ime: {pet.name || 'Nepoznato ime'}</h3>
                    <p className="pet-detail">
                      Vrsta: {pet.animalTypeName || pet.animaltype?.name || pet.species?.name || 'N/A'}
                    </p>
                    <p className="pet-detail">Rasa: {pet.breed?.name || pet.breedName || 'N/A'}</p>
                    {pet.birthDate && (
                      <p className="pet-detail">
                        Datum rođenja: {new Date(pet.birthDate).toLocaleDateString('sr-RS')}
                      </p>
                    )}
                    {pet.microchipNumber && <p className="pet-detail">Mikročip: {pet.microchipNumber}</p>}
                  </div>
                  <button className="pet-action-btn" onClick={(e) => handlePetDetails(pet.id, e)}>
                    Profil
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Celookvirna sekcija: Zakazani termini */}
        {showAppointments && (
          <section className="appointments-section">
            <div className="appointments-topbar">
              <h2 className="section-title" style={{ margin: 0 }}>Zakazani termini</h2>
              <div className="appointments-controls">
                <select
                  className="filter-select"
                  value={apptFilter}
                  onChange={(e) => handleChangeFilter(e.target.value)}
                >
                  <option value="ALL">Svi</option>
                  <option value="SCHEDULED">Zakazani</option>
                  <option value="CANCELLED">Otkazani</option>
                  <option value="COMPLETED">Završeni</option>
                </select>
                <button className="action-btn secondary" onClick={() => setShowAppointments(false)}>
                  Zatvori
                </button>
              </div>
            </div>

            {apptLoading ? (
              <div className="loading">Učitavanje termina...</div>
            ) : appointments.length === 0 ? (
              <div className="no-pets">Nema termina.</div>
            ) : (
              <div className="appointments-table-wrap">
                <table className="appointments-table">
                  <thead>
                    <tr>
                     
                      <th>Ljubimac</th>
                      <th>Veterinar</th> {/* NOVO */}
                      <th>Datum i vreme</th>
                      <th>Status</th>
                      <th>Akcija</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a) => (
                      <tr key={a.id}>
                     
                        <td>{a.petName} (#{a.petId})</td>
                        <td>
                          {a.veterinarianName
                            ? `${a.veterinarianName}${a.veterinarianId ? ` (#${a.veterinarianId})` : ''}`
                            : '—'}
                        </td>
                        <td>{new Date(a.appointmentDate).toLocaleString('sr-RS')}</td>
                        <td>
                          <span className={`badge ${a.status?.toLowerCase()}`}>{a.status}</span>
                        </td>
                        <td>
                          <button
                            className="action-btn danger"
                            disabled={a.status !== 'SCHEDULED'}
                            onClick={() => cancelAppointment(a.id)}
                            title={a.status !== 'SCHEDULED' ? 'Samo zakazani se mogu otkazati' : 'Otkaži termin'}
                          >
                            Otkaži
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
