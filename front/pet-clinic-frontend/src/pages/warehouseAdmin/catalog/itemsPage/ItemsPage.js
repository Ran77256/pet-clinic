import { useState, useEffect } from 'react';
import { useParams, useNavigate  } from 'react-router-dom';
import axios from 'axios';
import ItemBlock from '../itemBlocks/ItemBlock';
import './ItemsPage.css';
import EditItemModal from '../../modal/editItemModal/EditItemModal';
import ConfirmDeleteModal from '../../modal/confirmDeleteModal/ConfirmDeleteModal';
import AddItemModal from '../../modal/addItemModal/AddItemModal';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addSubmitError, setAddSubmitError] = useState(null);

    const pageTitle = `Katalog ${categoryTitleMap[subcategorySlug] || 'stavki'}`;

    const handleOpenAddModal = () => {
        setAddSubmitError(null);
        setIsAddModalOpen(true);
    };

    const handleCancelAdd = () => {
        setIsAddModalOpen(false);
        setAddSubmitError(null);
    };

    const handleSaveNewItem = async (newItemData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/items`, newItemData);

            if (response.status === 201) {
                const createdItem = response.data; 
                setItems(prevItems => [...prevItems, createdItem]);
                
                setIsAddModalOpen(false);
                setAddSubmitError(null);
                
                console.log("Nova stavka dodata:", createdItem.name);
            }

        } catch (err) {
            console.error("Greška pri dodavanju nove stavke:", err);
            let errorMessage = 'Neuspešno dodavanje stavke. Pokušajte ponovo.';
            if (err.response && err.response.data) {
                 errorMessage = `Greška: ${err.response.data}`;
            }
            setAddSubmitError(errorMessage);
        }
    };

    const handleEditClick = (item) => {
         setItemToEdit(item);
        setSubmitError(null); 
        setIsModalOpen(true);
    };

     const handleSave = async (updatedItem) => {
        
        const { id, name, minQuantity } = updatedItem;

        const editRequest = { id, name, minQuantity };

        try {
            const response = await axios.put(`${API_BASE_URL}/items/edit`, editRequest);

            if (response.status === 200 || response.status === 204) {
                setItems(prevItems => 
                    prevItems.map(item => 
                        item.id === id ? { ...item, name: name, minQuantity: minQuantity } : item
                    )
                );
                
                setIsModalOpen(false);
                setItemToEdit(null);
                setSubmitError(null);
            }

        } catch (err) {
            console.error("Greška pri snimanju:", err);
            if (err.response && err.response.data) {
                 setSubmitError(`Greška: ${err.response.data}`);
            } else {
                 setSubmitError('Neuspešno snimanje stavke. Pokušajte ponovo.');
            }
            
        }
    };

     const handleCancel = () => {
        setIsModalOpen(false);
        setItemToEdit(null);
        setSubmitError(null);
    };

    const handlePreDelete = (item) => {
        setItemToDelete(item);
        setIsConfirmDeleteOpen(true);
    };

    const handleCancelDelete = () => {
        setIsConfirmDeleteOpen(false);
        setItemToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return; 

        const itemId = itemToDelete.id;
        
        setIsConfirmDeleteOpen(false);
        setItemToDelete(null); 

        try {
            const response = await axios.delete(`${API_BASE_URL}/items/${itemId}`);

            if (response.status === 204) {
                setItems(prevItems => prevItems.filter(item => item.id !== itemId));
                console.log(`Stavka ID ${itemId} uspešno obrisana.`);
            }

        } catch (err) {
            let errorMessage = 'Neuspešno brisanje stavke. Pokušajte ponovo.';
            if (err.response && err.response.data) {
                 errorMessage = `Greška pri brisanju: ${err.response.data}`;
            }
            console.error(errorMessage, err);
            alert(errorMessage); 
        }
    };

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
            <div className="page-header"> 
                <h3 className="subcategory-title">{pageTitle}</h3>
                <button 
                    className="btn-add-item" 
                    onClick={handleOpenAddModal}
                >
                    Dodaj stavku
                </button>
            </div>
            <div className="items-grid-container">
                {items.map((item, index) => (
                    <ItemBlock 
                        key={item.id}
                        name={item.name}
                        minQuantity={item.minQuantity}
                        stockLevel={item.stockLevel}
                        itemId={item.id}
                        onClick={() => handleItemClick(item.id, item.name)}
                        onEdit={() => handleEditClick(item)} 
                        onDelete={() => handlePreDelete(item)}
                    />
                ))}
            </div>
            {isModalOpen && itemToEdit && (
                <EditItemModal
                    item={itemToEdit}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    submitError={submitError}
                />
            )}
            {isConfirmDeleteOpen && itemToDelete && (
                <ConfirmDeleteModal
                    itemName={itemToDelete.name}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}
            {isAddModalOpen && (
                <AddItemModal
                    categoryId={categoryId} // Prosleđujemo ID kategorije iz rute
                    onSave={handleSaveNewItem}
                    onCancel={handleCancelAdd}
                    submitError={addSubmitError}
                />
            )}
        </div>
    );
};

export default ItemsPage;