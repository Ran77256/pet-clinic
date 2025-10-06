import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ProductDetails.css'; 
import OrderModal from '../modal/orderModal/OrderModal';
import AddProductModal from '../modal/addProductModal/AddProductModal';
import ConsumedProductsModal from '../modal/consumedModal/ConsumedProductsModal';


const API_BASE_URL = 'http://localhost:8080/api';

const ProductDetails = () => {
    const { itemId } = useParams();

    const [products, setProducts] = useState([]);
    const [itemDetails, setItemDetails] = useState(null); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => setIsAddModalOpen(false);

    const [isConsumedModalOpen, setIsConsumedModalOpen] = useState(false);
    const openConsumedModal = () => setIsConsumedModalOpen(true);
    const closeConsumedModal = () => setIsConsumedModalOpen(false);



    useEffect(() => {
        if (!itemId) return;

        const fetchItemDetails = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/item/${itemId}`); 
                setItemDetails(response.data);
            } catch (err) {
                console.error("Greška pri dohvatanju detalja stavke:", err);
            }
        };

        fetchItemDetails();
    }, [itemId]);

    const fetchProducts = async () => {
        if (!itemId) return;
        setIsLoading(true);
        setError(null); 
        try {
            const response = await axios.get(`${API_BASE_URL}/products/${itemId}`);
            setProducts(response.data);
        } catch (err) {
            setError('Neuspešno učitavanje serija proizvoda. Proverite konekciju sa serverom.');
            console.error("Fetch error:", err);
        } finally {
            setIsLoading(false); 
        }
    };
    
    useEffect(() => {
        fetchProducts();
    }, [itemId]);
    
    const handleProductSuccess = () => {
        fetchProducts(); 
        closeAddModal(); 
    };
    
    const formatDate = (dateString) => {
        if (!dateString || dateString === 'NULL') return 'N/A'; 
        try {
            return new Date(dateString).toLocaleDateString('sr-RS');
        } catch {
            return dateString; 
        }
    };

    if (isLoading) {
        return <p className="details-loading">Učitavanje detalja proizvoda...</p>;
    }

    if (error) {
        return <p className="details-error">Greška: {error}</p>;
    }

    const validProducts = products.filter(product => {
        const isNotConsumed = product.writeOffDate === null;
        const isNotExpired = !product.expirationDate || new Date(product.expirationDate) >= new Date();
        return isNotConsumed && isNotExpired;
    });


    const consumedProducts = products.filter(product => product.writeOffDate !== null);


    return (
        <div className="product-details-container">
            <h1 className="details-title">Detalji stavke</h1>
            
            <div className="item-info-actions-container">
                
                {itemDetails ? (
                    <div className="item-info-block">
                        <p>Naziv: <strong>{itemDetails.name}</strong></p>
                        <p>Standardno pakovanje: <strong>{itemDetails.packaging || 'N/A'}</strong></p>
                        <p>Minimalna količina: <strong>{itemDetails.minQuantity || 0}</strong></p>
                        <p>Trenutno stanje zaliha: <strong>{itemDetails.stockLevel || 0}</strong></p>
                    </div>
                ) : (
                    <p>Učitavanje osnovnih detalja stavke...</p>
                )}

                <div className="item-actions-block">
                    <button className="action-button" onClick={openAddModal}>Dodaj</button>
                    <button className="action-button" onClick={openConsumedModal}>Potrošnja</button>
                    <button className="action-button" onClick={openModal}>Naruči</button>
                </div>
            </div>
            
            <h4 className="series-title">Detalji serija / pakovanja:</h4>

            <div className="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Barkod</th>
                            <th>Količina</th>
                            <th>Datum unosa</th>
                            <th>Rok trajanja</th>
                        </tr>
                    </thead>
                    <tbody>
                        {validProducts.map((product) => (
                            <tr 
                                key={product.barcode} 
                                className={product.writeOffDate ? 'written-off' : ''}
                            >
                                <td>{product.barcode}</td>
                                <td>{product.quantity}</td>
                                <td>{formatDate(product.entryDate)}</td>
                                <td className={product.writeOffDate ? 'expired-date' : ''}>
                                    {formatDate(product.expirationDate)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && itemDetails && (
                <OrderModal
                    item={itemDetails} 
                    onClose={closeModal} 
                />
            )}
            {isAddModalOpen && itemDetails && (
                <AddProductModal
                    item={itemDetails} 
                    onClose={closeAddModal} 
                    onProductSuccess={handleProductSuccess} 
                />
            )}
            {isConsumedModalOpen && (
                <ConsumedProductsModal
                    consumedProducts={consumedProducts}
                    onClose={closeConsumedModal}
                />
            )}
        </div>
    );
};

export default ProductDetails;
