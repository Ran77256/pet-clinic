import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './VetPetDetails.css';

const API_BASE = 'http://localhost:8080/api';

const VetPetDetails = () => {
  const { veterinarianId } = useParams(); // Changed from petId to veterinarianId
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [veterinarian, setVeterinarian] = useState(null);
  const [petReports, setPetReports] = useState({});

  useEffect(() => {
    // Fetch veterinarian details from API using veterinarianId from URL
    if (veterinarianId) {
      fetchVeterinarianDetails();
      fetchVeterinarianPets();
    }
  }, [veterinarianId]);

  const fetchVeterinarianDetails = async () => {
    try {
      console.log('Fetching veterinarian details for ID:', veterinarianId);

      const token = localStorage.getItem('token');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/veterinarians/${veterinarianId}`, { headers });

      if (response.ok) {
        const veterinarianData = await response.json();
        console.log('✅ Veterinarian details received:', veterinarianData);
        setVeterinarian(veterinarianData);
      } else {
        console.error('❌ Failed to fetch veterinarian details:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching veterinarian details:', error);
    }
  };

  const fetchVeterinarianPets = async () => {
    try {
      setLoading(true);
      console.log('Fetching pets for veterinarian ID:', veterinarianId);

      const token = localStorage.getItem('token');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Assuming there's an endpoint to get pets by veterinarian ID
      const response = await fetch(`${API_BASE}/pets/by-veterinarian/${veterinarianId}`, { headers });

      if (response.ok) {
        const petsData = await response.json();
        console.log('✅ Veterinarian pets received:', petsData);
        const pets = Array.isArray(petsData) ? petsData : [];
        setPets(pets);
        
        // Fetch reports for each pet
        pets.forEach(pet => fetchPetReports(pet.id));
      } else {
        console.error('❌ Failed to fetch veterinarian pets:', response.status);
        setPets([]);
      }
    } catch (error) {
      console.error('❌ Error fetching veterinarian pets:', error);
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPetReports = async (petId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/reports/by-pet/${petId}`, { headers });

      if (response.ok) {
        const reportsData = await response.json();
        setPetReports(prev => ({
          ...prev,
          [petId]: Array.isArray(reportsData) ? reportsData : []
        }));
      } else {
        console.error(`❌ Failed to fetch reports for pet ${petId}:`, response.status);
      }
    } catch (error) {
      console.error(`❌ Error fetching reports for pet ${petId}:`, error);
    }
  };

  const handleAddReport = (petId, petName) => {
    console.log(`Navigating to create report for pet: ${petName} (ID: ${petId})`);
    navigate(`/create-medical-report/${petId}/${veterinarianId}`);
  };

  const handleLogout = () => {
    if (window.confirm('Da li ste sigurni da se želite odjaviti?')) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="vet-pet-details-loading">
        <div className="loading-spinner">Učitavanje podataka o pacijentima...</div>
      </div>
    );
  }

  return (
    <div className="vet-pet-details">
      {/* Header */}
      <div className="vet-pet-details-header">
        <div className="brand-section">
          <p className="pet-clinic-title">PetClinic</p>
          <p className="ambulanta-subtitle">Ambulanta za ljubimce</p>
        </div>

        <div className="user-section">
          <span className="user-name">Dr. {veterinarian?.firstName || 'Veterinar'} {veterinarian?.lastName || ''}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="navigation-bar">
        <h1 className="page-title">Moji pacijenti</h1>
      </div>

      {/* Main Content */}
      <div className="vet-pets-list-content">
        <div className="pets-section">
          <h2 className="section-title">Lista pacijenata</h2>
          
          {pets.length > 0 ? (
            <div className="pets-grid">
              {pets.map(pet => (
                <div key={pet.id} className="pet-card">
                  <div className="pet-card-header">
                    <h3 className="pet-card-name">{pet.name}</h3>
                    <span className="pet-card-type">
                      {pet.animalTypeName || pet.animaltype?.name || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="pet-card-info">
                    <div className="pet-info-item">
                      <span className="info-label">Rasa:</span>
                      <span className="info-value">{pet.breedName || 'N/A'}</span>
                    </div>
                    
                    <div className="pet-info-item">
                      <span className="info-label">Godina rođenja:</span>
                      <span className="info-value">
                        {pet.birthDate ? new Date(pet.birthDate).getFullYear() : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="pet-info-item">
                      <span className="info-label">Mikročip:</span>
                      <span className="info-value">{pet.microchipNumber || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Health Conditions */}
                  {pet.healthConditions && pet.healthConditions.length > 0 && (
                    <div className="pet-health-conditions">
                      <span className="health-label">Zdravstveno stanje:</span>
                      <div className="health-badges">
                        {pet.healthConditions.slice(0, 2).map((condition, index) => (
                          <span key={index} className="health-condition-badge-small">
                            {condition.name || condition}
                          </span>
                        ))}
                        {pet.healthConditions.length > 2 && (
                          <span className="health-more">+{pet.healthConditions.length - 2}</span>
                        )}
                      </div>
                    </div>
                  )}


                  
                  <div className="pet-card-actions">
                    <button 
                      className="add-report-btn"
                      onClick={() => handleAddReport(pet.id, pet.name)}
                    >
                      📋 Dodaj izveštaj
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-pets-placeholder">
              <div className="placeholder-icon">🐾</div>
              <p className="placeholder-text">
                Nemate dodeljene pacijente ili se podaci učitavaju...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VetPetDetails;