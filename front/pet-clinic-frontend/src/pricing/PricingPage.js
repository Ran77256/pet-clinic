import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PricingPage.css';

const API_BASE = 'http://localhost:8080/api';

const PricingPage = () => {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Accept': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/promotions/all`, { headers });
      if (!res.ok) throw new Error('Promotions fetch failed');
      // read raw text first so we can log invalid JSON if server returned malformed response
      const resText = await res.text();
      let data;
      try {
        data = JSON.parse(resText);
      } catch (parseErr) {
        console.error('Invalid JSON received from /promotions/all:', resText);
        throw new Error('Invalid JSON from promotions endpoint');
      }

      // For each promotion fetch summary (uses, savings, clients, services)
      const promosWithStats = await Promise.all(
        data.map(async (p) => {
          try {
            const summaryRes = await fetch(`${API_BASE}/service-usage/promotion/${p.id}/summary`, { headers });
            if (!summaryRes.ok) return { ...p, uses: 0, totalSavings: 0, clients: [], serviceCounts: {} };
            const summary = await summaryRes.json();

            return {
              ...p,
              uses: summary.totalUses || 0,
              totalSavings: summary.totalSavings || 0,
              clients: summary.clients || [],
              serviceCounts: summary.serviceCounts || {}
            };
          } catch (err) {
            console.error('Error fetching summary for promo', p.id, err);
            return { ...p, uses: 0, totalSavings: 0, clients: [], serviceCounts: {} };
          }
        })
      );

      setPromotions(promosWithStats);
    } catch (err) {
      console.error(err);
      setError('Neuspešno dohvatanje promocija. Prikazujem privremene podatke.');
      // fallback to empty
      setPromotions([]);
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

  const handleBackToDashboard = () => navigate('/manager-dashboard');

  const openClientsModal = (promo) => setSelectedPromotion(promo);
  const closeModal = () => setSelectedPromotion(null);

  return (
    <div className="pricing-page">
      <div className="pricing-header">
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

      <div className="pricing-content">
        <div className="content-header">
          <button className="back-btn" onClick={handleBackToDashboard}>← Nazad na Dashboard</button>
          <h1>Izveštaj o promocijama</h1>
          <p>Pratite efekat promocija: broj iskorišćenja, ostvarenu uštedu i listu klijenata.</p>
        </div>

        {loading ? (
          <p>Učitavanje promocija...</p>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="promotions-section">
            <div className="promotions-table-wrapper">
              <table className="promotions-table">
                <thead>
                  <tr>
                    <th>Naziv promocije</th>
                    <th>Period</th>
                    <th>Ukupan broj iskorišćenja</th>
                    <th>Klijenti</th>
                    <th>Po uslugama</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{new Date(p.startDate).toLocaleDateString('sr-RS')}{p.endDate ? ` - ${new Date(p.endDate).toLocaleDateString('sr-RS')}` : ''}</td>
                      <td>{p.uses ?? 0}</td>
                      <td>
                        <button className="view-clients-btn" onClick={() => openClientsModal(p)}>
                          Prikaži ({(p.clients || []).length})
                        </button>
                      </td>
                      <td>
                        {p.serviceCounts && Object.keys(p.serviceCounts).length > 0 ? (
                          <div className="service-counts">
                            {Object.entries(p.serviceCounts).map(([name, cnt]) => (
                              <div key={name} className="service-count-item">{name}: {cnt}</div>
                            ))}
                          </div>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedPromotion && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Klijenti koji su iskoristili: {selectedPromotion.name}</h3>
              <p><strong>Period:</strong> {new Date(selectedPromotion.startDate).toLocaleDateString('sr-RS')} {selectedPromotion.endDate ? ` - ${new Date(selectedPromotion.endDate).toLocaleDateString('sr-RS')}` : ''}</p>
              <ul className="clients-list">
                {(selectedPromotion.clients || []).length === 0 ? <li>Nema podataka</li> : selectedPromotion.clients.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
              <div className="modal-actions">
                <button onClick={closeModal} className="close-modal-btn">Zatvori</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PricingPage;