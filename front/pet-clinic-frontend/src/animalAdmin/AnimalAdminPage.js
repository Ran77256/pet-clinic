import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AnimalAdminPage.css';

const AnimalAdminPage = () => {
    const navigate = useNavigate();
    
    const [animalTypes, setAnimalTypes] = useState([]);
    const [breeds, setBreeds] = useState([]);
    const [healthConditions, setHealthConditions] = useState([]);

    const [veterinarians, setVeterinarians] = useState([]);

    
    // State za dodavanje novih stavki
    const [newAnimalType, setNewAnimalType] = useState('');
    const [newBreed, setNewBreed] = useState('');
    const [newHealthCondition, setNewHealthCondition] = useState('');
    const [selectedAnimalTypeForBreed, setSelectedAnimalTypeForBreed] = useState('');

    // Učitavanje podataka prilikom mount-a komponente
    useEffect(() => {
        fetchAnimalTypes();
        fetchBreeds();
        fetchHealthConditions();
        fetchVeterinarians(); 
    }, []);

     const fetchVeterinarians = async () => {
        try {
            // Koristimo endpoint koji ste definisali u backendu
            const response = await fetch('http://localhost:8080/api/veterinarians/getall');
            if (response.ok) {
                const data = await response.json();
                setVeterinarians(data);
                console.log('Veterinari uspešno učitani:', data);
            } else {
                console.error('Greška pri učitavanju veterinara:', response.status);
            }
        } catch (error) {
            console.error('Greška pri komunikaciji sa serverom za veterinare:', error);
        }
    };

    // API pozivi za učitavanje podataka
    const fetchAnimalTypes = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/animal-types/alldto');
            const responseText = await response.text();
            console.log('Raw response for animal types:', responseText);
            
            // Pokušaj da parse-uješ JSON
            const data = JSON.parse(responseText);
            setAnimalTypes(data);
        } catch (error) {
            console.error('Greška pri učitavanju vrsta životinja:', error);
            // Ako je JSON problem, postavi prazan niz
            if (error instanceof SyntaxError) {
                console.error('Invalid JSON received from backend');
                setAnimalTypes([]);
            }
        }
    };

    const fetchBreeds = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/breeds/all');
            const responseText = await response.text();
            console.log('Raw response for breeds:', responseText);
            
            // Pokušaj da parse-uješ JSON
            const data = JSON.parse(responseText);
            setBreeds(data);
        } catch (error) {
            console.error('Greška pri učitavanju rasa:', error);
            // Ako je JSON problem, postavi prazan niz
            if (error instanceof SyntaxError) {
                console.error('Invalid JSON received from backend');
                setBreeds([]);
            }
        }
    };

    const fetchHealthConditions = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/health-conditions/all');
            const responseText = await response.text();
            console.log('Raw response for health conditions:', responseText);
            
            // Pokušaj da parse-uješ JSON
            const data = JSON.parse(responseText);
            setHealthConditions(data);
        } catch (error) {
            console.error('Greška pri učitavanju zdravstvenih stanja:', error);
            // Ako je JSON problem, postavi prazan niz
            if (error instanceof SyntaxError) {
                console.error('Invalid JSON received from backend');
                setHealthConditions([]);
            }
        }
    };

    // Funkcije za dodavanje novih stavki
    const addAnimalType = async () => {
        if (!newAnimalType.trim()) return;
        
        try {
            const requestData = { name: newAnimalType };
            console.log('Šaljem podatke za novu vrstu:', requestData);
            
            const response = await fetch('http://localhost:8080/api/animal-types/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            
            if (response.ok) {
                console.log('Vrsta uspešno dodana');
                setNewAnimalType('');
                fetchAnimalTypes();
            } else {
                const errorText = await response.text();
                console.error('Backend greška:', response.status, errorText);
                alert(`Greška pri dodavanju vrste: ${errorText}`);
            }
        } catch (error) {
            console.error('Greška pri dodavanju vrste životinje:', error);
            alert(`Greška pri dodavanju vrste: ${error.message}`);
        }
    };

    const addBreed = async () => {
        if (!newBreed.trim()) return;
        if (!selectedAnimalTypeForBreed) {
            alert('Molimo izaberite vrstu životinje pre dodavanja rase.');
            return;
        }
        
        try {
            const requestData = { 
                name: newBreed,
                animalType: {
                    id: selectedAnimalTypeForBreed
                }
            };
            console.log('Šaljem podatke za novu rasu:', requestData);
            
            const response = await fetch('http://localhost:8080/api/breeds/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            
            if (response.ok) {
                console.log('Rasa uspešno dodana');
                setNewBreed('');
                setSelectedAnimalTypeForBreed('');
                fetchBreeds();
            } else {
                const errorText = await response.text();
                console.error('Backend greška:', response.status, errorText);
                alert(`Greška pri dodavanju rase: ${errorText}`);
            }
        } catch (error) {
            console.error('Greška pri dodavanju rase:', error);
            alert(`Greška pri dodavanju rase: ${error.message}`);
        }
    };

    const addHealthCondition = async () => {
        if (!newHealthCondition.trim()) return;
        
        try {
            const response = await fetch('http://localhost:8080/api/health-conditions/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newHealthCondition })
            });
            
            if (response.ok) {
                setNewHealthCondition('');
                fetchHealthConditions();
            }
        } catch (error) {
            console.error('Greška pri dodavanju zdravstvenog stanja:', error);
        }
    };

    // Funkcije za brisanje stavki
    const deleteAnimalType = async (id) => {
        // Proverava da li postoje rase za ovu vrstu
        const rasesForType = breeds.filter(breed => breed.animalType && breed.animalType.id === id);
        
        if (rasesForType.length > 0) {
            const confirm = window.confirm(
                `Ova vrsta ima ${rasesForType.length} rasa. Brisanje vrste će obrisati i sve njene rase. Da li ste sigurni?`
            );
            if (!confirm) return;
        }
        
        try {
            const response = await fetch(`http://localhost:8080/api/animal-types/delete/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                fetchAnimalTypes();
                fetchBreeds(); // Osvežava i rase jer su možda obrisane
            } else {
                const errorText = await response.text();
                console.error('Backend greška:', response.status, errorText);
                alert(`Greška pri brisanju vrste: ${errorText}`);
            }
        } catch (error) {
            console.error('Greška pri brisanju vrste životinje:', error);
            alert(`Greška pri brisanju vrste: ${error.message}`);
        }
    };

    const deleteBreed = async (id) => {
        const confirm = window.confirm('Da li ste sigurni da želite da obrišete ovu rasu?');
        if (!confirm) return;
        
        try {
            const response = await fetch(`http://localhost:8080/api/breeds/delete/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                fetchBreeds();
            } else {
                const errorText = await response.text();
                console.error('Backend greška:', response.status, errorText);
                alert(`Greška pri brisanju rase: ${errorText}`);
            }
        } catch (error) {
            console.error('Greška pri brisanju rase:', error);
            alert(`Greška pri brisanju rase: ${error.message}`);
        }
    };

    const deleteHealthCondition = async (id) => {
        const confirm = window.confirm('Da li ste sigurni da želite da obrišete ovo zdravstveno stanje?');
        if (!confirm) return;
        
        try {
            const response = await fetch(`http://localhost:8080/api/health-conditions/delete/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                fetchHealthConditions();
            } else {
                const errorText = await response.text();
                console.error('Backend greška:', response.status, errorText);
                alert(`Greška pri brisanju zdravstvenog stanja: ${errorText}`);
            }
        } catch (error) {
            console.error('Greška pri brisanju zdravstvenog stanja:', error);
            alert(`Greška pri brisanju zdravstvenog stanja: ${error.message}`);
        }
    };

    // Logout funkcija
    const handleLogout = () => {
        const confirm = window.confirm('Da li ste sigurni da se želite odjaviti?');
        if (confirm) {
            // Obriši bilo koje stored podatke (ako ih ima)
            localStorage.removeItem('userToken');
            localStorage.removeItem('userRole');
            sessionStorage.clear();
            
            // Vrati na login stranicu
            navigate('/');
        }
    };

    return (
        <div className="animal-admin-page">
            <div className="brand-header">
                <p className="pet-clinic-title">PetClinic</p>
                <p className="ambulanta-subtitle">Ambulanta za ljubimce</p>
            </div>
            
            <div className="user-section-top">
                <span>Administrator</span>
                <button className="logout-btn" onClick={handleLogout}>Log out</button>
            </div>

            <div className="admin-content">
                <h2>Šifrarnici: Vrste, Rase i Zdravstveni tipovi</h2>
                
                <div className="admin-sections">
                    {/* Vrste životinja */}
                    <div className="admin-section">
                        <h3>Vrste</h3>
                        <p>Izaberi vrstu za prikaz rasa</p>
                        
                        <div className="items-list">
                            {animalTypes.map((type) => (
                                <div key={type.id} className="item-row">
                                    <span>{type.name}</span>
                                    <button 
                                        className="delete-btn"
                                        onClick={() => deleteAnimalType(type.id)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        <div className="add-section">
                            <p>Dodaj novu vrstu</p>
                            <div className="add-form">
                                <input
                                    type="text"
                                    placeholder="npr. Ginaz"
                                    value={newAnimalType}
                                    onChange={(e) => setNewAnimalType(e.target.value)}
                                />
                                <button onClick={addAnimalType} className="add-btn">
                                    Dodaj
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Rase */}
                    <div className="admin-section">
                        <h3>Rase</h3>
                        <p>Lista svih rasa</p>
                        
                        <div className="items-list">
                            {breeds.map((breed) => (
                                <div key={breed.id} className="item-row">
                                    <div className="item-info">
                                        <span className="breed-name">{breed.name}</span>
                                        {breed.animalType && (
                                            <span className="breed-type">({breed.animalType.name})</span>
                                        )}
                                    </div>
                                    <button 
                                        className="delete-btn"
                                        onClick={() => deleteBreed(breed.id)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        <div className="add-section">
                            <p>Dodaj novu rasu</p>
                            <div className="add-form-breed">
                                <select
                                    value={selectedAnimalTypeForBreed}
                                    onChange={(e) => setSelectedAnimalTypeForBreed(e.target.value)}
                                    className="animal-type-select"
                                >
                                    <option value="">Izaberi vrstu životinje</option>
                                    {animalTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="npr. Border koli"
                                    value={newBreed}
                                    onChange={(e) => setNewBreed(e.target.value)}
                                />
                                <button onClick={addBreed} className="add-btn">
                                    Dodaj
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Zdravstveni tipovi */}
                    <div className="admin-section">
                        <h3>Zdravstveni tipovi</h3>
                        <p>Standardno/alternativno ugo se koriste u kartonm</p>
                        
                        <div className="items-list">
                            {healthConditions.map((condition) => (
                                <div key={condition.id} className="item-row">
                                    <span>{condition.name}</span>
                                    <button 
                                        className="delete-btn"
                                        onClick={() => deleteHealthCondition(condition.id)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        <div className="add-section">
                            <p>Dodaj novi zdravstveni tip</p>
                            <div className="add-form">
                                <input
                                    type="text"
                                    placeholder="npr. Parazitološki tretman"
                                    value={newHealthCondition}
                                    onChange={(e) => setNewHealthCondition(e.target.value)}
                                />
                                <button onClick={addHealthCondition} className="add-btn">
                                    Dodaj
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="veterinarians-section">
                    <h2>Pregled veterinara</h2>
                    <table className="veterinarians-table">
                        <thead>
                            <tr>
                                <th>Ime i Prezime</th>
                                <th>Email</th>
                                <th>Specijalizacija</th>
                                <th>Telefon</th>
                                <th>Broj pacijenata</th>
                            </tr>
                        </thead>
                        <tbody>
                            {veterinarians.map((vet) => (
                                <tr key={vet.id}>
                                    <td>{vet.firstName} {vet.lastName}</td>
                                    <td>{vet.email}</td>
                                    <td>{vet.specialization}</td>
                                    <td>{vet.phoneNumber}</td>
                                    <td>{vet.petsCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnimalAdminPage;