import { useState } from 'react';
import './AddItemModal.css'; 

const AddItemModal = ({ categoryId, onSave, onCancel, submitError }) => {
    
    const [name, setName] = useState('');
    const [packaging, setPackaging] = useState('');
    const [minQuantity, setMinQuantity] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!name || !packaging || minQuantity === '') {
            alert('Sva polja su obavezna!');
            return;
        }

        const newItemData = {
            name: name.trim(),
            packaging: packaging.trim(),
            minQuantity: parseInt(minQuantity, 10),
            categoryId: parseInt(categoryId, 10), 
        };
        
        onSave(newItemData);
    };

    return (
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Dodaj novu stavku</h2>
                
                {submitError && <p className="error-message" style={{color: 'red'}}>{submitError}</p>}

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
                        <label htmlFor="packaging">Pakovanje (npr. kutija od 10 tableta)</label>
                        <input
                            id="packaging"
                            type="text"
                            value={packaging}
                            onChange={(e) => setPackaging(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="minQuantity">Minimalna količina (Min)</label>
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
                            Dodaj stavku
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddItemModal;