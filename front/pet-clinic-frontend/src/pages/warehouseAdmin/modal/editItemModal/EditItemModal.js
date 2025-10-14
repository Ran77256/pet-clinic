import { useState, useEffect } from 'react';
import './EditItemModal.css'; 

const EditItemModal = ({ item, onSave, onCancel }) => {
    const [name, setName] = useState(item.name);
    const [minQuantity, setMinQuantity] = useState(item.minQuantity);

    useEffect(() => {
        setName(item.name);
        setMinQuantity(item.minQuantity);
    }, [item]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const updatedItem = {
            ...item, 
            name: name,
            minQuantity: parseInt(minQuantity, 10) 
        };
        
        onSave(updatedItem);
    };

    return (
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Uredi stavku: {item.name}</h2>
                <form onSubmit={handleSubmit}>
                    
                    <div className="form-group">
                        <label htmlFor="name">Naziv stavke</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="minQuantity">Minimalna količina</label>
                        <input
                            id="minQuantity"
                            type="number"
                            value={minQuantity}
                            onChange={(e) => setMinQuantity(e.target.value)}
                            min="0"
                            required
                        />
                    </div>
                    
                    <div className="modal-actions">
                        <button type="button" onClick={onCancel} className="btn-cancel">
                            Poništi
                        </button>
                        <button type="submit" className="btn-save">
                            Sačuvaj izmene
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditItemModal;