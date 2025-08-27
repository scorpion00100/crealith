import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { addNotification } from '@/store/slices/uiSlice';
import { useAppDispatch } from '@/store';
import { Bell, X, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    action?: {
        label: string;
        url: string;
    };
}

export const NotificationCenter: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!isAuthenticated) return;

        // Simuler une connexion WebSocket pour les notifications en temps réel
        const mockWebSocket = {
            onmessage: (event: any) => {
                const notification = JSON.parse(event.data);
                handleNewNotification(notification);
            }
        };

        // Simuler des notifications en temps réel
        const interval = setInterval(() => {
            const mockNotifications = [
                {
                    id: Date.now().toString(),
                    type: 'success' as const,
                    title: 'Nouvelle vente !',
                    message: 'Votre produit "Dashboard Analytics Pro" vient d\'être vendu.',
                    timestamp: new Date(),
                    read: false,
                    action: {
                        label: 'Voir les détails',
                        url: '/dashboard/sales'
                    }
                },
                {
                    id: (Date.now() + 1).toString(),
                    type: 'info' as const,
                    title: 'Nouveau commentaire',
                    message: 'Vous avez reçu un nouveau commentaire sur votre produit.',
                    timestamp: new Date(),
                    read: false,
                    action: {
                        label: 'Répondre',
                        url: '/dashboard/reviews'
                    }
                }
            ];

            // Simuler une notification aléatoire
            if (Math.random() > 0.7) {
                const randomNotification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
                mockWebSocket.onmessage({ data: JSON.stringify(randomNotification) });
            }
        }, 30000); // Toutes les 30 secondes

        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const handleNewNotification = (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Afficher une notification toast
        dispatch(addNotification({
            type: notification.type,
            message: notification.message,
            duration: 5000
        }));
    };

    const markAsRead = (notificationId: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === notificationId ? { ...notif, read: true } : notif
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
    };

    const removeNotification = (notificationId: string) => {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle size={20} className="text-green-500" />;
            case 'error':
                return <XCircle size={20} className="text-red-500" />;
            case 'warning':
                return <AlertCircle size={20} className="text-yellow-500" />;
            case 'info':
                return <Info size={20} className="text-blue-500" />;
            default:
                return <Info size={20} className="text-gray-500" />;
        }
    };

    const formatTimestamp = (timestamp: Date) => {
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'À l\'instant';
        if (minutes < 60) return `Il y a ${minutes} min`;
        if (hours < 24) return `Il y a ${hours}h`;
        if (days < 7) return `Il y a ${days}j`;
        return timestamp.toLocaleDateString('fr-FR');
    };

    if (!isAuthenticated) return null;

    return (
        <div className="notification-center">
            {/* Bouton de notification */}
            <button
                className="notification-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Panneau de notifications */}
            {isOpen && (
                <div className="notification-panel">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        <div className="notification-actions">
                            {unreadCount > 0 && (
                                <button
                                    className="btn-link"
                                    onClick={markAllAsRead}
                                >
                                    Tout marquer comme lu
                                </button>
                            )}
                            <button
                                className="btn-icon"
                                onClick={() => setIsOpen(false)}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="empty-notifications">
                                <Bell size={32} className="text-gray-400" />
                                <p>Aucune notification</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="notification-icon">
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    <div className="notification-content">
                                        <div className="notification-title">
                                            {notification.title}
                                        </div>
                                        <div className="notification-message">
                                            {notification.message}
                                        </div>
                                        <div className="notification-meta">
                                            <span className="notification-time">
                                                {formatTimestamp(notification.timestamp)}
                                            </span>
                                            {notification.action && (
                                                <button
                                                    className="btn-link"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.location.href = notification.action!.url;
                                                    }}
                                                >
                                                    {notification.action.label}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        className="btn-icon notification-remove"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeNotification(notification.id);
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="notification-footer">
                            <button
                                className="btn-link"
                                onClick={() => {
                                    // Naviguer vers la page des notifications
                                    window.location.href = '/dashboard/notifications';
                                }}
                            >
                                Voir toutes les notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
