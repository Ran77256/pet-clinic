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
    console.log('Raw user data from localStorage:', userData);
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('Parsed user data:', parsedUser);
        console.log('User ID:', parsedUser.id);
        console.log('User firstName:', parsedUser.firstName);
        console.log('User lastName:', parsedUser.lastName);
        
        setUser(parsedUser);
        if (parsedUser.id) {
          console.log('User has ID, fetching pets for user ID:', parsedUser.id);
          fetchUserPets(parsedUser.id);
        } else {
          console.log('User has no ID, showing empty pets list');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUser({ firstName: 'Klijent' });
        setLoading(false);
      }
    } else {
      console.log('No user data found in localStorage, showing empty pets list');
      setUser({ firstName: 'Klijent' });
      setLoading(false);
    }
  }, [navigate]);

  const fetchUserPets = async (userId) => {
    try {
      setLoading(true);
      console.log('Fetching pets for user ID:', userId);
      const response = await fetch(`${API_BASE}/pets/by-owner/${userId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Pets data received:', data);
        setPets(Array.isArray(data) ? data : []);
      } else if (response.status === 404) {
        console.log('No pets found for user (404)');
        setPets([]);
      } else {
        console.error('Error fetching pets:', response.status, response.statusText);
        setPets([]);
      }
    } catch (error) {
      console.error('Network error fetching pets:', error);
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
          <span className="user-name">
            {(() => {
              const displayName = user?.firstName || 'Klijent';
              console.log('Displaying user name:', displayName);
              console.log('Current user state:', user);
              return displayName;
            })()}
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        <div className="pets-section">
          <h2 className="section-title">Tvoji ljubimci</h2>
          
          {loading ? (
            <div className="loading">Učitavanje ljubimaca...</div>
          ) : pets.length === 0 ? (
            <div className="no-pets">
              <p>Nemate registrovane ljubimce</p>
              <p style={{fontSize: '14px', color: '#6B7280', marginTop: '10px'}}>
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