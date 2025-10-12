import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';
import './OrderListPage.css'; 
import WarehousePage from '../WarehousePage'

const API_BASE_URL = 'http://localhost:8080/api';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleString('sr-RS', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
        
    } catch (e) {
        console.error("Greška pri formatiranju datuma:", e);
        return dateString;
    }
};

const OrderListPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/orders`);
                setOrders(response.data);
            } catch (err) {
                setError('Neuspešno učitavanje narudžbina. Proverite API endpoint i konekciju.');
                console.error("Fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleNavigate = (path) => {
        navigate(path);
    };

    if (isLoading) {
        return (
            <div className="orders-page-layout">
                <Sidebar activeItem="orders" onNavigate={handleNavigate} />
                <div className="orders-content">
                    <p className="loading-message">Učitavanje narudžbina...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="orders-page-layout">
                <Sidebar activeItem="orders" onNavigate={handleNavigate} />
                <div className="orders-content">
                    <p className="error-message">Greška: {error}</p>
                </div>
            </div>
        );
    }

    const translateStatus = (status) => {
    switch (status) {
        case 'CREATED':
            return 'Kreirana';
        case 'RECIEVED': 
            return 'Primljena';
        case 'CANCELED':
            return 'Otkazana';
        default:
            return status || 'N/A'; 
    }
};

    return (
        <WarehousePage>
                <header className="main-header">
                    <h2>Narudžbine</h2>
                </header>
                <div className="orders-table-container">
                
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Stavka</th>
                                <th>Datum kreiranja</th>
                                <th>Količina</th>
                                <th>Email dobavljača</th>
                                <th>Status</th>
                                <th>Tip kreiranja</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <tr 
                                        key={order.id} 
                                        className={order.status === 'PENDING' ? 'status-pending' : ''}
                                    >
                                        <td>{order.id}</td>
                                        <td>{order.itemName || 'N/A'}</td> 
                                        <td>{formatDate(order.creationDate)}</td>
                                        <td>{order.quantity}</td>
                                        <td>{order.email || 'N/A'}</td>
                                        <td>{translateStatus(order.status)}</td> 
                                        <td>{order.creationType || 'Manuelno'}</td> 
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="no-orders-message">Nema pronađenih narudžbina.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                </div>
</WarehousePage>
        
    );
};

export default OrderListPage;