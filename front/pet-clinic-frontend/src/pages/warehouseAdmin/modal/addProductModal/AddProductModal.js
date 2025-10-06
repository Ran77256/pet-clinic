import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddProductModal.css';

const API_BASE_URL = 'http://localhost:8080/api';

const AddProductModal = ({ item, onClose, onProductSuccess }) => {
    const [formData, setFormData] = useState({
        barcode: '',
        expirationDate: '',
        quantity: '',
        entryDate: '',
        itemId: item.id,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [barcodeError, setBarcodeError] = useState(null);
    const [submitError, setSubmitError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        if (barcodeError) {
            setBarcodeError(null);
        }
    }, [formData.barcode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);
        setBarcodeError(null);

        const { barcode, expirationDate, quantity, entryDate } = formData;

        if (!barcode || !expirationDate || !quantity || !entryDate) {
            setSubmitError('Molimo popunite sva obavezna polja.');
            return;
        }

        const payload = {
            barcode,
            expirationDate,
            quantity: parseInt(quantity),
            entryDate,
            itemId: formData.itemId,
        };

        setIsSubmitting(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/addproduct`, payload);
            if (onProductSuccess) {
                onProductSuccess(response.data);
            }
            onClose();
        } catch (err) {
            const errorMessage = String(
                err.response?.data?.message || err.response?.data || 'Neuspešno dodavanje robe.'
            );

            if (
                errorMessage.toLowerCase().includes('barkod vec postoji') ||
                errorMessage.toLowerCase().includes('barcode already exists')
            ) {
                setBarcodeError('Barkod već postoji!');
            } else {
                setSubmitError(errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const today = new Date().toISOString().split('T')[0]; // format: 'YYYY-MM-DD'


    return (
        <div className="add-modal-overlay" onClick={onClose}>
            <div className="add-product-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="add-modal-header">
                    <h2 className="add-modal-title">Dodajte novu robu</h2>
                    <button className="add-close-button" onClick={onClose} disabled={isSubmitting}>
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="add-form-group">
                        <label>Barkod</label>
                        <div className="add-input-wrapper">
                            <input
                                type="text"
                                name="barcode"
                                value={formData.barcode}
                                onChange={handleChange}
                                required
                                placeholder="Npr. 100056"
                                className={barcodeError ? 'add-input-error' : ''}
                            />
                            {barcodeError && (
                                <p className="add-input-error-message">{barcodeError}</p>
                            )}
                        </div>
                    </div>

                    <div className="add-form-group">
                        <label>Količina</label>
                        <div className="add-input-wrapper">
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                required
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="add-form-group">
                        <label>Datum unosa</label>
                        <div className="add-input-wrapper">
                            <input
                                type="date"
                                name="entryDate"
                                value={formData.entryDate}
                                onChange={handleChange}
                                required
                                min={today}
                            />
                        </div>
                    </div>

                    <div className="add-form-group">
                        <label>Rok trajanja</label>
                        <div className="add-input-wrapper">
                            <input
                                type="date"
                                name="expirationDate"
                                value={formData.expirationDate}
                                onChange={handleChange}
                                required
                                min={formData.entryDate || today}
                            />
                        </div>
                    </div>

                    {submitError && <p className="add-submit-error-message">{submitError}</p>}

                    <div className="add-modal-footer">
                        <button
                            type="submit"
                            className="add-action-button add-confirm-button"
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

export default AddProductModal;
