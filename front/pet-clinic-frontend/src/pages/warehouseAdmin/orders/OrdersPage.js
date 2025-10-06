import './OrdersPage.css'; 
import WarehousePage from '../WarehousePage'

const OrdersPage = () => {
    return (
            <WarehousePage>
                <header className="main-header">
                    <h2>Narudžbine</h2>
                </header>
                <div className="orders-table-container">
                    <p>Prikazuje 5 od 5 transakcija</p>
                </div>
</WarehousePage>
    );
};

export default OrdersPage;