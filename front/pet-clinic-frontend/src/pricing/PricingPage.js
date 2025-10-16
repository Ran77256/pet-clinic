import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PricingPage.css';

const PricingPage = () => {
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
    <div className="pricing-page">
      {/* Header */}
      <div className="pricing-header">
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
      <div className="pricing-content">
        <div className="content-header">
          <button className="back-btn" onClick={handleBackToDashboard}>
            ← Nazad na Dashboard
          </button>
          <h1>Upravljanje Cenama</h1>
          <p>Cenovnici i promocije</p>
        </div>

        <div className="coming-soon">
          <div className="coming-soon-icon">💰</div>
          <h2>Stranica u pripremi</h2>
          <p>Ovde će biti moguće upravljanje cenovnicima i promocijama.</p>
          <p>Funkcionalnost će biti dodana uskoro.</p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;