import React from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { removeNotification } from '@/store/slices/notificationSlice';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const NotificationCenter: React.FC = () => {
    const dispatch = useAppDispatch();
    const { notifications } = useAppSelector(state => state.notifications);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'info':
            default:
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'info':
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`max-w-sm w-full ${getBgColor(notification.type)} border rounded-lg p-4 shadow-lg`}
                >
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            {getIcon(notification.type)}
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                                {notification.message}
                            </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                            <button
                                onClick={() => dispatch(removeNotification(notification.id))}
                                className="inline-flex text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationCenter;