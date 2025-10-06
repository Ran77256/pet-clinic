import WarehousePage from '../WarehousePage'
import './NotificationPage.css'; 

const NotificationsPage = () => {
    return (
        <WarehousePage>
            <header className="main-header">
                <h2>Obaveštenja</h2>
            </header>
            
            <div className="notifications-list-container">
                <p>Prikazuje 1-3 od 3 obaveštenja</p>
            </div>
        </WarehousePage>
    );
}

export default NotificationsPage;