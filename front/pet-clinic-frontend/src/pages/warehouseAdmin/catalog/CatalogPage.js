import { useLocation } from 'react-router-dom';
import '../WarehousePage.css'; 
import { Outlet } from 'react-router-dom';
import WarehousePage from '../WarehousePage'
import './CatalogPage.css'

const CatalogPage = () => {
    const location = useLocation();

    const isRootCatalog = location.pathname === '/catalog';


    return (
        <WarehousePage>

            <div className="catalog-page">
                {isRootCatalog && <h2 className="main-title">Katalog</h2>}
                <Outlet />
            </div>
        </WarehousePage>
    );
}

export default CatalogPage;
