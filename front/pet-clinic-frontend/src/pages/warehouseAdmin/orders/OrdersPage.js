import './OrdersPage.css'; 
import WarehousePage from '../WarehousePage'
import OrderListPage from './OrderListPage';

const OrdersPage = () => {
    return (
        <div>
                <header className="main-header">
                    <h2>Narudžbine</h2>
                </header>
                <div className="orders-table-container">
                    <OrderListPage/>
                </div>
                </div>
    );
};

export default OrdersPage;