import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MedicamentsPage.css';

const MedicamentsPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Da li ste sigurni da se želite odjaviti?')) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  const handleBackToDashboard = () => {
    navigate('/manager-dashboard');
  };

  return (
    <div className="medicaments-page">
      {/* Header */}
      <div className="medicaments-header">
        <div className="brand-section">
          <div className="brand-text">
            <p className="pet-clinic-title">PetClinic</p>
            <p className="ambulanta-subtitle">Ambulanta za ljubimce</p>
          </div>
        </div>
        
        <div className="user-section">
          <button className="logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="medicaments-content">
        <div className="content-header">
          <button className="back-btn" onClick={handleBackToDashboard}>
            ← Nazad na Dashboard
          </button>
          <h1>Upravljanje Lekovima</h1>
          <p>Upravljanje terapijama i zdravljem</p>
        </div>

        <div className="coming-soon">
          <div className="coming-soon-icon">💊</div>
          <h2>Stranica u pripremi</h2>
          <p>Ovde će biti moguće upravljanje lekovima i terapijama.</p>
          <p>Funkcionalnost će biti dodana uskoro.</p>
        </div>
      </div>
    </div>
  );
};

export default MedicamentsPage;