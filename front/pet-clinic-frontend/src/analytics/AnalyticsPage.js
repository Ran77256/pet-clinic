import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AnalyticsPage.css';

const API_BASE = 'http://localhost:8080/api';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [diseaseStats, setDiseaseStats] = useState([]);
  const [therapyStats, setTherapyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [customDates, setCustomDates] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let summaryUrl = '';
      let detailsStartDate = '';
      let detailsEndDate = '';
      let countUrl = '';

      // Određujemo URL na osnovu izabranog perioda
      if (selectedPeriod === 'custom' && customDates.startDate && customDates.endDate) {
        summaryUrl = `${API_BASE}/analytics/summary?startDate=${customDates.startDate}&endDate=${customDates.endDate}`;
        countUrl = `${API_BASE}/analytics/count/reports?startDate=${customDates.startDate}&endDate=${customDates.endDate}`;
        detailsStartDate = customDates.startDate;
        detailsEndDate = customDates.endDate;
      } else if (selectedPeriod === 'all') {
        summaryUrl = `${API_BASE}/analytics/summary/all`;
        countUrl = `${API_BASE}/analytics/count/all`;
      } else if (selectedPeriod === 'last-month' || selectedPeriod === 'last-quarter') {
        summaryUrl = `${API_BASE}/analytics/summary/last-quarter`;
        countUrl = `${API_BASE}/analytics/count/last-month`;
        // Za predefined periode, koristimo poslednji mesec za detalje
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(endDate.getMonth() - 1);
        detailsStartDate = startDate.toISOString().split('T')[0];
        detailsEndDate = endDate.toISOString().split('T')[0];
      } else {
        return; // Ne učitavamo ako je custom ali nema datuma
      }

      // Učitavamo sažetak
      const summaryResponse = await fetch(summaryUrl, { headers });
      if (!summaryResponse.ok) {
        throw new Error('Greška pri učitavanju analitike');
      }
      const summaryData = await summaryResponse.json();
      
      // Učitavamo tačno brojanje izveštaja i životinja
      const countResponse = await fetch(countUrl, { headers });
      if (countResponse.ok) {
        const countData = await countResponse.json();
        // Kombinujemo podatke
        summaryData.totalReports = countData.totalReports;
        summaryData.totalPets = countData.uniquePets;
      }
      
      setAnalyticsData(summaryData);

      // Za "Svi podaci" koristimo podatke iz summary response-a
      if (selectedPeriod === 'all') {
        // Koristimo podatke iz summary odgovora
        setDiseaseStats(summaryData.topDiseases || []);
        setTherapyStats(summaryData.topTherapies || []);
      } else {
        // Za ostale periode učitavamo detaljne statistike
        const [diseasesRes, therapiesRes] = await Promise.all([
          fetch(`${API_BASE}/analytics/diseases?startDate=${detailsStartDate}&endDate=${detailsEndDate}`, { headers }),
          fetch(`${API_BASE}/analytics/therapies?startDate=${detailsStartDate}&endDate=${detailsEndDate}`, { headers })
        ]);

        if (diseasesRes.ok) {
          const diseases = await diseasesRes.json();
          setDiseaseStats(diseases.slice(0, 10)); // Top 10
        }

        if (therapiesRes.ok) {
          const therapies = await therapiesRes.json();
          setTherapyStats(therapies.slice(0, 10)); // Top 10
        }
      }

    } catch (error) {
      console.error('Greška pri učitavanju analitike:', error);
      setError('Greška pri učitavanju podataka. Molimo pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomDateSubmit = () => {
    if (customDates.startDate && customDates.endDate) {
      fetchAnalyticsData();
    }
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
      <div className="analytics-page">
        <div className="loading">Učitavanje analitike...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <div className="brand-section">
          <p className="pet-clinic-title">PetClinic</p>
          <p className="ambulanta-subtitle">Ambulanta za ljubimce</p>
        </div>
        
        <div className="user-section">
          <button className="logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      {/* Page Title */}
      <div className="page-title-section">
        <h1>Analitika i Izveštaji</h1>
        <p>Uvid u trendove i statistike veterinarske klinike</p>
      </div>

      {/* Period Selection */}
      <div className="period-selector">
        <div className="period-buttons">
          <button 
            className={selectedPeriod === 'all' ? 'active' : ''}
            onClick={() => setSelectedPeriod('all')}
          >
            Svi podaci
          </button>
          <button 
            className={selectedPeriod === 'custom' ? 'active' : ''}
            onClick={() => setSelectedPeriod('custom')}
          >
            Prilagođeni period
          </button>
        </div>

        {selectedPeriod === 'custom' && (
          <div className="custom-date-range">
            <input
              type="date"
              value={customDates.startDate}
              onChange={(e) => setCustomDates({...customDates, startDate: e.target.value})}
              placeholder="Početni datum"
            />
            <input
              type="date"
              value={customDates.endDate}
              onChange={(e) => setCustomDates({...customDates, endDate: e.target.value})}
              placeholder="Završni datum"
            />
            <button onClick={handleCustomDateSubmit}>Prikaži</button>
          </div>
        )}
      </div>

      {analyticsData && (
        <>
          {/* Summary Statistics */}
          <div className="summary-stats">
            <div className="stat-card">
              <h3>Ukupno izveštaja</h3>
              <div className="stat-number">{analyticsData.totalReports || 0}</div>
            </div>
            <div className="stat-card">
              <h3>Ukupno životinja</h3>
              <div className="stat-number">{analyticsData.totalPets || 0}</div>
            </div>
            <div className="stat-card">
              <h3>Period</h3>
              <div className="stat-period">
                {analyticsData.periodStart && analyticsData.periodEnd ? 
                  `${new Date(analyticsData.periodStart).toLocaleDateString('sr-RS')} - ${new Date(analyticsData.periodEnd).toLocaleDateString('sr-RS')}` 
                  : 'N/A'}
              </div>
            </div>
          </div>

          {/* Charts and Tables */}
          <div className="analytics-content">
            
            {/* Disease Statistics */}
            <div className="analytics-section">
              <h2>Najčešće bolesti po vrstama životinja</h2>
              {diseaseStats.length > 0 ? (
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Bolest</th>
                        <th>Vrsta životinje</th>
                        <th>Broj slučajeva</th>
                        <th>Procenat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diseaseStats.map((item, index) => (
                        <tr key={index}>
                          <td>{item.diseaseName || 'N/A'}</td>
                          <td>{item.animalTypeName || 'N/A'}</td>
                          <td>{item.count || 0}</td>
                          <td>{item.percentage ? `${item.percentage.toFixed(1)}%` : '0%'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-data">Nema podataka o bolestima za izabrani period</div>
              )}
            </div>

            {/* Therapy Statistics */}
            <div className="analytics-section">
              <h2>Najčešće primenjivane terapije i tretmani</h2>
              {therapyStats.length > 0 ? (
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Terapija</th>
                        <th>Vrsta životinje</th>
                        <th>Broj primena</th>
                        <th>Procenat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {therapyStats.map((item, index) => (
                        <tr key={index}>
                          <td>{item.therapyName || 'N/A'}</td>
                          <td>{item.animalTypeName || 'N/A'}</td>
                          <td>{item.count || 0}</td>
                          <td>{item.percentage ? `${item.percentage.toFixed(1)}%` : '0%'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-data">Nema podataka o terapijama za izabrani period</div>
              )}
            </div>

            {/* Animal Type Statistics */}
            {analyticsData.animalTypeStatistics && analyticsData.animalTypeStatistics.length > 0 && (
              <div className="analytics-section">
                <h2>Statistike po vrstama životinja</h2>
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Vrsta životinje</th>
                        <th>Broj izveštaja</th>
                        <th>Najčešća bolest</th>
                        <th>Najčešća terapija</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.animalTypeStatistics.map((item, index) => (
                        <tr key={index}>
                          <td>{item.animalTypeName || 'N/A'}</td>
                          <td>{item.reportCount || 0}</td>
                          <td>{item.mostCommonDisease || 'N/A'}</td>
                          <td>{item.mostCommonTherapy || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;