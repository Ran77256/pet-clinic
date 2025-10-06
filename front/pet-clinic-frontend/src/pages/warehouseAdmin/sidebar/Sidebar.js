const Sidebar = ({ activeItem, onNavigate }) => {
    return (
        <div className="sidebar">
            <div className="brand-header-sidebar">
                <p className="pet-clinic-title">PetClinic</p>
                <p className="ambulanta-subtitle">Ambulanta za ljubimce</p>
            </div>
            
            <nav className="nav-menu">
                <div 
                    className={`nav-item ${activeItem === 'orders' ? 'active' : ''}`}
                    onClick={() => onNavigate('/orders')} 
                >
                    📦 Narudžbina
                </div>
                <div 
                    className={`nav-item ${activeItem === 'notifications' ? 'active' : ''}`}
                    onClick={() => onNavigate('/notifications')} 
                >
                    🔔 Obaveštenja
                </div>
                <div 
                    className={`nav-item ${activeItem === 'catalog' ? 'active' : ''}`}
                    onClick={() => onNavigate('/catalog')}
                >
                    📚 Katalog
                </div>
            </nav>

            <button className="btn-logout">Izloguj se</button>
        </div>
    );
}

export default Sidebar;
