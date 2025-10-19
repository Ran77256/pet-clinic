import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PriceAdminPage.css';


const API_BASE = 'http://localhost:8080/api';

// Component for individual price list item row with inline editing
const PriceListItemRow = ({ item, onUpdatePrice, onDelete, services }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editPrice, setEditPrice] = useState(item.originalPrice || item.price || '');

  // Find the service details to get animal type
  const serviceDetails = services.find(s => s.id === item.serviceId);

  const handleSavePrice = () => {
    if (editPrice !== item.originalPrice) {
      onUpdatePrice(item.id, editPrice);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditPrice(item.price || '');
    setIsEditing(false);
  };

  return (
    <tr>
      <td>{item.serviceName || 'N/A'}</td>
      <td>{(serviceDetails && serviceDetails.animalType) ? serviceDetails.animalType.name : 'N/A'}</td>
      <td>{(serviceDetails && serviceDetails.clientType) ? serviceDetails.clientType : 'N/A'}</td>
      <td>
        {isEditing ? (
          <div className="price-edit-container">
            <input
              type="number"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              className="price-input"
            />
            <span> RSD</span>
          </div>
        ) : (
          <>
            {item.promotionalPrice ? (
              <div>
                <span style={{ textDecoration: 'line-through', color: '#666' }}>{item.price} RSD</span>
                <br/>
                <span style={{ color: '#10B981', fontWeight: 'bold' }}>{item.promotionalPrice} RSD</span>
              </div>
            ) : (
              `${item.price || ''} RSD`
            )}
          </>
        )}
      </td>
      <td>
        {isEditing ? (
          <div className="edit-actions">
            <button className="save-btn" onClick={handleSavePrice}>
              Sačuvaj
            </button>
            <button className="cancel-btn" onClick={handleCancelEdit}>
              Otkaži
            </button>
          </div>
        ) : (
          <div className="item-actions">
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              Izmeni
            </button>
            <button className="delete-btn" onClick={() => onDelete(item.id)}>
              Obriši
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

function PriceAdminPage() {
  const navigate = useNavigate();
  const [currentPriceList, setCurrentPriceList] = useState(null);
  const [priceListHistory, setPriceListHistory] = useState([]);
  const [services, setServices] = useState([]);
  const [animalTypes, setAnimalTypes] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [selectedPriceList, setSelectedPriceList] = useState(null);
  const [showPriceListPreview, setShowPriceListPreview] = useState(false);
  const [newItem, setNewItem] = useState({
    serviceId: '',
    price: ''
  });
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    clientType: 'INDIVIDUAL',
    animalTypeId: ''
  });
  // Promotion state
  const [promotions, setPromotions] = useState([]);
  // Refs for scrolling
  const addButtonRef = React.useRef(null);
  const promotionsListRef = React.useRef(null);
  // Scroll to Dodaj button and promotions list
  const scrollToPromotions = () => {
    if (addButtonRef.current) {
      addButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (promotionsListRef.current) {
      promotionsListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    fetchCurrentPriceList();
    fetchPriceListHistory();
    fetchServices();
    fetchAnimalTypes();
    fetchPromotions();
  }, []);

  // Promotion API
  const fetchPromotions = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/promotions/all');
      if (response.ok) {
        const data = await response.json();
        setPromotions(data);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
    }
  };

  const handleActivatePromotion = async (id) => {
    try {
      if (!window.confirm('Da li ste sigurni da želite da aktivirate ovu promociju?')) {
        return;
      }

      // Prvo aktiviramo promociju
      const activateResponse = await fetch(`http://localhost:8080/api/promotions/${id}/activate`, {
        method: 'POST'
      });
      
      if (activateResponse.ok) {
        // Zatim primenjujemo promociju na sve cenovnike
        const applyResponse = await fetch(`http://localhost:8080/api/promotions/${id}/apply`, {
          method: 'POST'
        });
        
        if (applyResponse.ok) {
          await fetchPromotions(); // Prvo osvežimo listu promocija
          await fetchCurrentPriceList(); // Zatim osvežimo cenovnik da vidimo nove cene
          alert('Promocija je uspešno aktivirana i primenjena na sve cenovnike');
        } else {
          const errorData = await applyResponse.json().catch(() => null);
          alert(errorData?.message || 'Greška pri primeni promocije na cenovnike');
        }
      } else {
        const errorData = await activateResponse.json().catch(() => null);
        alert(errorData?.message || 'Greška pri aktiviranju promocije');
      }
    } catch (error) {
      console.error('Error activating promotion:', error);
      alert('Greška pri aktiviranju promocije');
    }
  };

  const handleDeactivatePromotion = async (id) => {
    try {
      if (!window.confirm('Da li ste sigurni da želite da deaktivirate ovu promociju?')) {
        return;
      }

      const response = await fetch(`http://localhost:8080/api/promotions/${id}/deactivate`, {
        method: 'POST'
      });
      
      if (response.ok) {
        await fetchPromotions(); // Prvo osvežimo listu promocija
        await fetchCurrentPriceList(); // Zatim osvežimo cenovnik da vidimo nove/originalne cene
        alert('Promocija je uspešno deaktivirana');
      } else {
        const errorData = await response.json().catch(() => null);
        alert(errorData?.message || 'Greška pri deaktiviranju promocije');
      }
    } catch (error) {
      console.error('Error deactivating promotion:', error);
      alert('Greška pri deaktiviranju promocije');
    }
  };

  const handleEditPromotion = (id) => {
    navigate(`/edit-promotion/${id}`);
  };

  const handleAddPromotion = () => {
    navigate('/add-promotion');
  };

  const fetchCurrentPriceList = async () => {
    try {
      // Fetch current draft price list
      const response = await fetch(`${API_BASE}/price-lists/current`);
      if (response.ok) {
        const priceList = await response.json();
        setCurrentPriceList(priceList);
        
        // Fetch items for this price list
        if (priceList.id) {
          const itemsResponse = await fetch(`${API_BASE}/price-list-items/by-pricelist/${priceList.id}`);
          if (itemsResponse.ok) {
            const items = await itemsResponse.json();
            console.log('Price list items:', items); // Debug log
            setCurrentPriceList(prev => ({ ...prev, items }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching current price list:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_BASE}/services/all`);
      if (response.ok) {
        const data = await response.json();
        console.log('Services data:', data); // Debug log
        setServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchAnimalTypes = async () => {
    try {
      const response = await fetch(`${API_BASE}/animal-types/alldto`);
      if (response.ok) {
        const data = await response.json();
        console.log('Animal types data:', data); // Debug log
        setAnimalTypes(data);
      }
    } catch (error) {
      console.error('Error fetching animal types:', error);
    }
  };

  const fetchPriceListHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/price-lists/drafts`);
      if (response.ok) {
        const data = await response.json();
        console.log('Price list history:', data); // Debug log
        setPriceListHistory(data);
      }
    } catch (error) {
      console.error('Error fetching price list history:', error);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      if (!currentPriceList?.id) {
        alert('Nema aktivnog cenovnika');
        return;
      }

      // Use the new API endpoint
      const response = await fetch(`${API_BASE}/price-list-items/add?priceListId=${currentPriceList.id}&serviceId=${newItem.serviceId}&price=${newItem.price}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        await fetchCurrentPriceList();
        setNewItem({ serviceId: '', price: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Greška pri dodavanju stavke');
    }
  };

  const handleUpdatePrice = async (itemId, newPrice) => {
    try {
      const response = await fetch(`${API_BASE}/price-list-items/${itemId}/update-price?price=${newPrice}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        // Osvežavanje prikaza svih cenovnika
        await fetchCurrentPriceList();
      }
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Greška pri ažuriranju cene');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Da li ste sigurni da želite da obrišete ovu stavku?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/price-list-items/${itemId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchCurrentPriceList();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Greška pri brisanju stavke');
    }
  };

  const [showSaveVersionModal, setShowSaveVersionModal] = useState(false);
  const [versionDates, setVersionDates] = useState({
    startDate: '',
    endDate: ''
  });

  const handleSaveVersion = async () => {
    setShowSaveVersionModal(true);
  };

  const handleConfirmSaveVersion = async () => {
    try {
      // Create draft from active and then publish it
      const draftResponse = await fetch(`${API_BASE}/price-lists/draft-from-active`, {
        method: 'POST',
      });
      
      if (draftResponse.ok) {
        const draft = await draftResponse.json();
        
        // Format the date for display
        const formattedStartDate = new Date(versionDates.startDate).toLocaleDateString();
        const formattedEndDate = versionDates.endDate ? new Date(versionDates.endDate).toLocaleDateString() : null;
        
        // Publish the draft with scheduling information
        const publishResponse = await fetch(`${API_BASE}/price-lists/${draft.id}/publish`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            effectiveFrom: versionDates.startDate,
            effectiveTo: versionDates.endDate || null
          }),
        });
        
        if (publishResponse.ok) {
          await fetchCurrentPriceList();
          await fetchPriceListHistory();
          setShowSaveVersionModal(false);
          
          // Show detailed success message
          const message = formattedEndDate 
            ? `Verzija cenovnika je uspešno sačuvana!\nPočetak važenja: ${formattedStartDate}\nKraj važenja: ${formattedEndDate}`
            : `Verzija cenovnika je uspešno sačuvana!\nPočetak važenja: ${formattedStartDate}`;
          
          alert(message);
        }
      }
    } catch (error) {
      console.error('Error saving version:', error);
      alert('Greška pri čuvanju verzije!');
    }
  };

  const handleActivateVersion = async (versionId) => {
    if (!window.confirm('Da li ste sigurni da želite da aktivirate ovu verziju cenovnika?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/price-lists/activate/${versionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        await fetchCurrentPriceList();
        await fetchPriceListHistory();
        alert('Verzija je uspešno aktivirana!');
      } else {
        alert('Greška pri aktiviranju verzije');
      }
    } catch (error) {
      console.error('Error activating version:', error);
      alert('Greška pri aktiviranju verzije');
    }
  };

  const handlePreviewPriceList = async (priceListId) => {
    try {
      const response = await fetch(`${API_BASE}/price-lists/${priceListId}`);
      if (response.ok) {
        const priceList = await response.json();
        
        // Fetch items for this price list
        if (priceList.id) {
          const itemsResponse = await fetch(`${API_BASE}/price-list-items/by-pricelist/${priceList.id}`);
          if (itemsResponse.ok) {
            const items = await itemsResponse.json();
            setSelectedPriceList({ ...priceList, items });
            setShowPriceListPreview(true);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching price list preview:', error);
      alert('Greška pri učitavanju cenovnika');
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const serviceData = {
        name: newService.name,
        description: newService.description,
        clientType: newService.clientType,
        animalType: {
          id: parseInt(newService.animalTypeId)
        }
      };

      const response = await fetch(`${API_BASE}/services/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });
      
      if (response.ok) {
        const createdService = await response.json();
        await fetchServices(); // Refresh services list
        setNewService({ name: '', description: '', clientType: 'INDIVIDUAL', animalTypeId: '' });
        setShowAddServiceModal(false);
        
        // Automatically set the new service in the add item form
        setNewItem(prev => ({ ...prev, serviceId: createdService.id }));
        setShowAddForm(true);
        
        alert('Usluga je uspešno dodana!');
      }
    } catch (error) {
      console.error('Error adding service:', error);
      alert('Greška pri dodavanju usluge');
    }
  };

  // Logout funkcija
  const handleLogout = () => {
    const confirm = window.confirm('Da li ste sigurni da se želite odjaviti?');
    if (confirm) {
      // Obriši bilo koje stored podatke (ako ih ima)
      localStorage.removeItem('userToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.clear();
      
      // Vrati na login stranicu
      navigate('/');
    }
  };



  return (
    <div className="price-admin-container" style={{ height: '100vh', overflowY: 'auto' }}>
      <div className="price-admin-header">
        <div className="logo-title">
          <h2>PetClinic</h2>
          <span>Ambulanta za ljubimce</span>
        </div>
      </div>
      <div className="admin-actions">
        <span>Administrator</span>
        <button className="logout-btn" onClick={handleLogout}>Log out</button>
      </div>
      
  <main className="price-admin-main" style={{ minHeight: '100vh', overflowY: 'auto' }}>
        <div className="main-header">
          <h1>Cenovnik usluga</h1>
        </div>
        
        <div className="content-wrapper">
          <div className="left-section">
            <div className="action-buttons-row" ref={addButtonRef}>
              <button className="add-service-btn" onClick={() => setShowAddServiceModal(true)}>
                Dodaj uslugu
              </button>
              <button className="add-btn" onClick={() => setShowAddForm(true)}>
                Dodaj stavku u cenovnik
              </button>
              <button className="save-version-btn" onClick={handleSaveVersion}>
                Sačuvaj verziju
              </button>
              <button className="scroll-promotions-btn" onClick={scrollToPromotions}>
                Skroluj do promocija
              </button>
            </div>
            <section className="price-list-section" ref={promotionsListRef}>
              <h3>Cenovnik {currentPriceList?.id}</h3>
              <table className="price-list-table">
                <thead>
                  <tr>
                    <th>Usluga</th>
                    <th>Životinja</th>
                    <th>Klijent</th>
                    <th>Cena (RSD)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {currentPriceList?.items?.map(item => (
                    <PriceListItemRow 
                      key={item.id} 
                      item={item} 
                      services={services}
                      onUpdatePrice={handleUpdatePrice}
                      onDelete={handleDeleteItem}
                    />
                  ))}
                </tbody>
              </table>
            </section>
            {/* Promotion Section - moved below price list */}
          </div>
          {/* Promotion section visually below price list - removed duplicate */}
          {/* Promotion section visually below price list */}
          <div style={{ gridColumn: '1 / -1', marginTop: '32px' }}>
            <section className="promotion-section">
              <button className="add-promotion-btn" style={{ marginBottom: '10px' }} onClick={handleAddPromotion}>
                Dodaj promociju
              </button>
              <div style={{ marginBottom: '8px' }}>
                <b>Promocije</b>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>
                  Kreiranje, aktiviranje/deaktiviranje, izmena
                </div>
              </div>
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
                  {promotions.map((promo) => (
                    <tr key={promo.id}>
                      <td>{promo.name}</td>
                      <td>{promo.benefitType === 'PERCENTAGE_DISCOUNT' ? 'Procentualni' : 'Fiksni'} ({promo.value})</td>
                      <td>{new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}</td>
                      <td>
                        {promo.status === 'ACTIVE' ? (
                          <span style={{ background: '#D1FAE5', color: '#059669', borderRadius: '12px', padding: '2px 12px', fontSize: '13px' }}>Aktivna</span>
                        ) : promo.status === 'PENDING' ? (
                          <span style={{ background: '#FFF7E0', color: '#B45309', borderRadius: '12px', padding: '2px 12px', fontSize: '13px' }}>Na čekanju</span>
                        ) : promo.status === 'EXPIRED' ? (
                          <span style={{ background: '#FEE2E2', color: '#DC2626', borderRadius: '12px', padding: '2px 12px', fontSize: '13px' }}>Istekla</span>
                        ) : promo.status === 'INACTIVE' ? (
                          <span style={{ background: '#F3F4F6', color: '#6B7280', borderRadius: '12px', padding: '2px 12px', fontSize: '13px' }}>Neaktivna</span>
                        ) : (
                          <span style={{ background: '#FFF7E0', color: '#B45309', borderRadius: '12px', padding: '2px 12px', fontSize: '13px' }}>{promo.status}</span>
                        )}
                      </td>
                      <td>
                        <button className="edit-btn" onClick={() => handleEditPromotion(promo.id)}>Izmeni</button>
                        {(promo.status === 'PENDING' || promo.status === 'INACTIVE') && (
                          <button 
                            className="activate-btn"
                            onClick={() => handleActivatePromotion(promo.id)}
                          >
                            Aktiviraj
                          </button>
                        )}
                        {promo.status === 'ACTIVE' && (
                          <button 
                            className="deactivate-btn"
                            onClick={() => handleDeactivatePromotion(promo.id)}
                          >
                            Deaktiviraj
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
          <div className="right-section">
            <div className="history-section">
              <h3>Istorija cenovnika</h3>
              <p>Prošle verzije</p>
              {priceListHistory.map((priceList, index) => (
                <div key={priceList.id} className="version-item">
                  <div className="version-content">
                    <div className="version-date">
                      Cenovnik {priceList.id}
                      {priceList.effectiveFrom && (
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                          Planirano: {new Date(priceList.effectiveFrom).toLocaleDateString()}
                          {priceList.effectiveTo && ` - ${new Date(priceList.effectiveTo).toLocaleDateString()}`}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="version-actions">
                    <button 
                      className="preview-btn"
                      onClick={() => handlePreviewPriceList(priceList.id)}
                      style={{
                        marginRight: '8px',
                        background: '#E5E7EB',
                        border: 'none',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Pregledaj
                    </button>
                    {!priceList.isActive && (
                      <button 
                        className="activate-version-btn"
                        onClick={() => handleActivateVersion(priceList.id)}
                      >
                        Aktiviraj verziju
                      </button>
                    )}
                    {priceList.isActive && (
                      <span className="active-badge">Aktivna</span>
                    )}
                  </div>
                </div>
              ))}
              {priceListHistory.length === 0 && (
                <div className="no-history">
                  <p>Nema dostupne istorije cenovnika</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Add Item Modal */}
        {showAddForm && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Dodaj novu stavku cenovnika</h3>
              <form onSubmit={handleAddItem}>
                <div className="form-group">
                  <label>Usluga:</label>
                  <select 
                    value={newItem.serviceId} 
                    onChange={(e) => setNewItem({...newItem, serviceId: e.target.value})}
                    required
                  >
                    <option value="">Izaberi uslugu</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cena (RSD):</label>
                  <input 
                    type="number" 
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowAddForm(false)}>
                    Otkaži
                  </button>
                  <button type="submit">Dodaj</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal for adding new service */}
        {showAddServiceModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Dodaj novu uslugu</h3>
              <form onSubmit={handleAddService}>
                <div className="form-group">
                  <label>Naziv usluge:</label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Unesite naziv usluge"
                  />
                </div>
                <div className="form-group">
                  <label>Opis:</label>
                  <textarea
                    value={newService.description}
                    onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Unesite opis usluge (opciono)"
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Tip klijenta:</label>
                  <select
                    value={newService.clientType}
                    onChange={(e) => setNewService(prev => ({ ...prev, clientType: e.target.value }))}
                  >
                    <option value="INDIVIDUAL">Individualni</option>
                    <option value="FARM">Farma</option>
                    <option value="SHELTER">Sklonište</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tip životinje:</label>
                  <select
                    value={newService.animalTypeId}
                    onChange={(e) => setNewService(prev => ({ ...prev, animalTypeId: e.target.value }))}
                    required
                  >
                    <option value="">Izaberite tip životinje</option>
                    {animalTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowAddServiceModal(false)}>
                    Otkaži
                  </button>
                  <button type="submit" className="primary-btn">
                    Dodaj uslugu
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Price List Preview Modal */}
        {showPriceListPreview && selectedPriceList && (
          <div className="modal-overlay" style={{ zIndex: 1000 }}>
            <div className="modal" style={{ width: '90%', maxWidth: '1000px', maxHeight: '80vh', overflow: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Pregled cenovnika {selectedPriceList.id}</h3>
                <button 
                  onClick={() => setShowPriceListPreview(false)}
                  style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>
              
              <table className="price-list-table">
                <thead>
                  <tr>
                    <th>Usluga</th>
                    <th>Životinja</th>
                    <th>Klijent</th>
                    <th>Cena (RSD)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPriceList.items?.map(item => {
                    const serviceDetails = services.find(s => s.id === item.serviceId);
                    return (
                      <tr key={item.id}>
                        <td>{item.serviceName || 'N/A'}</td>
                        <td>{(serviceDetails && serviceDetails.animalType) ? serviceDetails.animalType.name : 'N/A'}</td>
                        <td>{(serviceDetails && serviceDetails.clientType) ? serviceDetails.clientType : 'N/A'}</td>
                        <td>
                          {item.promotionalPrice ? (
                            <div>
                              <span style={{ textDecoration: 'line-through', color: '#666' }}>{item.price} RSD</span>
                              <br/>
                              <span style={{ color: '#10B981', fontWeight: 'bold' }}>{item.promotionalPrice} RSD</span>
                            </div>
                          ) : (
                            `${item.price || ''} RSD`
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button 
                  onClick={() => setShowPriceListPreview(false)}
                  style={{ 
                    padding: '8px 16px',
                    background: '#4B5563',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Zatvori
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Version Modal */}
        {showSaveVersionModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Sačuvaj verziju cenovnika</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleConfirmSaveVersion();
              }}>
                <div className="form-group">
                  <label>Datum aktivacije:</label>
                  <input
                    type="date"
                    value={versionDates.startDate}
                    onChange={(e) => setVersionDates(prev => ({ ...prev, startDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Datum završetka (opciono):</label>
                  <input
                    type="date"
                    value={versionDates.endDate}
                    onChange={(e) => setVersionDates(prev => ({ ...prev, endDate: e.target.value }))}
                    min={versionDates.startDate}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowSaveVersionModal(false)}>
                    Otkaži
                  </button>
                  <button type="submit">Sačuvaj</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default PriceAdminPage;