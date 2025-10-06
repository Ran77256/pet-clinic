import './ItemBlocks.css'; 

const ItemBlock = ({ name, minQuantity, stockLevel }) => {
    
    const isLowStock = stockLevel < minQuantity;

    const blockClassName = `item-block ${isLowStock ? 'low-stock' : ''}`;

    return (
        <div className={blockClassName}>
            <p className="item-name">{name}</p>
            
            <div className="item-details">
                <p>Trenutna količina: <span className="current-qty">{stockLevel}</span></p>
                <p>Min: <span className="min-qty">{minQuantity}</span></p>
            </div>
        </div>
    );
};

export default ItemBlock;
