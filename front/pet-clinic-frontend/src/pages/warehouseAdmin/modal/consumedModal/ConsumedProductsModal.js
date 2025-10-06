import './ConsumedProductsModal.css';

const ConsumedProductsModal = ({ consumedProducts, onClose }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('sr-RS');
    };

    return (
        <div className="consumed-modal-overlay" onClick={onClose}>
            <div className="consumed-modal-content consumed-modal" onClick={(e) => e.stopPropagation()}>
                <div className="consumed-modal-header">
                    <button className="consumed-close-button" onClick={onClose}>
                        &times;
                    </button>
                </div>


                {consumedProducts.length === 0 ? (
                    <p>Nema potrošenih proizvoda.</p>
                ) : (
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Barkod</th>
                                    <th>Datum potrošnje</th>
                                    <th>Razlog</th>
                                    <th>Potrošena količina</th>
                                </tr>
                            </thead>
                            <tbody>
                                {consumedProducts.map((product) => (
                                    <tr key={product.barcode}>
                                        <td>{product.barcode}</td>
                                        <td>{formatDate(product.writeOffDate)}</td>
                                        <td>{product.reason}</td>
                                        <td>{product.consumedQuantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConsumedProductsModal;
