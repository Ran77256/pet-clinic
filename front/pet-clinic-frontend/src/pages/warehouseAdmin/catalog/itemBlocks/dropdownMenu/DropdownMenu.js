import './DropdownMenu.css';

const DropdownMenu = ({ onEdit, onDelete, onClose }) => (
    <div className="dropdown-menu dropdown-menu-vertical">
        <button onClick={(e) => { e.stopPropagation(); onEdit(); onClose(); }}>Uredi</button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); onClose(); }}>Obriši</button>
    </div>
);

export default DropdownMenu;