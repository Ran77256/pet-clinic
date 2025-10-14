import { useEffect, useState } from 'react';
import WarehousePage from '../WarehousePage'
import './NotificationPage.css'; 
import NotificationRow from './NotificationRow'
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const NotificationsPage = () => {
     const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/notifications`);
                
                setNotifications(response.data);
             } catch (e) {
                console.error("Greška pri dobavljanju obaveštenja:", e);
                setError(`Neuspešno dobavljanje obaveštenja: ${e.message || 'Proverite server.'}`); 
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []); 

    const notificationCount = notifications.length;

    return (
        <WarehousePage>
            <header className="main-header">
                <h2>Obaveštenja</h2>
            </header>
            
            <div className="notifications-list-container">
                {loading && <p>Učitavanje obaveštenja...</p>}
                {error && <p className="error-message">{error}</p>}
                
                {!loading && !error && (
                    <>
                        
                        <div className="notifications-list">
                            {notificationCount === 0 ? (
                                <p className="no-notifications">Nema novih obaveštenja.</p>
                            ) : (
                                notifications.map(notification => (
                                    <NotificationRow 
                                        key={notification.id} 
                                        notification={notification} 
                                    />
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
         </WarehousePage>
    );
}

export default NotificationsPage;
