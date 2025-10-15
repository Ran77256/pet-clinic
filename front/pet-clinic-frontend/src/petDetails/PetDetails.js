import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PetDetails.css';

const API_BASE = 'http://localhost:8080/api';

const PetDetails = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [veterinarian, setVeterinarian] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Fetch pet details
    fetchPetDetails();
  }, [petId]);

  const fetchPetDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching pet details for ID:', petId);

      const token = localStorage.getItem('token');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/pets/${petId}`, { headers });

      if (response.ok) {
        const petData = await response.json();
        console.log('✅ Pet details received:', petData);
        setPet(petData);
        
        // Fetch veterinarian details if veterinarian ID is available
        if (petData.veterinarianId) {
          await fetchVeterinarian(petData.veterinarianId);
        }
        
        // Fetch medical reports for this pet
        await fetchPetReports();
      } else if (response.status === 404) {
        console.error('❌ Pet not found (404)');
        setPet(null); // Eksplicitno postavi na null da prikaže error state
      } else {
        console.error('❌ Failed to fetch pet details:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        alert(`Greška pri učitavanju podataka o ljubimcu: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching pet details:', error);
      alert('Greška pri povezivanju sa serverom');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/user');
  };

  const fetchVeterinarian = async (veterinarianId) => {
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
        setVeterinarian(null);
      }
    } catch (error) {
      console.error('❌ Error fetching veterinarian details:', error);
      setVeterinarian(null);
    }
  };

  const fetchPetReports = async () => {
    try {
      console.log('Fetching medical reports for pet ID:', petId);

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
        console.log('✅ Pet reports received:', reportsData);
        setReports(Array.isArray(reportsData) ? reportsData : []);
      } else {
        console.error('❌ Failed to fetch pet reports:', response.status);
        setReports([]);
      }
    } catch (error) {
      console.error('❌ Error fetching pet reports:', error);
      setReports([]);
    }
  };

  const handleGeneratePDF = async (reportId, reportName) => {
    try {
      console.log('Generating PDF for report:', reportId);
      
      const token = localStorage.getItem('token');
      const headers = {
        'Accept': 'application/pdf'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/reports/${reportId}/pdf`, { headers });

      if (response.ok) {
        // Create blob from response
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportName}_${new Date().toISOString().split('T')[0]}.pdf`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('✅ PDF downloaded successfully');
      } else {
        console.error('❌ Failed to generate PDF:', response.status);
        alert('Greška pri generisanju PDF-a. Pokušajte ponovo.');
      }
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      alert('Greška pri generisanju PDF-a. Pokušajte ponovo.');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Da li ste sigurni da se želite odjaviti?')) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  const handleScheduleAppointment = () => {
    navigate('/schedule-appointment');
  };

  const handlePriceList = () => {
    navigate('/price-list');
  };

  const handleAddPet = () => {
    navigate('/add-pet');
  };

  if (loading) {
    return (
      <div className="pet-details-loading">
        <div className="loading-spinner">Učitavanje podataka o ljubimcu...</div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="pet-details-error">
        <h2>Ljubimac nije pronađen</h2>
        <button onClick={handleBackToDashboard} className="btn-back">
          Nazad na dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="pet-details">
      {/* Header */}
      <div className="pet-details-header">
        <div className="brand-section">
          <p className="pet-clinic-title">PetClinic</p>
          <p className="ambulanta-subtitle">Ambulanta za ljubimce</p>
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
          <span className="user-name">{user?.firstName || 'Korisnik'}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="navigation-bar">
        <button className="nav-back-btn" onClick={handleBackToDashboard}>
          ← Nazad na ljubimce
        </button>
        <h1 className="page-title">Karton ljubimca</h1>
      </div>

      {/* Main Content */}
      <div className="pet-details-content">
        {/* Left Side - Pet Information */}
        <div className="pet-info-section">
          <h2 className="section-title">Ljubimac</h2>
          
          <div className="pet-basic-info">
            <h3 className="pet-name-title">{pet.name}</h3>
            
            <div className="info-table">
              <div className="info-row">
                <div className="info-label">Ime</div>
                <div className="info-value">{pet.name || 'N/A'}</div>
              </div>
              
              <div className="info-row">
                <div className="info-label">Vrsta</div>
                <div className="info-value">
                  {pet.animalTypeName || pet.animaltype?.name || pet.species?.name || 'N/A'}
                </div>
              </div>
              
              <div className="info-row">
                <div className="info-label">Rasa</div>
                <div className="info-value">{pet.breedName || 'N/A'}</div>
              </div>
              
              <div className="info-row">
                <div className="info-label">Datum rođenja</div>
                <div className="info-value">
                  {pet.birthDate ? new Date(pet.birthDate).toLocaleDateString('sr-RS') : 'N/A'}
                </div>
              </div>
              
              <div className="info-row">
                <div className="info-label">Veterinar</div>
                <div className="info-value">
                  {veterinarian ? 
                    `Dr ${veterinarian.firstName} ${veterinarian.lastName}` : 
                    'N/A'
                  }
                </div>
              </div>
              
              <div className="info-row">
                <div className="info-label">Broj mikročipa</div>
                <div className="info-value">{pet.microchipNumber || 'N/A'}</div>
              </div>
            </div>

            {pet.description && (
              <div className="pet-description">
                <h4>Opis</h4>
                <p>{pet.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Medical Reports */}
        <div className="reports-section">
          <h2 className="section-title">Izveštaji doktora</h2>
          
          {reports.length > 0 ? (
            <div className="reports-list">
              {reports.map((report) => (
                <div key={report.id} className="report-item">
                  <div className="report-info">
                    <div className="report-date">
                      {report.datum ? new Date(report.datum).toLocaleDateString('sr-RS') : 'N/A'} — dr {report.veterinarian?.firstName || ''} {report.veterinarian?.lastName || 'N/A'}
                    </div>
                    <div className="report-title">
                      {report.ime || 'Bez naziva'}
                    </div>
                    {report.dijagnoza && (
                      <div className="report-diagnosis">
                        {report.dijagnoza}
                      </div>
                    )}
                  </div>
                  <button 
                    className="pdf-btn"
                    onClick={() => handleGeneratePDF(report.id, report.ime || 'Izvestaj')}
                    title="Preuzmi PDF"
                  >
                    PDF
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="reports-placeholder">
              <p className="placeholder-text">
                Nema dostupnih izveštaja za ovog ljubimca.
              </p>
              <div className="placeholder-icon">📋</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetDetails;