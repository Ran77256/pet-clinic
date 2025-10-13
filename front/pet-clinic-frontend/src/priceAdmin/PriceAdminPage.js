import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PriceAdminPage.css';

const API_BASE = 'http://localhost:8080/api';

// Component for individual price list item row with inline editing
const PriceListItemRow = ({ item, onUpdatePrice, onDelete, services }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editPrice, setEditPrice] = useState(item.price || '');

  // Find the service details to get animal type
  const serviceDetails = services.find(s => s.id === item.serviceId);

  const handleSavePrice = () => {
    if (editPrice !== item.price) {
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
      <td>{serviceDetails?.animalType?.name || 'N/A'}</td>
      <td>{serviceDetails?.clientType || 'N/A'}</td>
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
          `${item.price || ''} RSD`
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

  useEffect(() => {
    fetchCurrentPriceList();
    fetchPriceListHistory();
    fetchServices();
    fetchAnimalTypes();
  }, []);

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

  const handleSaveVersion = async () => {
    try {
      // Create draft from active and then publish it
      const draftResponse = await fetch(`${API_BASE}/price-lists/draft-from-active`, {
        method: 'POST',
      });
      
      if (draftResponse.ok) {
        const draft = await draftResponse.json();
        
        // Publish the draft
        const publishResponse = await fetch(`${API_BASE}/price-lists/${draft.id}/publish`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            effectiveFrom: new Date().toISOString()
          }),
        });
        
        if (publishResponse.ok) {
          await fetchCurrentPriceList();
          await fetchPriceListHistory();
          alert('Verzija cenovnika je uspešno sačuvana!');
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
    <div className="price-admin-container">
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
      
      <main className="price-admin-main">
        <div className="main-header">
          <h1>Cenovnik usluga</h1>
        </div>
        
        <div className="content-wrapper">
          <div className="left-section">
            <div className="action-buttons-row">
              <button className="add-service-btn" onClick={() => setShowAddServiceModal(true)}>
                Dodaj uslugu
              </button>
              <button className="add-btn" onClick={() => setShowAddForm(true)}>
                Dodaj stavku u cenovnik
              </button>
              <button className="save-version-btn" onClick={handleSaveVersion}>
                Sačuvaj verziju
              </button>
            </div>
            
            <section className="price-list-section">
              <h3>Aktivna verzija cenovnika</h3>
              <div className="version-info">
                {currentPriceList && (
                  <span>Verzija {currentPriceList.version} — aktivna po ponedl</span>
                )}
              </div>
              
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
          </div>
          
          <div className="right-section">
            <div className="history-section">
              <h3>Istorija cenovnika</h3>
              <p>Prošle verzije</p>
              {priceListHistory.map((priceList, index) => (
                <div key={priceList.id} className="version-item">
                  <div className="version-content">
                    <div className="version-date">
                      Verzija {priceList.version}
                    </div>
                    <div className="version-details">
                      {priceList.name || 'Standardni cenovnik'}
                    </div>
                    <div className="version-status">
                      {priceList.validFrom ? 
                        `Aktivna od ${new Date(priceList.validFrom).toLocaleDateString('sr-RS')}` : 
                        'Draft verzija'
                      }
                    </div>
                    <div className="version-info-small">
                      {priceList.items?.length || 0} stavki
                    </div>
                  </div>
                  <div className="version-actions">
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
      </main>
    </div>
  );
}

export default PriceAdminPage;
