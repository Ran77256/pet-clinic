import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';

const API_BASE = 'http://localhost:8080/api';

function UserDashboard() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user info from localStorage or session
    const userData = localStorage.getItem('user');
    console.log('Raw user data from localStorage:', userData);
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('Parsed user data:', parsedUser);
        console.log('User ID:', parsedUser.id);
        console.log('User firstName:', parsedUser.firstName);
        console.log('User lastName:', parsedUser.lastName);
        
        setUser(parsedUser);
        if (parsedUser.id) {
          console.log('✓ User has ID:', parsedUser.id, 'Type:', typeof parsedUser.id);
          console.log('✓ About to fetch pets for owner ID:', parsedUser.id);
          fetchUserPets(parsedUser.id);
        } else {
          console.log('✗ User has no ID, showing empty pets list');
          console.log('✗ Parsed user object:', parsedUser);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUser({ firstName: 'Klijent' });
        setLoading(false);
      }
    } else {
      console.log('No user data found in localStorage, showing empty pets list');
      setUser({ firstName: 'Klijent' });
      setLoading(false);
    }
  }, [navigate]);

  const fetchUserPets = async (userId) => {
    try {
      setLoading(true);
      console.log('=== STARTING FETCH PETS ===');
      console.log('🔍 Fetching pets for user ID:', userId);
      console.log('🔍 User ID type:', typeof userId);
      console.log('🔍 User ID is null/undefined?', userId == null);
      console.log('🔍 User ID as number:', Number(userId));
      console.log('🔍 Current user object:', user);
      
      // Ensure userId is a number for backend
      const ownerIdForBackend = Number(userId);
      console.log('🔍 Owner ID being sent to backend:', ownerIdForBackend);
      
      // Pokušaj nekoliko različitih endpoint-ova
      let response;
      let data = null;
      
      // Prvi pokušaj: /pets/by-owner/{userId}
      const url = `${API_BASE}/pets/by-owner/${ownerIdForBackend}`;
      console.log('📞 Calling endpoint:', url);
      console.log('📞 Full URL being called:', url);
      
      const token = localStorage.getItem('token');
      console.log('Using token:', token ? 'Token found' : 'No token');
      
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      response = await fetch(url, { headers });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        data = await response.json();
        console.log('SUCCESS: Pets data received from /pets/by-owner:', data);
        console.log('Data type:', typeof data);
        console.log('Is array?', Array.isArray(data));
        console.log('Number of pets found:', Array.isArray(data) ? data.length : 'Not an array - single object?');
        
        // Ensure we always work with an array
        if (!Array.isArray(data)) {
          console.log('WARNING: Backend returned single object instead of array, wrapping in array');
          data = data ? [data] : [];
        }
        
        console.log('Final processed data:', data);
      } else {
        const errorText = await response.text();
        console.log(`❌ FAILED: /pets/by-owner/${ownerIdForBackend} returned status:`, response.status);
        console.log('❌ Error response:', errorText);
        
        // Debug: Pokušaj da dohvatiš sve pets da vidiš šta postoji u bazi
        console.log('🔍 === DEBUG: Fetching ALL pets to see what exists ===');
        try {
          const debugResponse = await fetch(`${API_BASE}/pets`, { headers });
          if (debugResponse.ok) {
            const allPets = await debugResponse.json();
            console.log('🔍 DEBUG: All pets in system:', allPets);
            console.log('🔍 DEBUG: Number of all pets:', Array.isArray(allPets) ? allPets.length : 'Not an array');
            if (Array.isArray(allPets)) {
              allPets.forEach((pet, index) => {
                console.log(`🔍 DEBUG Pet ${index}:`, {
                  id: pet.id,
                  name: pet.name,
                  ownerId: pet.owner?.id || pet.ownerId || pet.owner_id,
                  owner: pet.owner,
                  matchesOurUser: (pet.owner?.id || pet.ownerId || pet.owner_id) === ownerIdForBackend
                });
              });
            }
          }
        } catch (debugError) {
          console.log('🔍 DEBUG: Error fetching all pets:', debugError);
        }
        
        // Drugi pokušaj: /pets?ownerId={userId}
        response = await fetch(`${API_BASE}/pets?ownerId=${ownerIdForBackend}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          data = await response.json();
          console.log('Pets data received from /pets?ownerId:', data);
        } else {
          console.log(`❌ /pets?ownerId=${ownerIdForBackend} returned:`, response.status);
          
          // Treći pokušaj: /pets (svi pets, pa filtriramo)
          response = await fetch(`${API_BASE}/pets`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const allPets = await response.json();
            console.log('📋 All pets received:', allPets);
            // Filtriramo pets za trenutnog korisnika
            data = Array.isArray(allPets) ? allPets.filter(pet => {
              const petOwnerId = pet.owner?.id || pet.ownerId || pet.owner_id;
              const matches = petOwnerId === ownerIdForBackend;
              console.log(`🔍 Pet "${pet.name}" owner ID: ${petOwnerId}, matches user ${ownerIdForBackend}? ${matches}`);
              return matches;
            }) : [];
            console.log('✅ Filtered pets for user:', data);
          }
        }
      }
      
      if (data) {
        console.log('Final data to set:', data);
        console.log('Is data an array?', Array.isArray(data));
        console.log('Data length:', Array.isArray(data) ? data.length : 'Not an array');
        
        if (Array.isArray(data)) {
          console.log('Setting pets array with', data.length, 'pets');
          setPets(data);
        } else {
          console.log('Data is not an array, wrapping in array');
          setPets([data]);
        }
      } else {
        console.log('No pets found for user');
        setPets([]);
      }
      
    } catch (error) {
      console.error('Network error fetching pets:', error);
      setPets([]);
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

  const handleAddPet = () => {
    navigate('/add-pet');
  };

  const handlePriceList = () => {
    navigate('/price-list');
  };

  const handleScheduleAppointment = () => {
    navigate('/schedule-appointment');
  };

  const handlePetDetails = (petId, event) => {
    if (event) {
      event.stopPropagation(); // Sprečava aktiviranje onClick-a na parent div-u
    }
    console.log('Navigating to pet details for pet ID:', petId);
    navigate(`/pet-details/${petId}`);
  };

  return (
    <div className="user-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="brand-section">
          <p className="pet-clinic-title">PetClinic</p>
          <p className="ambulanta-subtitle">Ambulanta za ljubimce</p>
        </div>
        
        <div className="action-buttons">
          <button className="action-btn primary" onClick={handleScheduleAppointment}>
            Zakaži termin
          </button>
          <button className="action-btn secondary" onClick={handlePriceList}>
            Cenovnik
          </button>
          <button className="action-btn primary" onClick={handleAddPet}>
            Dodaj ljubimca
          </button>
        </div>

        <div className="user-section">
          <span className="user-name">
            {(() => {
              const displayName = user?.firstName || 'Klijent';
              console.log('Displaying user name:', displayName);
              console.log('Current user state:', user);
              return displayName;
            })()}
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        <div className="pets-section">
          <h2 className="section-title">Tvoji ljubimci</h2>
          
          {(() => {
            console.log('RENDER: Loading state:', loading);
            console.log('RENDER: Pets array:', pets);
            console.log('RENDER: Pets length:', pets.length);
            return null;
          })()}
          
          {loading ? (
            <div className="loading">Učitavanje ljubimaca...</div>
          ) : pets.length === 0 ? (
            <div className="no-pets">
              <p>Nemate registrovane ljubimce</p>
              <p style={{fontSize: '14px', color: '#6B7280', marginTop: '10px'}}>
                Možete dodati svojeg prvog ljubimca klikom na dugme ispod.
              </p>
              <button className="add-first-pet-btn" onClick={handleAddPet}>
                Dodaj prvog ljubimca
              </button>
            </div>
          ) : (
            <div className="pets-grid">
              {(() => {
                console.log('RENDER: Mapping over pets:', pets);
                return pets.map((pet, index) => {
                  console.log(`RENDER: Pet ${index}:`, pet);
                  return (
                <div key={pet.id} className="pet-card" onClick={() => handlePetDetails(pet.id)}>
                  <div className="pet-info">
                    <h3 className="pet-name">Ime: {pet.name || 'Nepoznato ime'}</h3>
                    <p className="pet-detail">
                      Vrsta: {pet.animalTypeName || pet.animaltype?.name || pet.species?.name || 'N/A'}
                    </p>
                    <p className="pet-detail">
                      Rasa: {pet.breed?.name || pet.breedName|| 'N/A'}
                    </p>
                    {pet.birthDate && (
                      <p className="pet-detail">
                        Datum rođenja: {new Date(pet.birthDate).toLocaleDateString('sr-RS')}
                      </p>
                    )}
                    {pet.microchipNumber && (
                      <p className="pet-detail">
                        Mikročip: {pet.microchipNumber}
                      </p>
                    )}
                  </div>
                  <button 
                    className="pet-action-btn"
                    onClick={(e) => handlePetDetails(pet.id, e)}
                  >
                    Profil
                  </button>
                </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;