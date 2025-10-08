import React, { useEffect, useState } from 'react';
import './PriceAdminPage.css';

const API_BASE = 'http://localhost:8080/api'; // Adjust if needed

function PriceAdminPage() {
  const [priceList, setPriceList] = useState([]);
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/pricelists/all`)
      .then(res => res.json())
      .then(setPriceList);
    fetch(`${API_BASE}/promotions/all`)
      .then(res => res.json())
      .then(setPromotions);
  }, []);

  return (
    <div className="price-admin-container">
      <header className="price-admin-header">
        <div className="logo-title">
          <div className="logo" />
          <div>
            <h2>PetClinic</h2>
            <span>Ambulanta za ljubimce</span>
          </div>
        </div>
        <div className="admin-actions">
          <span>Administrator</span>
          <button className="logout-btn">Log out</button>
        </div>
      </header>
      <main className="price-admin-main">
        <h1>Cenovnik usluga</h1>
        <button className="add-btn">Dodaj uslugu</button>
        <section className="price-list-section">
          <h3>Aktivna verzija cenovnika</h3>
          <table className="price-list-table">
            <thead>
              <tr>
                <th>Usluga</th>
                <th>Životinja</th>
                <th>Klijent</th>
                <th>Cena (RSD)</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {priceList.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.animalType}</td>
                  <td>{item.clientType}</td>
                  <td>{item.price}</td>
                  <td>
                    <button className="edit-btn">Izmeni</button>
                    <button className="delete-btn">Obriši</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <button className="add-btn">Dodaj promociju</button>
        <section className="promotion-section">
          <h3>Promocije</h3>
          <table className="promotion-table">
            <thead>
              <tr>
                <th>Naziv</th>
                <th>Tip popusta</th>
                <th>Period</th>
                <th>Status</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map(promo => (
                <tr key={promo.id}>
                  <td>{promo.name}</td>
                  <td>{promo.discountType}</td>
                  <td>{promo.period}</td>
                  <td>{promo.active ? 'Aktivna' : 'Neaktivna'}</td>
                  <td>
                    <button className="edit-btn">Izmeni</button>
                    {promo.active ? (
                      <button className="deactivate-btn">Deaktiviraj</button>
                    ) : (
                      <button className="activate-btn">Aktiviraj</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        {/* Sidebar for history can be added here later */}
      </main>
    </div>
  );
}

export default PriceAdminPage;
