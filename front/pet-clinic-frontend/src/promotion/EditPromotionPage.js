import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './CreatePromotionPage.css';

const EditPromotionPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [priceListItems, setPriceListItems] = useState([]);
    const [uniqueServices, setUniqueServices] = useState([]);
    const [promotionData, setPromotionData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        discountType: 'percent',
        discountValue: '',
        selectedServices: []
    });

    useEffect(() => {
        fetchPriceListItems();
        fetchPromotionDetails();
    }, [id]);

    const fetchPromotionDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/promotions/${id}`);
            const promotion = response.data;
            
            setPromotionData({
                name: promotion.name,
                startDate: new Date(new Date(promotion.startDate).getTime() + new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
                endDate: new Date(new Date(promotion.endDate).getTime() + new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
                discountType: promotion.benefitType === 'PERCENTAGE_DISCOUNT' ? 'percent' : 'fixed',
                discountValue: promotion.value.toString(),
                selectedServices: promotion.services.map(s => s.id)
            });
        } catch (error) {
            console.error('Error fetching promotion details:', error);
            alert('Greška pri učitavanju detalja promocije');
        }
    };

    const fetchPriceListItems = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/price-list-items/all');
            setPriceListItems(response.data);
            
            const serviceMap = new Map();
            response.data.forEach(item => {
                if (!item || !item.serviceId) {
                    return;
                }
                const existingService = serviceMap.get(item.serviceId);
                const itemValidFrom = item.priceList?.validFrom;
                const existingValidFrom = existingService?.priceList?.validFrom;
                
                if (!existingService || (itemValidFrom && existingValidFrom && new Date(itemValidFrom) > new Date(existingValidFrom))) {
                    serviceMap.set(item.serviceId, item);
                }
            });
            
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
            const now = new Date();
            const startDate = new Date(promotionData.startDate);
            const endDate = new Date(promotionData.endDate);
            
            // Add the timezone offset to keep the exact time selected
            const startDateTime = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000);
            const endDateTime = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000);
            
            console.log('Selected start time:', promotionData.startDate);
            console.log('Adjusted start time:', startDateTime.toISOString());
            
            const requestData = {
                name: promotionData.name,
                startDate: startDateTime.toISOString(),
                endDate: endDateTime.toISOString(),
                benefitType: promotionData.discountType === 'percent' ? 'PERCENTAGE_DISCOUNT' : 'FIXED_AMOUNT_DISCOUNT',
                status: startDate > now ? 'PENDING' : 'ACTIVE',
                value: parseFloat(promotionData.discountValue),
                services: promotionData.selectedServices.map(id => ({
                    id: id
                }))
            };

            const response = await axios.put(`http://localhost:8080/api/promotions/update/${id}`, requestData);
            
            if (response.data && response.data.status === 'ACTIVE') {
                await axios.post(`http://localhost:8080/api/promotions/${response.data.id}/apply`);
            }
            
            alert('Promocija je uspešno izmenjena!');
            navigate('/priceAdmin');
        } catch (error) {
            console.error('Error updating promotion:', error);
            alert('Došlo je do greške prilikom izmene promocije. Molimo pokušajte ponovo.');
        }
    };

    return (
        <div className="create-promotion-container">
            <h2>Izmeni promociju</h2>
            <p className="subtitle">Izmena tipa pogodnosti, perioda, ciljne usluge</p>
            
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
                            Procentni popust
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
                            type="datetime-local"
                            name="startDate"
                            value={promotionData.startDate}
                            onChange={handleInputChange}
                            step="60"
                        />
                        <span>do</span>
                        <input
                            type="datetime-local"
                            name="endDate"
                            value={promotionData.endDate}
                            onChange={handleInputChange}
                            step="60"
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
                    <button type="submit" className="btn-save">Sačuvaj izmene</button>
                </div>
            </form>
        </div>
    );
};

export default EditPromotionPage;