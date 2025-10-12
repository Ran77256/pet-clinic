import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PriceListPage.css';

const PriceListPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [services, setServices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

    // Fetch price list and services from backend
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch both price list and services in parallel
      const [priceResponse, servicesResponse] = await Promise.all([
        fetch('http://localhost:8080/api/pricelists/all', { headers }),
        fetch('http://localhost:8080/api/services/all', { headers }).catch(() => null) // Optional services endpoint
      ]);

      if (priceResponse.ok) {
        const priceData = await priceResponse.json();
        setPriceList(Array.isArray(priceData) ? priceData : []);
      } else {
        setError('Failed to fetch price list');
        return;
      }

      // If services endpoint exists, create service mapping
      if (servicesResponse && servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        const serviceMap = {};
        if (Array.isArray(servicesData)) {
          servicesData.forEach(service => {
            serviceMap[service.id] = service.name || service.serviceName || `Service ${service.id}`;
          });
        }
        setServices(serviceMap);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error loading price list');
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceList = fetchData; // For retry button

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

  const handleAddPet = () => {
    navigate('/add-pet');
  };

  const handleBackToDashboard = () => {
    navigate('/user');
  };

  return (
    <div className="price-list-page">
      {/* Header */}
      <div className="price-list-header">
        <div className="brand-section">
          <p className="pet-clinic-title">PetClinic</p>
          <p className="ambulanta-subtitle">Ambulanta za ljubimce</p>
        </div>
        
        <div className="action-buttons">
          <button className="action-btn primary" onClick={handleScheduleAppointment}>
            Zakaži termin
          </button>
          <button className="action-btn secondary" onClick={() => navigate('/price-list')}>
            Cenovnik
          </button>
          <button className="action-btn secondary" onClick={handleAddPet}>
            Dodaj ljubimca
          </button>
        </div>

        <div className="user-section">
          <span className="user-name">{user?.firstName || 'Ime'}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="price-list-content">
        <h2 className="page-title">Cenovnik usluga</h2>
        
        {loading ? (
          <div className="loading-message">
            <p>Učitavanje cenovnika...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>Greška pri učitavanju cenovnika: {error}</p>
            <button onClick={fetchPriceList} className="retry-btn">Pokušaj ponovo</button>
          </div>
        ) : (
          <div className="price-table">
            {priceList.length > 0 ? (
              priceList
                .filter(item => {
                  // Show only active prices (current date is between startDate and endDate)
                  const now = new Date();
                  const startDate = new Date(item.startDate);
                  const endDate = item.endDate ? new Date(item.endDate) : null;
                  
                  return now >= startDate && (endDate === null || now <= endDate);
                })
                .map((item) => (
                  <div key={item.id} className="price-item">
                    <div className="service-info">
                      <h3 className="service-name">
                        {services[item.serviceId] || `Usluga ${item.serviceId}`}
                      </h3>
                      <p className="service-price">
                        {item.price ? `${item.price.toLocaleString('sr-RS')} RSD` : 'Cena na upit'}
                      </p>
                      {item.endDate && (
                        <span className="service-validity">
                          (važi do {new Date(item.endDate).toLocaleDateString('sr-RS')})
                        </span>
                      )}
                    </div>
                  </div>
                ))
            ) : (
              <div className="no-data-message">
                <p>Trenutno nema dostupnih cena u sistemu.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceListPage;