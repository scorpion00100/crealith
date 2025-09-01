import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { addNotification } from '@/store/slices/notificationSlice';
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
            id: Date.now().toString(),
            type: notification.type,
            title: notification.title,
            message: notification.message,
            read: false,
            createdAt: new Date().toISOString()
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
                return <CheckCircle size={20} className="text-emerald-500" />;
            case 'error':
                return <XCircle size={20} className="text-red-500" />;
            case 'warning':
                return <AlertCircle size={20} className="text-amber-500" />;
            case 'info':
                return <Info size={20} className="text-slate-600" />;
            default:
                return <Info size={20} className="text-slate-500" />;
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
        <div className="relative">
            {/* Bouton de notification */}
            <button
                className="relative p-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all duration-300 group"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <Bell className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-6 w-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Panneau de notifications */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 py-3 z-50 max-h-96 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900">Notifications</h3>
                            <div className="flex items-center space-x-3">
                                {unreadCount > 0 && (
                                    <button
                                        className="text-xs text-slate-600 hover:text-slate-900 transition-colors duration-300 font-semibold"
                                        onClick={markAllAsRead}
                                    >
                                        Tout marquer comme lu
                                    </button>
                                )}
                                <button
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-300"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-64">
                        {notifications.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                    <Bell size={32} className="text-slate-400" />
                                </div>
                                <p className="text-slate-500 font-semibold">Aucune notification</p>
                                <p className="text-sm text-slate-400 mt-1 font-medium">Vous serez notifié des nouvelles activités</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`px-6 py-4 hover:bg-slate-50 transition-all duration-300 cursor-pointer ${!notification.read ? 'bg-gradient-to-r from-slate-50 to-slate-100' : ''
                                            }`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-black text-slate-900 mb-1">
                                                    {notification.title}
                                                </div>
                                                <div className="text-sm text-slate-600 mb-3 leading-relaxed font-medium">
                                                    {notification.message}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-slate-500 font-semibold">
                                                        {formatTimestamp(notification.timestamp)}
                                                    </span>
                                                    {notification.action && (
                                                        <button
                                                            className="text-xs text-slate-600 hover:text-slate-900 font-semibold transition-colors duration-300"
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
                                                className="flex-shrink-0 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-300"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeNotification(notification.id);
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="px-6 py-4 border-t border-slate-100">
                            <button
                                className="w-full text-sm text-slate-600 hover:text-slate-900 font-semibold transition-colors duration-300"
                                onClick={() => {
                                    window.location.href = '/dashboard/notifications';
                                }}
                            >
                                Voir toutes les notifications
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Fermer le panneau en cliquant à l'extérieur */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};
