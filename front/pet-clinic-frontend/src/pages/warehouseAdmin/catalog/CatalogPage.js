import { useNavigate } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar' 
import '../WarehousePage.css'; 
import { Outlet } from 'react-router-dom';
const CatalogPage = () => {
    const navigate = useNavigate();

    const getActiveItem = () => {
        return 'catalog'; 
    };

    const handleNavigate = (path) => {
        navigate(path);
    }

    return (
        <div className="warehouse-frame">
            <Sidebar activeItem={getActiveItem()} onNavigate={handleNavigate} />

            <div className="main-content">
                <header className="main-header">
                    <h2>Katalog</h2>
                </header>
                
                <div className="catalog-content-wrapper">
                    <Outlet />  
                </div>
            </div>
        </div>
    );
}

export default CatalogPage;
