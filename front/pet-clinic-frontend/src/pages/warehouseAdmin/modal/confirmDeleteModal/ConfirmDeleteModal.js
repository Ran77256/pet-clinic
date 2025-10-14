import './ConfirmDeleteModal.css';

const ConfirmDeleteModal = ({ itemName, onConfirm, onCancel }) => {
    
    const handleConfirm = (e) => {
        e.stopPropagation();
        onConfirm();
    };

    const handleCancel = (e) => {
        e.stopPropagation();
        onCancel();
    };

    return (
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Potvrda brisanja</h2>
                <p>
                    Da li ste sigurni da želite da obrišete stavku **{itemName}** i sve povezane proizvode?
                    Ova akcija je nepovratna.
                </p>
                
                <div className="modal-actions">
                    <button 
                        type="button" 
                        onClick={handleCancel} 
                        className="btn-cancel"
                    >
                        Ne
                    </button>
                    <button 
                        type="button" 
                        onClick={handleConfirm} 
                        className="btn-confirm-delete"
                    >
                        Da, obriši
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;
