import './ItemBlocks.css'; 

const ItemBlock = ({ name, minQuantity, stockLevel, onClick }) => {
    
    const isCategoryBlock = minQuantity === undefined && stockLevel === undefined;

    const isLowStock = !isCategoryBlock && stockLevel < minQuantity;

    const blockClassName = `item-block ${isLowStock ? 'low-stock' : ''} ${isCategoryBlock ? 'category-block-style' : ''}`;

    return (
        <div className={blockClassName} onClick={onClick}> 
            <p className="item-name">{name}</p>
            
            {!isCategoryBlock && (
                <div className="item-details">
                    <p>Trenutna količina: <span className="current-qty">{stockLevel}</span></p>
                    <p>Min: <span className="min-qty">{minQuantity}</span></p>
                </div>
            )}
            
        </div>
    );
};

export default ItemBlock;
