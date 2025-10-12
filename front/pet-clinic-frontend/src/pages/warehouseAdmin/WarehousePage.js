import { useNavigate, useLocation } from 'react-router-dom';
import './WarehousePage.css'; 
import Sidebar from './sidebar/Sidebar'

const WarehouseLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const getActiveItem = () => {
        if (location.pathname.startsWith('/notifications')) return 'notifications';
        if (location.pathname.startsWith('/catalog')) return 'catalog';
        if (location.pathname.startsWith('/orders')) return 'orders';
        return 'orders'; 
    };

    const handleNavigate = (path) => {
        navigate(path);
    }

    return (
        <div className="warehouse-frame">
            <div className="app-header-outside">
                <p className="pet-clinic-title">PetClinic</p>
                <p className="ambulanta-subtitle">Ambulanta za ljubimce</p>
            </div>
            <Sidebar activeItem={getActiveItem()} onNavigate={handleNavigate} />

            <div className="main-content">
                {children} 
            </div>
        </div>
    );
}
export default WarehouseLayout;
