import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddPetPage.css';

const API_BASE = 'http://localhost:8080/api';

const AddPetPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        animalTypeId: '',
        breedId: '',
        birthDate: '',
        microchip: '',
        description: ''
    });
    
    // Options from API
    const [animalTypes, setAnimalTypes] = useState([]);
    const [breeds, setBreeds] = useState([]);
    const [filteredBreeds, setFilteredBreeds] = useState([]);
    const [availableHealthConditions, setAvailableHealthConditions] = useState([]);
    
    // Selected health conditions - stores the condition IDs that are selected
    const [selectedHealthConditions, setSelectedHealthConditions] = useState([]);

    useEffect(() => {
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/');
            return;
        }
        
        try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
        } catch (error) {
            console.error('Error parsing user data:', error);
            navigate('/');
            return;
        }

        // Load animal types and health conditions
        fetchAnimalTypes();
        fetchHealthConditions();
    }, [navigate]);

    // Filter breeds when animal type changes
    useEffect(() => {
        if (formData.animalTypeId) {
            const selectedAnimalType = animalTypes.find(type => type.id === parseInt(formData.animalTypeId));
            if (selectedAnimalType && selectedAnimalType.breeds) {
                console.log('Selected animal type:', selectedAnimalType);
                console.log('Available breeds:', selectedAnimalType.breeds);
                setFilteredBreeds(selectedAnimalType.breeds);
            } else {
                console.log('No breeds found for selected animal type');
                setFilteredBreeds([]);
            }
            // Reset breed selection when animal type changes
            setFormData(prev => ({ ...prev, breedId: '' }));
        } else {
            setFilteredBreeds([]);
            setFormData(prev => ({ ...prev, breedId: '' }));
        }
    }, [formData.animalTypeId, animalTypes]);

    const fetchAnimalTypes = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/animal-types/alldto');
            const responseText = await response.text();
            console.log('Raw response for animal types:', responseText);
            
            // Pokušaj da parse-uješ JSON
            const data = JSON.parse(responseText);
            console.log('Parsed animal types data:', data);
            console.log('Is array:', Array.isArray(data));
            console.log('Number of animal types:', data?.length);
            
            if (Array.isArray(data)) {
                // Ekstraktuj samo potrebne podatke da izbegneš circular reference
                const cleanedTypes = data.map(type => ({
                    id: type.id,
                    name: type.name,
                    breeds: type.breeds ? type.breeds.map(breed => ({
                        id: breed.id,
                        name: breed.name
                    })) : []
                }));
                console.log('Cleaned animal types:', cleanedTypes);
                setAnimalTypes(cleanedTypes);
            } else {
                console.error('Data is not array:', data);
                setAnimalTypes([]);
            }
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
            console.log('Fetching breeds from:', `${API_BASE}/breeds/all`);
            const response = await axios.get(`${API_BASE}/breeds/all`);
            console.log('Breeds response:', response.data);
            
            if (Array.isArray(response.data)) {
                setBreeds(response.data);
            } else {
                console.error('Breeds response is not an array:', response.data);
                setBreeds([]);
            }
        } catch (error) {
            console.error('Error fetching breeds:', error);
            console.error('Error details:', error.response?.data || error.message);
            setBreeds([]);
        }
    };

    const fetchHealthConditions = async () => {
        try {
            console.log('Fetching health conditions from:', `${API_BASE}/health-conditions/all`);
            const response = await axios.get(`${API_BASE}/health-conditions/all`);
            console.log('Health conditions response:', response.data);
            
            if (Array.isArray(response.data)) {
                setAvailableHealthConditions(response.data);
            } else {
                console.error('Health conditions response is not an array:', response.data);
                setAvailableHealthConditions([]);
            }
        } catch (error) {
            console.error('Error fetching health conditions:', error);
            console.error('Error details:', error.response?.data || error.message);
            setAvailableHealthConditions([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleHealthConditionChange = (conditionId, hasCondition) => {
        if (hasCondition === 'yes') {
            // Add condition to selected list if not already present
            setSelectedHealthConditions(prev => {
                if (!prev.includes(conditionId)) {
                    return [...prev, conditionId];
                }
                return prev;
            });
        } else if (hasCondition === 'no') {
            // Remove condition from selected list
            setSelectedHealthConditions(prev => 
                prev.filter(id => id !== conditionId)
            );
        }
    };

    const handleLogout = () => {
        if (window.confirm('Da li ste sigurni da se želite odjaviti?')) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            navigate('/');
        }
    };

    const handleCancel = () => {
        navigate('/user');
    };

    const handleScheduleAppointment = () => {
        navigate('/schedule-appointment');
    };

    const handlePriceList = () => {
        navigate('/price-list');
    };

    const handleBackToDashboard = () => {
        navigate('/user');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user || !user.id) {
            alert('Greška: Korisnik nije pronađen');
            return;
        }

        if (!formData.name.trim()) {
            alert('Molimo unesite ime ljubimca');
            return;
        }

        if (!formData.animalTypeId) {
            alert('Molimo izaberite vrstu ljubimca');
            return;
        }

        setLoading(true);

        try {
            const petData = {
                name: formData.name.trim(),
                animaltype: { id: parseInt(formData.animalTypeId) },
                breed: formData.breedId ? { id: parseInt(formData.breedId) } : null,
                birthDate: formData.birthDate || null,
                microchipNumber: formData.microchip.trim() || null,
                description: formData.description.trim() || null,
                owner: { id: user.id },
                healthConditions: selectedHealthConditions.map(id => ({ id }))
            };

            console.log('Submitting pet data:', petData);

            const response = await axios.post(
                `${API_BASE}/pets/add`, 
                petData,
                { 
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Accept': 'application/json' 
                    } 
                }
            );
            
            if (response.status === 201) {
                alert('Ljubimac je uspešno dodat!');
                navigate('/user');
            }
        } catch (error) {
            console.error('Error adding pet:', error);
            if (error.response) {
                alert(`Greška pri dodavanju ljubimca: ${error.response.data?.message || error.response.data}`);
            } else {
                alert('Greška pri dodavanju ljubimca. Molimo pokušajte ponovo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-pet-page">
            {/* Header */}
            <div className="add-pet-header">
                <div className="brand-section">
                    <div className="brand-logo">
                        <div className="logo-circle">
                            <span className="logo-text">🐾</span>
                        </div>
                    </div>
                    <div className="brand-info">
                        <h1 className="brand-title">PetClinic</h1>
                        <p className="brand-subtitle">Ambulanta za ljubimce</p>
                    </div>
                </div>
                
                <div className="action-buttons">
                    <button className="action-btn primary" onClick={handleScheduleAppointment}>
                        Zakaži termin
                    </button>
                    <button className="action-btn secondary" onClick={handlePriceList}>
                        Cenovnik
                    </button>
                    <button className="action-btn tertiary" onClick={handleBackToDashboard}>
                        Nazad na ljubimce
                    </button>
                </div>

                <div className="user-section">
                    <span className="user-name">{user?.firstName || 'Korisnik'}</span>
                    <button className="logout-btn" onClick={handleLogout}>
                        Log out
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="add-pet-content">
                <div className="form-container">
                    <h2 className="form-title">Dodaj ljubimca</h2>
                    <p className="form-subtitle">Popunite osnovne podatke o zdravstvenom stanju ljubimca.</p>

                    <form onSubmit={handleSubmit} className="pet-form">
                        <div className="form-columns">
                            {/* Left Column */}
                            <div className="form-column">
                                <div className="input-group">
                                    <label className="input-label">Ime ljubimca</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="npr. Luna"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Veterinar</label>
                                    <select className="form-select" disabled>
                                        <option>Odaberite veterinara</option>
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Vrsta ljubimca</label>
                                    <select
                                        name="animalTypeId"
                                        value={formData.animalTypeId}
                                        onChange={handleInputChange}
                                        className="form-select"
                                        required
                                    >
                                        <option value="">Odaberite [pas, mačka, zec...]</option>
                                        {Array.isArray(animalTypes) && animalTypes.map(type => (
                                            <option key={type.id} value={type.id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Rasa ljubimca</label>
                                    <select
                                        name="breedId"
                                        value={formData.breedId}
                                        onChange={handleInputChange}
                                        className="form-select"
                                        disabled={!formData.animalTypeId}
                                    >
                                        <option value="">Odaberite rasu</option>
                                        {Array.isArray(filteredBreeds) && filteredBreeds.map(breed => (
                                            <option key={breed.id} value={breed.id}>
                                                {breed.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="form-column">
                                <div className="input-group">
                                    <label className="input-label">Datum rođenja</label>
                                    <input
                                        type="date"
                                        name="birthDate"
                                        placeholder="DD.MM.GGGG"
                                        value={formData.birthDate}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Broj mikročipa</label>
                                    <input
                                        type="text"
                                        name="microchip"
                                        placeholder="npr. 985120323123456"
                                        value={formData.microchip}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="input-group full-width">
                            <label className="input-label">Opis</label>
                            <textarea
                                name="description"
                                placeholder="Dodatne informacije, naprike, posebne napomene..."
                                value={formData.description}
                                onChange={handleInputChange}
                                className="form-textarea"
                                rows="4"
                            />
                        </div>

                        {/* Health Status */}
                        <div className="health-status-section">
                            <h3 className="section-title">Zdravstveni status</h3>
                            
                            <div className="health-checkboxes">
                                {Array.isArray(availableHealthConditions) && availableHealthConditions.map((condition, index) => {
                                    const isEven = index % 2 === 0;
                                    const isLastOdd = index === availableHealthConditions.length - 1 && !isEven;
                                    
                                    if (isEven) {
                                        return (
                                            <div key={`row-${Math.floor(index / 2)}`} className="checkbox-row">
                                                <div className="checkbox-group">
                                                    <span className="checkbox-text">{condition.name}</span>
                                                    <div className="checkbox-options">
                                                        <label>
                                                            <input 
                                                                type="radio" 
                                                                name={`condition-${condition.id}`}
                                                                value="yes"
                                                                checked={selectedHealthConditions.includes(condition.id)}
                                                                onChange={() => handleHealthConditionChange(condition.id, 'yes')}
                                                            /> 
                                                            Da
                                                        </label>
                                                        <label>
                                                            <input 
                                                                type="radio" 
                                                                name={`condition-${condition.id}`}
                                                                value="no"
                                                                checked={!selectedHealthConditions.includes(condition.id)}
                                                                onChange={() => handleHealthConditionChange(condition.id, 'no')}
                                                            /> 
                                                            Ne
                                                        </label>
                                                    </div>
                                                </div>
                                                
                                                {/* Second condition in the row (if exists) */}
                                                {availableHealthConditions[index + 1] && (
                                                    <div className="checkbox-group">
                                                        <span className="checkbox-text">{availableHealthConditions[index + 1].name}</span>
                                                        <div className="checkbox-options">
                                                            <label>
                                                                <input 
                                                                    type="radio" 
                                                                    name={`condition-${availableHealthConditions[index + 1].id}`}
                                                                    value="yes"
                                                                    checked={selectedHealthConditions.includes(availableHealthConditions[index + 1].id)}
                                                                    onChange={() => handleHealthConditionChange(availableHealthConditions[index + 1].id, 'yes')}
                                                                /> 
                                                                Da
                                                            </label>
                                                            <label>
                                                                <input 
                                                                    type="radio" 
                                                                    name={`condition-${availableHealthConditions[index + 1].id}`}
                                                                    value="no"
                                                                    checked={!selectedHealthConditions.includes(availableHealthConditions[index + 1].id)}
                                                                    onChange={() => handleHealthConditionChange(availableHealthConditions[index + 1].id, 'no')}
                                                                /> 
                                                                Ne
                                                            </label>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Odustani
                            </button>
                            <button
                                type="submit"
                                className="btn-submit"
                                disabled={loading}
                            >
                                {loading ? 'Dodajem...' : 'Dodaj ljubimca'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddPetPage;