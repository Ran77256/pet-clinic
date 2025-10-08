import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';

const API_BASE = 'http://localhost:8080/api';

function UserDashboard() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user info from localStorage or session
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchUserPets(parsedUser.id);
    } else {
      // If no user data, redirect to login
      navigate('/');
    }
  }, [navigate]);

  const fetchUserPets = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/pets/by-owner/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setPets(data);
      } else {
        console.error('Failed to fetch pets');
        setPets([]);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Da li ste sigurni da se želite odjaviti?')) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  const handleAddPet = () => {
    navigate('/add-pet');
  };

  const handlePriceList = () => {
    navigate('/price-list');
  };

  const handleScheduleAppointment = () => {
    navigate('/schedule-appointment');
  };

  const handlePetDetails = (petId) => {
    navigate(`/pet-details/${petId}`);
  };

  if (loading) {
    return (
      <div className="user-dashboard">
        <div className="loading">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="brand-section">
          <div className="brand-logo">
            <div className="logo-circle">
              <span className="logo-text">🐾</span>
            </div>
          </div>
          <div className="brand-info">
            <h1 className="brand-title">PetClinic</h1>
            <p className="brand-subtitle">Ambulanta za ljubimce</p>
          </div>
        </div>
        
        <div className="action-buttons">
          <button className="action-btn primary" onClick={handleScheduleAppointment}>
            Zakaži termin
          </button>
          <button className="action-btn secondary" onClick={handlePriceList}>
            Cenovnik
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
        <div className="pets-section">
          <h2 className="section-title">Tvoji ljubimci</h2>
          
          {pets.length === 0 ? (
            <div className="no-pets">
              <p>Nemaš registrovane ljubimce</p>
              <button className="add-first-pet-btn" onClick={handleAddPet}>
                Dodaj prvog ljubimca
              </button>
            </div>
          ) : (
            <div className="pets-grid">
              {pets.map((pet) => (
                <div key={pet.id} className="pet-card" onClick={() => handlePetDetails(pet.id)}>
                  <div className="pet-info">
                    <h3 className="pet-name">Ime: {pet.name}</h3>
                    <p className="pet-detail">Vrsta: {pet.animalType?.name || 'N/A'}</p>
                    <p className="pet-detail">Rasa: {pet.breed?.name || 'N/A'}</p>
                  </div>
                  <button className="pet-action-btn">
                    Profil
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;