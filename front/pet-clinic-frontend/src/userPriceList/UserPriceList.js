import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserPriceList.css';

const API_BASE = 'http://localhost:8080/api';

function UserPriceList() {
  const navigate = useNavigate();
  const [priceList, setPriceList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCurrentPriceList();
  }, []);

  const fetchCurrentPriceList = async () => {
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

      const response = await fetch(`${API_BASE}/price-lists/current`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Price list data received:', data);
        setPriceList(data);
      } else if (response.status === 404) {
        setError('Trenutno nema aktivnog cenovnika.');
      } else {
        setError('Greška pri učitavanju cenovnika.');
      }
    } catch (err) {
      console.error('Error fetching price list:', err);
      setError('Greška pri povezivanju sa serverom.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/user');
  };

  if (loading) {
    return (
      <div className="user-price-list">
        <div className="price-list-header">
          <button className="back-btn" onClick={handleBack}>
            ← Nazad
          </button>
          <h1>Cenovnik</h1>
        </div>
        <div className="loading">Učitavanje cenovnika...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-price-list">
        <div className="price-list-header">
          <button className="back-btn" onClick={handleBack}>
            ← Nazad
          </button>
          <h1>Cenovnik</h1>
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="user-price-list">
      <div className="price-list-header">
        <button className="back-btn" onClick={handleBack}>
          ← Nazad
        </button>
        <h1>Cenovnik</h1>
        {priceList && (
          <div className="price-list-info">
            <p className="price-list-date">
              Važeći od: {new Date(priceList.validFrom).toLocaleDateString('sr-RS')}
            </p>
            {priceList.validTo && (
              <p className="price-list-date">
                Važeći do: {new Date(priceList.validTo).toLocaleDateString('sr-RS')}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="price-list-content">
        {priceList && priceList.items && priceList.items.length > 0 ? (
          <div className="price-list-table-container">
            <table className="price-list-table">
              <thead>
                <tr>
                  <th>Usluga</th>
                  <th>Vrsta životinje</th>
                  <th>Cena (RSD)</th>
                </tr>
              </thead>
              <tbody>
                {priceList.items.map((item, index) => (
                  <tr key={index}>
                    <td className="service-name">{item.serviceName || 'N/A'}</td>
                    <td className="animal-type">{item.animalTypeName || 'Sve vrste'}</td>
                    <td className="price">{item.price ? `${item.price.toLocaleString()} RSD` : 'Na upit'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-items">
            <p>Cenovnik je prazan.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserPriceList;