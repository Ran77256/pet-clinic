// OrderModal.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './OrderModal.css';

const API_BASE_URL = 'http://localhost:8080/api'; 

const OrderModal = ({ item, onClose, onOrderSuccess }) => {
    const [formData, setFormData] = useState({
        itemName: item.name, 
        quantity: '',
        supplierEmail: '',
        itemId: item.id 
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Funkcija za rukovanje unosom u formu (ostaje ista)
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Specijalno rukovanje za Quantity da bi se osiguralo da je broj
        const newValue = name === 'quantity' ? value.replace(/[^0-9]/g, '') : value;
        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    // === IZMENJENA FUNKCIJA ZA SLANJE FORME ===
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);
        
        // Lokalna validacija
        if (!formData.quantity || !formData.supplierEmail) {
            setSubmitError('Molimo popunite sva obavezna polja.');
            return;
        }

        const payload = {
            // Slanje polja koja odgovaraju CreateOrderRequest na backendu
            quantity: parseInt(formData.quantity),
            email: formData.supplierEmail,
            itemId: formData.itemId,
            // (Ime stavke nije potrebno slati ako backend koristi samo itemId)
        };

        setIsSubmitting(true);

        try {
            // Koristimo tačan endpoint: /api/createorder
            const response = await axios.post(
                `${API_BASE_URL}/createorder`, 
                payload // Šaljemo pripremljeni objekat
            );

            // Obaveštavanje roditeljske komponente o uspehu (ako je potrebno osvežavanje)
            if (onOrderSuccess) {
                // Možete proslediti odgovor sa servera
                onOrderSuccess(response.data); 
            }
            onClose(); // Zatvaranje modala nakon uspeha
            
        } catch (err) {
            console.error("Greška pri kreiranju narudžbine:", err);
            
            // Prikazivanje greške od servera, ako je dostupna
            const errorMessage = err.response?.data || 'Neuspešno kreiranje narudžbine. Proverite konekciju sa serverom.';
            setSubmitError(errorMessage);
            
        } finally {
            setIsSubmitting(false);
        }
    };
    // ==========================================

    return (
        // Modal Overlay sa efektom blura na pozadinu
        <div className="oder-modal-overlay" onClick={onClose}>
            {/* Modal Content - Sprečavamo zatvaranje klikom unutar njega */}
            <div className="oder-modal-content" onClick={e => e.stopPropagation()}>
                
                <div className="oder-modal-header">
                    <h2>Dodaj narudžbinu</h2>
                    <button className="oder-close-button" onClick={onClose} disabled={isSubmitting}>&times;</button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    
                    {/* Polje 1: Naziv Proizvoda (prepopulisano, samo za čitanje) */}
                    <div className="oder-form-group">
                        <label>Naziv proizvoda:</label>
                        <input 
                            type="text" 
                            name="itemName" 
                            value={formData.itemName} 
                            readOnly 
                            className="oder-readonly-field" 
                        />
                    </div>
                    
                    {/* Polje 2: Količina */}
                    <div className="oder-form-group">
                        <label>Količina:</label>
                        <input 
                            type="number" 
                            name="quantity" 
                            value={formData.quantity} 
                            onChange={handleChange} 
                            required 
                            min="1"
                        />
                    </div>

                    {/* Polje 3: Email Dobavljača */}
                    <div className="oder-form-group">
                        <label>Email dobavljača:</label>
                        <input 
                            type="email" 
                            name="supplierEmail" 
                            value={formData.supplierEmail} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    {submitError && <p className="oder-submit-error-message">{submitError}</p>}
                    
                    {/* Samo jedno dugme "Potvrdi" */}
                    <div className="oder-modal-footer">
                        <button 
                            type="submit" 
                            className="oder-action-button oder-confirm-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Slanje...' : 'Potvrdi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrderModal;