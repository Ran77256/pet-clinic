import { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import axios from 'axios'; 
import ItemBlock from "../itemBlocks/ItemBlock";

const API_BASE_URL = 'http://localhost:8080/api';

const CATEGORY_MAP = {
    'LEKOVI': { id: 1, slug: 'medicaments' },
    'HRANA': { id: 2, slug: 'food' },
    'OPREMA': { id: 3, slug: 'equipment' },
};

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

    const goToSubcategory = (categoryName, categoryId) => {
        const mapping = CATEGORY_MAP[categoryName.toUpperCase()];
        const subcategorySlug = mapping ? mapping.slug : categoryName.toLowerCase();
        
        navigate(`/catalog/${subcategorySlug}/${categoryId}`);
    };
    
    if (isLoading) {
        return <div className="catalog-blocks-container">Učitavanje kategorija...</div>;
    }

    if (error) {
        return <div className="catalog-blocks-container error">{error}</div>;
    }

    if (categories.length === 0) {
        return (
            <div className="catalog-blocks-container no-data-message">
                <h2>Nema kategorija u bazi! 😥</h2>
                <p>Molimo vas, unesite osnovne kategorije koristeći sledeću SQL komandu:</p>
                <div className="sql-command-block">
                    <pre>
                        <code>
                            INSERT INTO categories (id, name) VALUES (1, 'LEKOVI'), (2, 'HRANA'), (3, 'OPREMA');
                        </code>
                    </pre>
                </div>
            </div>
        );
    }

    return (
        <div className="catalog-blocks-container">
            {categories.map(category => (
                <ItemBlock
                    key={category.id} 
                    onClick={() => goToSubcategory(category.name, category.id)}
                    name={category.name} 
                />
            ))}
        </div>
    );
}

export default CatalogCategories;
