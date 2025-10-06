import { useState, useEffect } from 'react';
import axios from 'axios';
import ItemBlock from '../itemBlocks/ItemBlock';
import './MedicamentsPage.css'; 

const API_BASE_URL = 'http://localhost:8080/api';

const MedicamentsPage = () => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const medicamentsId = 1;

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/items/${medicamentsId}`);

                setItems(response.data); 
                
            } catch (err) {
                setError('Neuspešno učitavanje stavki. Proverite konekciju sa serverom.');
                console.error("Fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchItems();
    }, []); 

    if (isLoading) {
        return <p>Učitavanje lekova...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>Greška: {error}</p>;
    }
    
    return (
        
        <div className="subcategory-wrapper">
            <h3 className="subcategory-title">Katalog lekova</h3>
            
            <div className="items-grid-container">
                {items.map((item, index) => (
                    <ItemBlock 
                        key={index} 
                        name={item.name}
                        minQuantity={item.minQuantity}
                        stockLevel={item.stockLevel}
                    />
                ))}
            </div>
        </div>
    );
};

export default MedicamentsPage;
