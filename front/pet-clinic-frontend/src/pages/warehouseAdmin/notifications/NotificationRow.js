import './NotificationRow.css'; 

const NotificationType = {
    LOW_STOCK: 'LOW_STOCK_ITEM',
    WRITE_OFF: 'PRODUCT_WRITTEN_OFF',
    NEW_ORDER: 'NEW_ORDER',
};

const getIcon = (type) => {
    switch (type) {
        case NotificationType.LOW_STOCK:
            return '⚠️'; 
        case NotificationType.WRITE_OFF:
            return '🗑️';  
        case NotificationType.NEW_ORDER:
            return '🛒'; 
        default:
            return '🔔'; 
    }
};

const NotificationRow = ({ notification }) => {
    const formattedDate = new Date(notification.createdAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    
    return (
        <div className="notification-row">
            <div className={`notification-icon notification-type-${notification.type.toLowerCase()}`}>
                {getIcon(notification.type)}
            </div>
            
            <div className="notification-content">
                <div className="notification-message">
                    {notification.description}
                </div>
                <div className="notification-date">
                    {formattedDate}
                </div>
            </div>
        </div>
    );
};

export default NotificationRow;
