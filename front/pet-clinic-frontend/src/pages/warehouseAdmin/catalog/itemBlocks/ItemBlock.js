import { useState } from "react";
import  DropdownMenu  from './dropdownMenu/DropdownMenu'
import './ItemBlocks.css'

const ItemBlock = ({ name, minQuantity, stockLevel, onClick, onEdit, onDelete }) => {
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const hasStockDetails = minQuantity !== undefined && stockLevel !== undefined && name !== undefined;
    
    const isCategoryBlock = !hasStockDetails;

    const isLowStock = hasStockDetails && stockLevel < minQuantity;

    const blockClassName = `item-block ${isLowStock ? 'low-stock' : ''} ${isCategoryBlock ? 'category-block-style' : ''}`;

    const handleMenuToggle = (e) => {
        e.stopPropagation(); 
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className={blockClassName} onClick={onClick}> 
            
            <p className="item-name">{name}</p>
            
            {hasStockDetails && (
                <div className="kebab-menu-container">
                    <button className="kebab-button vertical" onClick={handleMenuToggle}>
                        ⋮
                    </button>
                    {isMenuOpen && (
                        <DropdownMenu
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onClose={() => setIsMenuOpen(false)}
                        />
                    )}
                </div>
            )}
            
            {hasStockDetails && (
                <div className="item-details">
                    <p>Trenutna količina: <span className="current-qty">{stockLevel}</span></p>
                    <p>Min: <span className="min-qty">{minQuantity}</span></p>
                </div>
            )}
            
        </div>
    );
};

export default ItemBlock;
