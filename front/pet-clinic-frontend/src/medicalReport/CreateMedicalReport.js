import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CreateMedicalReport.css';

const API_BASE = 'http://localhost:8080/api';

const CreateMedicalReport = () => {
  const { petId, veterinarianId } = useParams();
  const navigate = useNavigate();
  
  const [pet, setPet] = useState(null);
  const [veterinarian, setVeterinarian] = useState(null);
  const [petReports, setPetReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState({
    ime: '',
    datum: new Date().toISOString().split('T')[0],
    dijagnoza: '',
    razlogPosete: '',
    terapija: '',
    napomena: ''
  });

  const [lekovi, setLekovi] = useState([]);
  const [hrana, setHrana] = useState([]);
  const [selectedMedicineIds, setSelectedMedicineIds] = useState([]);
  const [selectedFoodIds, setSelectedFoodIds] = useState([]);

  useEffect(() => {
    if (petId && veterinarianId) {
      fetchPetDetails();
      fetchVeterinarianDetails();
      fetchLekovi();
      fetchHrana();
      fetchPetReports();
    }
  }, [petId, veterinarianId]);

  const fetchPetDetails = async () => {
    try {
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
      } else {
        console.error('❌ Failed to fetch pet details:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching pet details:', error);
    }
  };

  const fetchVeterinarianDetails = async () => {
    try {
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
    } finally {
      setLoading(false);
    }
  };

  const fetchLekovi = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/items/lekovi`, { headers });

      if (response.ok) {
        const lekoviData = await response.json();
        console.log('✅ Lekovi received:', lekoviData);
        setLekovi(Array.isArray(lekoviData) ? lekoviData : []);
      } else {
        console.error('❌ Failed to fetch lekovi:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching lekovi:', error);
    }
  };

  const fetchHrana = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/items/hrana`, { headers });

      if (response.ok) {
        const hranaData = await response.json();
        console.log('✅ Hrana received:', hranaData);
        setHrana(Array.isArray(hranaData) ? hranaData : []);
      } else {
        console.error('❌ Failed to fetch hrana:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching hrana:', error);
    }
  };

  const fetchPetReports = async () => {
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
        console.log('✅ Pet reports received:', reportsData);
        setPetReports(Array.isArray(reportsData) ? reportsData : []);
      } else {
        console.error('❌ Failed to fetch pet reports:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching pet reports:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMedicineChange = (medicineId) => {
    setSelectedMedicineIds(prev => 
      prev.includes(medicineId) 
        ? prev.filter(id => id !== medicineId)
        : [...prev, medicineId]
    );
  };

  const handleFoodChange = (foodId) => {
    setSelectedFoodIds(prev => 
      prev.includes(foodId) 
        ? prev.filter(id => id !== foodId)
        : [...prev, foodId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.ime.trim() || !formData.dijagnoza.trim()) {
      alert('Molimo unesite ime izveštaja i dijagnozu.');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const reportRequest = {
        petId: parseInt(petId),
        veterinarianId: parseInt(veterinarianId),
        ime: formData.ime,
        datum: formData.datum,
        dijagnoza: formData.dijagnoza,
        razlogPosete: formData.razlogPosete,
        terapija: formData.terapija,
        napomena: formData.napomena,
        itemIds: [...selectedMedicineIds, ...selectedFoodIds]
      };

      const response = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(reportRequest)
      });

      if (response.ok) {
        const reportData = await response.json();
        console.log('✅ Medical report created:', reportData);
        alert(`Medicinski izveštaj za ${pet?.name} je uspešno kreiran!`);
        navigate(`/vet-pet-details/${veterinarianId}`);
      } else {
        console.error('❌ Failed to create medical report:', response.status);
        alert('Greška pri kreiranju izveštaja. Pokušajte ponovo.');
      }
    } catch (error) {
      console.error('❌ Error creating medical report:', error);
      alert('Greška pri kreiranju izveštaja. Pokušajte ponovo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/vet-pet-details/${veterinarianId}`);
  };

  if (loading) {
    return (
      <div className="create-report-loading">
        <div className="loading-spinner">Učitavanje podataka...</div>
      </div>
    );
  }

  return (
    <div className="create-medical-report">
      {/* Header */}
      <div className="create-report-header">
        <div className="brand-section">
          <p className="pet-clinic-title">PetClinic</p>
          <p className="ambulanta-subtitle">Ambulanta za ljubimce</p>
        </div>
        
        <div className="user-section">
          <span className="user-name">Dr. {veterinarian?.firstName || 'Veterinar'} {veterinarian?.lastName || ''}</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="navigation-bar">
        <button className="nav-back-btn" onClick={handleCancel}>
          ← Nazad na listu pacijenata
        </button>
        <h1 className="page-title">Kreiranje medicinskog izveštaja</h1>
      </div>

      {/* Main Content */}
      <div className="create-report-content">
        <div className="content-grid">
          {/* Pet Details Section */}
          <div className="pet-details-section">
            <h2 className="section-title">Podaci o pacijentu</h2>
            
            {pet && (
              <div className="pet-info-card">
                <div className="pet-main-info">
                  <h3 className="pet-name">{pet.name}</h3>
                  <span className="pet-type-badge">
                    {pet.animalTypeName || pet.animaltype?.name || 'N/A'}
                  </span>
                </div>
                
                <div className="pet-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Rasa:</span>
                    <span className="detail-value">{pet.breedName || pet.breed?.name || 'N/A'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Datum rođenja:</span>
                    <span className="detail-value">
                      {pet.birthDate ? new Date(pet.birthDate).toLocaleDateString('sr-RS') : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Mikročip:</span>
                    <span className="detail-value">{pet.microchipNumber || 'N/A'}</span>
                  </div>
                  
                  {pet.owner && (
                    <>
                      <div className="detail-item">
                        <span className="detail-label">Vlasnik:</span>
                        <span className="detail-value">
                          {pet.owner.firstName} {pet.owner.lastName}
                        </span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-label">Telefon:</span>
                        <span className="detail-value">{pet.owner.phoneNumber || 'N/A'}</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{pet.owner.email || 'N/A'}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Health Conditions */}
                {pet.healthConditions && pet.healthConditions.length > 0 && (
                  <div className="health-conditions-section">
                    <span className="health-label">Zdravstveno stanje:</span>
                    <div className="health-badges">
                      {pet.healthConditions.map((condition, index) => (
                        <span key={index} className="health-condition-badge">
                          {condition.name || condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Medications and Food */}
                {petReports.length > 0 && (
                  <div className="current-medications-section">
                    <span className="health-label">Trenutni lekovi i hrana:</span>
                    <div className="current-items">
                      {petReports
                        .filter(report => report.items && report.items.length > 0)
                        .slice(0, 1)
                        .map(report => (
                          <div key={report.id} className="recent-report-items">
                            {report.items
                              .filter(item => item.category?.name?.toLowerCase() === 'lekovi')
                              .map((medicine, index) => (
                                <span key={index} className="medication-badge">
                                  💊 {medicine.name}
                                </span>
                              ))}
                            {report.items
                              .filter(item => item.category?.name?.toLowerCase() === 'hrana')
                              .map((food, index) => (
                                <span key={index} className="food-badge">
                                  🥘 {food.name}
                                </span>
                              ))}
                          </div>
                        ))}
                      {petReports.every(report => !report.items || report.items.length === 0) && (
                        <p className="no-current-items">Nema trenutnih lekova ili hrane</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Report Form Section */}
          <div className="report-form-section">
            <h2 className="section-title">Medicinski izveštaj</h2>
            
            <form onSubmit={handleSubmit} className="report-form">
              <div className="form-group">
                <label htmlFor="ime" className="form-label">
                  Naziv izveštaja *
                </label>
                <input
                  type="text"
                  id="ime"
                  name="ime"
                  value={formData.ime}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="npr. Redovan pregled, Vakcinacija..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="datum" className="form-label">
                  Datum pregleda *
                </label>
                <input
                  type="date"
                  id="datum"
                  name="datum"
                  value={formData.datum}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="razlogPosete" className="form-label">
                  Razlog posete
                </label>
                <input
                  type="text"
                  id="razlogPosete"
                  name="razlogPosete"
                  value={formData.razlogPosete}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="npr. Redovan pregled, Simptomi bolesti..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="dijagnoza" className="form-label">
                  Dijagnoza *
                </label>
                <textarea
                  id="dijagnoza"
                  name="dijagnoza"
                  value={formData.dijagnoza}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Unesite dijagnozu..."
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="terapija" className="form-label">
                  Terapija/Tretman
                </label>
                <textarea
                  id="terapija"
                  name="terapija"
                  value={formData.terapija}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Unesite preporučeni tretman ili terapiju..."
                  rows="3"
                />
              </div>

              {/* Lekovi */}
              <div className="form-group">
                <label className="form-label">Lekovi</label>
                <div className="items-selection">
                  {lekovi.map(medicine => (
                    <div key={medicine.id} className="item-checkbox">
                      <input
                        type="checkbox"
                        id={`medicine-${medicine.id}`}
                        checked={selectedMedicineIds.includes(medicine.id)}
                        onChange={() => handleMedicineChange(medicine.id)}
                      />
                      <label htmlFor={`medicine-${medicine.id}`} className="item-label">
                        {medicine.name} {medicine.packaging && `(${medicine.packaging})`}
                      </label>
                    </div>
                  ))}
                  {lekovi.length === 0 && (
                    <p className="no-items">Nema dostupnih lekova</p>
                  )}
                </div>
              </div>

              {/* Hrana */}
              <div className="form-group">
                <label className="form-label">Hrana</label>
                <div className="items-selection">
                  {hrana.map(food => (
                    <div key={food.id} className="item-checkbox">
                      <input
                        type="checkbox"
                        id={`food-${food.id}`}
                        checked={selectedFoodIds.includes(food.id)}
                        onChange={() => handleFoodChange(food.id)}
                      />
                      <label htmlFor={`food-${food.id}`} className="item-label">
                        {food.name} {food.packaging && `(${food.packaging})`}
                      </label>
                    </div>
                  ))}
                  {hrana.length === 0 && (
                    <p className="no-items">Nema dostupne hrane</p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="napomena" className="form-label">
                  Dodatne napomene
                </label>
                <textarea
                  id="napomena"
                  name="napomena"
                  value={formData.napomena}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Dodatne napomene, preporuke za vlasnika..."
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-cancel"
                  disabled={submitting}
                >
                  Otkaži
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting ? 'Kreiranje...' : 'Kreiraj izveštaj'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMedicalReport;