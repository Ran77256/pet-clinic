import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import ItemBlock from '../itemBlocks/ItemBlock'; 
import './CatalogCategories.css'; 

const API_BASE_URL = 'http://localhost:8080/api'; 

const CatalogCategories = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/categories`);
                setCategories(response.data);
                setIsLoading(false);
            } catch (err) {
                console.error("Greška pri dobavljanju kategorija:", err);
                setError("Nije moguće učitati kategorije.");
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []); 

    const goToSubcategory = (name) => {
        const subcategorySlug = name.toLowerCase().replace(/š/g, 's').replace(/č/g, 'c').replace(/ć/g, 'c');
        
        navigate(`/catalog/${subcategorySlug}`); 
    };

    
    if (isLoading) {
        return <div className="catalog-blocks-container">Učitavanje kategorija...</div>;
    }

    if (error) {
        return <div className="catalog-blocks-container error">{error}</div>;
    }

    return (
        <div className="catalog-blocks-container">
            {categories.map(category => (
                <ItemBlock
                    key={category.id} 
                    onClick={() => goToSubcategory(category.name)}
                    content={category.name} 
                >
                </ItemBlock>
            ))}
        </div>
    );
}

export default CatalogCategories;