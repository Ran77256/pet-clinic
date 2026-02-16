import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
  const navigate = useNavigate();

  // Stanja za prvi izveštaj (Veterinari)
  const [year, setYear] = useState(2024);
  const [reportData, setReportData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false); // NOVO: prati da li je pretraga izvršena
  
  // Stanja za drugi izveštaj (Zalihe/Lekovi)
  const [inventoryData, setInventoryData] = useState([]);
  
  const [loading, setLoading] = useState(false);

  // STARE FUNKCIJE NAVIGACIJE
  const handleLogout = () => {
    if (window.confirm('Da li ste sigurni da se želite odjaviti?')) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  const handleLekoviClick = () => navigate('/medicaments');
  const handleZivotinjeClick = () => navigate('/analytics');
  const handleCeneClick = () => navigate('/pricing');
  const handleOsobljeClick = () => navigate('/staff');

  // FUNKCIJA 1: Izveštaj veterinara
  const fetchPerformanceReport = async () => {
    setLoading(true);
    setHasSearched(false); // Resetujemo pre nego što stignu novi podaci
    try {
      const response = await fetch(`http://localhost:8080/api/analyticss/veterinarian-performance?year=${year}`);
      if (!response.ok) throw new Error("Greška na serveru");
      const data = await response.json();
      setReportData(data);
      setHasSearched(true); // Označavamo da je pretraga gotova
    } catch (error) {
      console.error("Greška:", error);
      alert("Nije moguće učitati izveštaj veterinara.");
    } finally {
      setLoading(false);
    }
  };

  // FUNKCIJA 2: Izveštaj o zalihama
  const fetchInventoryReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/analyticss/inventory-expiry-report`);
      if (!response.ok) throw new Error("Greška na serveru");
      const data = await response.json();
      setInventoryData(data);
    } catch (error) {
      console.error("Greška:", error);
      alert("Nije moguće učitati izveštaj o zalihama.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manager-dashboard">
      <div className="manager-header">
        <div className="brand-section">
          <div className="brand-text">
            <p className="pet-clinic-title">PetClinic</p>
            <p className="ambulanta-subtitle">Ambulanta za ljubimce</p>
          </div>
        </div>
        <div className="user-section">
          <button className="logout-btn" onClick={handleLogout}>Log out</button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="report-section">
          <div className="report-controls">
            <div className="input-group">
              <label>Godina:</label>
              <input 
                type="number" 
                className="year-input"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
            <button className="generate-btn" onClick={fetchPerformanceReport} disabled={loading}>
              📊 Izveštaj Veterinara
            </button>
            
            <button className="generate-btn inventory-btn" onClick={fetchInventoryReport} disabled={loading}>
              📦 Kritične Zalihe (Rok trajanja)
            </button>
          </div>

          {/* LOGIKA ZA PRIKAZ TABELE 1 ILI PORUKE O PRAZNIM PODACIMA */}
          {hasSearched && (
            <div className="report-results">
              {reportData.length > 0 ? (
                <>
                  <h3>Učinak veterinara za {year}. godinu</h3>
                  <table className="sql-table">
                    <thead>
                      <tr>
                        <th>Ime i prezime</th>
                        <th>Specijalizacija</th>
                        <th>Pregleda</th>
                        <th>Vrsta životinja</th>
                        <th>Hitni slučajevi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((row, index) => (
                        <tr key={index}>
                          <td>{row.veterinar_ime_prezime}</td>
                          <td>{row.specijalizacija}</td>
                          <td>{row.ukupno_pregleda}</td>
                          <td>{row.broj_razlicitih_vrsta}</td>
                          <td>{row.broj_hitnih_slucajeva}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <div className="no-data-message">
                  <p>⚠️ Nema podataka o performansama veterinara za <strong>{year}.</strong> godinu.</p>
                </div>
              )}
            </div>
          )}

          {/* TABELA 2: ZALIHE */}
          {inventoryData.length > 0 && (
            <div className="report-results" style={{marginTop: '30px'}}>
              <h3>Kritične zalihe (Ističe rok u narednih 30 dana)</h3>
              <table className="sql-table inventory-table">
                <thead>
                  <tr>
                    <th>Kategorija</th>
                    <th>Artikal</th>
                    <th>Količina</th>
                    <th>Email dobavljača</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.map((row, index) => (
                    <tr key={index}>
                      <td>{row.kategorija}</td>
                      <td>{row.artikal}</td>
                      <td>{row.kolicina}</td>
                      <td><a href={`mailto:${row.email_dobavljaca}`}>{row.email_dobavljaca}</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card" onClick={handleLekoviClick}>
            <div className="card-icon"><span className="icon">💊</span></div>
            <h3 className="card-title">Lekovi</h3>
            <p className="card-description">Upravljanje terapijama i zdravljem</p>
          </div>
          <div className="dashboard-card" onClick={handleZivotinjeClick}>
            <div className="card-icon"><span className="icon">🐾</span></div>
            <h3 className="card-title">Životinje</h3>
            <p className="card-description">Vrste i rase ljubimaca</p>
          </div>
          <div className="dashboard-card" onClick={handleCeneClick}>
            <div className="card-icon"><span className="icon">💰</span></div>
            <h3 className="card-title">Cene</h3>
            <p className="card-description">Cenovnici i promocije</p>
          </div>
          <div className="dashboard-card" onClick={handleOsobljeClick}>
            <div className="card-icon"><span className="icon">👥</span></div>
            <h3 className="card-title">Osoblje</h3>
            <p className="card-description">Zakazivanja i prijem pacijenata</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;