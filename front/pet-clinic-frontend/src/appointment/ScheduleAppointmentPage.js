import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ScheduleAppointmentPage.css';

const ScheduleAppointmentPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [formData, setFormData] = useState({
    petId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // Fetch user's pets
        fetchUserPets(parsedUser.id);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const fetchUserPets = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:8080/api/pets/by-owner/${userId}`, { headers });
      if (response.ok) {
        const petsData = await response.json();
        setPets(Array.isArray(petsData) ? petsData : []);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.petId) {
      alert('Molimo izaberite ljubimca');
      return;
    }
    
    if (!formData.appointmentDate) {
      alert('Molimo unesite datum termina');
      return;
    }
    
    if (!formData.appointmentTime) {
      alert('Molimo unesite vreme termina');
      return;
    }
    
    if (!formData.reason.trim()) {
      alert('Molimo unesite razlog posete');
      return;
    }

    // For now, just show success message
    alert('Zahtev za termin je uspešno poslat! Kontaktiraćemo vas za potvrdu.');
    navigate('/user');
  };

  const handleLogout = () => {
    if (window.confirm('Da li ste sigurni da se želite odjaviti?')) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  const handlePriceList = () => {
    navigate('/price-list');
  };

  const handleAddPet = () => {
    navigate('/add-pet');
  };

  const handleBackToDashboard = () => {
    navigate('/user');
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="schedule-appointment-page">
      {/* Header */}
      <div className="schedule-header">
        <div className="brand-section">
          <p className="pet-clinic-title">PetClinic</p>
          <p className="ambulanta-subtitle">Ambulanta za ljubimce</p>
        </div>
        
        <div className="action-buttons">
          <button className="action-btn secondary" onClick={handlePriceList}>
            Cenovnik
          </button>
          <button className="action-btn secondary" onClick={handleAddPet}>
            Dodaj ljubimca
          </button>
          <button className="action-btn tertiary" onClick={handleBackToDashboard}>
            Nazad na ljubimce
          </button>
        </div>

        <div className="user-section">
          <span className="user-name">{user?.firstName || 'Korisnik'}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="navigation-bar">
        <button className="nav-back-btn" onClick={handleBackToDashboard}>
          ← Nazad na dashboard
        </button>
        <h1 className="page-title">Zakaži termin</h1>
      </div>

      {/* Main Content */}
      <div className="schedule-content">
        <div className="appointment-form-container">
          <div className="form-header">
            <h2>Zakažite termin za pregled</h2>
            <p>Popunite formu da zakažete termin za vašeg ljubimca</p>
          </div>

          <form onSubmit={handleSubmit} className="appointment-form">
            {/* Pet Selection */}
            <div className="form-group">
              <label htmlFor="petId">Izaberite ljubimca *</label>
              <select
                id="petId"
                name="petId"
                value={formData.petId}
                onChange={handleInputChange}
                required
              >
                <option value="">Izaberite ljubimca...</option>
                {pets.map(pet => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} - {pet.animalType?.name || pet.animaltype?.name || 'N/A'}
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time */}
            <div className="form-row">
              <div className="form-group">
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

              <div className="form-group">
                <label htmlFor="appointmentTime">Vreme termina *</label>
                <select
                  id="appointmentTime"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Izaberite vreme...</option>
                  <option value="08:00">08:00</option>
                  <option value="08:30">08:30</option>
                  <option value="09:00">09:00</option>
                  <option value="09:30">09:30</option>
                  <option value="10:00">10:00</option>
                  <option value="10:30">10:30</option>
                  <option value="11:00">11:00</option>
                  <option value="11:30">11:30</option>
                  <option value="12:00">12:00</option>
                  <option value="14:00">14:00</option>
                  <option value="14:30">14:30</option>
                  <option value="15:00">15:00</option>
                  <option value="15:30">15:30</option>
                  <option value="16:00">16:00</option>
                  <option value="16:30">16:30</option>
                  <option value="17:00">17:00</option>
                </select>
              </div>
            </div>

            {/* Reason */}
            <div className="form-group">
              <label htmlFor="reason">Razlog posete *</label>
              <select
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                required
              >
                <option value="">Izaberite razlog...</option>
                <option value="Redovan pregled">Redovan pregled</option>
                <option value="Vakcinacija">Vakcinacija</option>
                <option value="Zdravstveni problem">Zdravstveni problem</option>
                <option value="Kastracija/sterilizacija">Kastracija/sterilizacija</option>
                <option value="Čipovanje">Čipovanje</option>
                <option value="Laboratorijske analize">Laboratorijske analize</option>
                <option value="Ultrazvuk">Ultrazvuk</option>
                <option value="Ostalo">Ostalo</option>
              </select>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label htmlFor="notes">Dodatne napomene</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="4"
                placeholder="Opišite dodatne simptome ili napomene..."
              />
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleBackToDashboard}
              >
                Otkaži
              </button>
              <button
                type="submit"
                className="btn-submit"
              >
                Zakaži termin
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="appointment-info">
          <h3>📅 Informacije o terminima</h3>
          <ul>
            <li>Termini se zakazuju unapred</li>
            <li>Radimo ponedeljak - petak: 08:00 - 17:00</li>
            <li>Subotom: 08:00 - 14:00</li>
            <li>Za hitne slučajeve pozovite: 011/123-456</li>
            <li>Molimo dovedite ljubimca 10 min ranije</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScheduleAppointmentPage;