import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeItem, onNavigate }) => {

    const navigate = useNavigate();

    return (
        <div className="sidebar">
            
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
                <p className="user-role-info">Administrator - magacin</p>
            <div className="user-logout-footer">
                <p className="user-name">Icy Trix</p> 
                <button 
                    className="btn-logout" 
                    onClick={() => {
                        navigate('/');
                    }}
                >
                    Logout
                </button>

            </div>
            </nav>
        </div>
    );
}

export default Sidebar;
