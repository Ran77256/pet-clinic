import { useState, useEffect } from 'react';
import { useParams, useNavigate  } from 'react-router-dom';
import axios from 'axios';
import ItemBlock from '../itemBlocks/ItemBlock';
import './ItemsPage.css';

const API_BASE_URL = 'http://localhost:8080/api';

const categoryTitleMap = {
    'medicaments': 'lekova',
    'food': 'hrane',
    'equipment': 'opreme',
};

const ItemsPage = () => {
    const { categoryId, subcategorySlug } = useParams();
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const pageTitle = `Katalog ${categoryTitleMap[subcategorySlug] || 'stavki'}`;


    useEffect(() => {
        const fetchItems = async () => {
            if (!categoryId) {
                setError("Nedostaje ID kategorije.");
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/items/${categoryId}`);

                setItems(response.data); 
                
            } catch (err) {
                setError('Neuspešno učitavanje stavki. Proverite konekciju sa serverom.');
                console.error("Fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchItems();
    }, [categoryId]);

    if (isLoading) {
        return <p>Učitavanje stavki...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>Greška: {error}</p>;
    }

    const handleItemClick = (itemId, itemName) => {
        navigate(`/catalog/${subcategorySlug}/${categoryId}/items/${itemId}`);
    };

    return (
        <div className="subcategory-wrapper">
            <h3 className="subcategory-title">{pageTitle}</h3>
            
            <div className="items-grid-container">
                {items.map((item, index) => (
                    <ItemBlock 
                        key={item.id}
                        name={item.name}
                        minQuantity={item.minQuantity}
                        stockLevel={item.stockLevel}
                        itemId={item.id}
                        onClick={() => handleItemClick(item.id, item.name)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ItemsPage;