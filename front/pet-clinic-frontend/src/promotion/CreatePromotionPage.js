import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreatePromotionPage.css';

const CreatePromotionPage = () => {
    const navigate = useNavigate();
    const [priceListItems, setPriceListItems] = useState([]);
    const [uniqueServices, setUniqueServices] = useState([]);
    const [promotionData, setPromotionData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        discountType: 'percent', // percent or fixed
        discountValue: '',
        selectedServices: []
    });

    useEffect(() => {
        fetchPriceListItems();
    }, []);

    const fetchPriceListItems = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/price-list-items/all');
            setPriceListItems(response.data);
            
            // Create a Map to store unique services with their latest price
            const serviceMap = new Map();
            response.data.forEach(item => {
                if (!item || !item.serviceId) {
                    return; // Skip invalid items
                }
                const existingService = serviceMap.get(item.serviceId);
                const itemValidFrom = item.priceList?.validFrom;
                const existingValidFrom = existingService?.priceList?.validFrom;
                
                if (!existingService || (itemValidFrom && existingValidFrom && new Date(itemValidFrom) > new Date(existingValidFrom))) {
                    serviceMap.set(item.serviceId, item);
                }
            });
            
            // Convert Map values to array
            setUniqueServices(Array.from(serviceMap.values()));
        } catch (error) {
            console.error('Error fetching price list items:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPromotionData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleServiceSelection = (e) => {
        const serviceId = parseInt(e.target.value);
        setPromotionData(prev => ({
            ...prev,
            selectedServices: e.target.checked
                ? [...prev.selectedServices, serviceId]
                : prev.selectedServices.filter(id => id !== serviceId)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const requestData = {
                name: promotionData.name,
                startDate: new Date(promotionData.startDate).toISOString(),
                endDate: new Date(promotionData.endDate).toISOString(),
                benefitType: promotionData.discountType === 'percent' ? 'PERCENTAGE_DISCOUNT' : 'FIXED_AMOUNT_DISCOUNT',
                status: 'ACTIVE',
                value: parseFloat(promotionData.discountValue),
                services: promotionData.selectedServices.map(id => ({
                    id: id
                }))
            };

            const response = await axios.post('http://localhost:8080/api/promotions/add', requestData);
            if (response.data && response.data.id && response.data.status === 'ACTIVE') {
                // Ako je promocija aktivna, odmah je primenimo
                await axios.post(`http://localhost:8080/api/promotions/${response.data.id}/apply`);
            }
            alert('Promocija je uspešno kreirana!');
            navigate('/priceAdmin');
        } catch (error) {
            console.error('Error creating promotion:', error);
            alert('Došlo je do greške prilikom kreiranja promocije. Molimo pokušajte ponovo.');
        }
    };

    return (
        <div className="create-promotion-container">
            <h2>Dodaj promociju</h2>
            <p className="subtitle">Tip pogodnosti, period, ciljne usluge, i pravila primene</p>
            
            <form onSubmit={handleSubmit}>
                <div className="form-section">
                    <label>Naziv promocije</label>
                    <input
                        type="text"
                        name="name"
                        value={promotionData.name}
                        onChange={handleInputChange}
                        placeholder="npr. Jesenji popust 10%"
                    />
                </div>

                <div className="form-section">
                    <label>Tip pogodnosti</label>
                    <div className="radio-group">
                        <label>
                            <input
                                type="radio"
                                name="discountType"
                                value="percent"
                                checked={promotionData.discountType === 'percent'}
                                onChange={handleInputChange}
                            />
                            Procentni popusta
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="discountType"
                                value="fixed"
                                checked={promotionData.discountType === 'fixed'}
                                onChange={handleInputChange}
                            />
                            Fiksni vaučer
                        </label>
                    </div>
                    <input
                        type="number"
                        name="discountValue"
                        value={promotionData.discountValue}
                        onChange={handleInputChange}
                        placeholder={promotionData.discountType === 'percent' ? "npr. 10%" : "npr. 1000 RSD"}
                    />
                </div>

                <div className="form-section">
                    <label>Period važenja</label>
                    <div className="date-inputs">
                        <input
                            type="date"
                            name="startDate"
                            value={promotionData.startDate}
                            onChange={handleInputChange}
                        />
                        <span>do</span>
                        <input
                            type="date"
                            name="endDate"
                            value={promotionData.endDate}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="form-section">
                    <label>Odabir usluga</label>
                    <div className="services-list">
                        {uniqueServices.map(item => (
                            <div key={item.serviceId} className="service-item">
                                <label>
                                    <input
                                        type="checkbox"
                                        value={item.serviceId}
                                        checked={promotionData.selectedServices.includes(item.serviceId)}
                                        onChange={handleServiceSelection}
                                    />
                                    {item.serviceName} - {item.price} RSD
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={() => navigate('/priceAdmin')}>Odustani</button>
                    <button type="submit" className="btn-save">Sačuvaj</button>
                </div>
            </form>
        </div>
    );
};

export default CreatePromotionPage;