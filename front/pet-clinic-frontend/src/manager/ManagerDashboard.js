import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Da li ste sigurni da se želite odjaviti?')) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  const handleLekoviClick = () => {
    navigate('/medicaments');
  };

  const handleZivotinjeClick = () => {
    navigate('/analytics');
  };

  const handleCeneClick = () => {
    navigate('/pricing');
  };

  const handleOsobljeClick = () => {
    navigate('/staff');
  };

  return (
    <div className="manager-dashboard">
      {/* Header */}
      <div className="manager-header">
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
      <div className="dashboard-content">
        <div className="dashboard-grid">
          
          {/* Lekovi Card */}
          <div className="dashboard-card" onClick={handleLekoviClick}>
            <div className="card-icon">
              <span className="icon">💊</span>
            </div>
            <h3 className="card-title">Lekovi</h3>
            <p className="card-description">Upravljanje terapijama i zdravljem</p>
          </div>

          {/* Životinje Card */}
          <div className="dashboard-card" onClick={handleZivotinjeClick}>
            <div className="card-icon">
              <span className="icon">🐾</span>
            </div>
            <h3 className="card-title">Životinje</h3>
            <p className="card-description">Vrste i rase ljubimaca</p>
          </div>

          {/* Cene Card */}
          <div className="dashboard-card" onClick={handleCeneClick}>
            <div className="card-icon">
              <span className="icon">💰</span>
            </div>
            <h3 className="card-title">Cene</h3>
            <p className="card-description">Cenovnici i promocije</p>
          </div>

          {/* Osoblje Card */}
          <div className="dashboard-card" onClick={handleOsobljeClick}>
            <div className="card-icon">
              <span className="icon">👥</span>
            </div>
            <h3 className="card-title">Osoblje</h3>
            <p className="card-description">Zakazivanja i prijem pacijenata</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;