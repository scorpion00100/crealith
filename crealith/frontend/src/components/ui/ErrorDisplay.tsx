import React from 'react';
import { AlertTriangle, RefreshCw, X, Info, AlertCircle } from 'lucide-react';
import { ErrorType } from '@/hooks/useErrorHandler';

interface ErrorDisplayProps {
    error: {
        type: ErrorType;
        message: string;
        code?: string | number;
        details?: any;
        timestamp: string;
        correlationId?: string;
    };
    onRetry?: () => void;
    onDismiss?: () => void;
    showDetails?: boolean;
    variant?: 'inline' | 'modal' | 'banner';
    className?: string;
}

/**
 * Composant pour afficher les erreurs de manière cohérente
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    error,
    onRetry,
    onDismiss,
    showDetails = false,
    variant = 'inline',
    className = '',
}) => {
    const getErrorIcon = () => {
        switch (error.type) {
            case ErrorType.NETWORK:
                return <AlertCircle className="w-5 h-5 text-orange-500" />;
            case ErrorType.AUTHENTICATION:
                return <AlertTriangle className="w-5 h-5 text-red-500" />;
            case ErrorType.VALIDATION:
                return <Info className="w-5 h-5 text-yellow-500" />;
            case ErrorType.SERVER:
                return <AlertTriangle className="w-5 h-5 text-red-500" />;
            default:
                return <AlertTriangle className="w-5 h-5 text-red-500" />;
        }
    };

    const getErrorStyles = () => {
        switch (error.type) {
            case ErrorType.NETWORK:
                return {
                    container: 'bg-orange-50 border-orange-200',
                    text: 'text-orange-800',
                    icon: 'text-orange-500',
                };
            case ErrorType.AUTHENTICATION:
                return {
                    container: 'bg-red-50 border-red-200',
                    text: 'text-red-800',
                    icon: 'text-red-500',
                };
            case ErrorType.VALIDATION:
                return {
                    container: 'bg-yellow-50 border-yellow-200',
                    text: 'text-yellow-800',
                    icon: 'text-yellow-500',
                };
            case ErrorType.SERVER:
                return {
                    container: 'bg-red-50 border-red-200',
                    text: 'text-red-800',
                    icon: 'text-red-500',
                };
            default:
                return {
                    container: 'bg-gray-50 border-gray-200',
                    text: 'text-gray-800',
                    icon: 'text-gray-500',
                };
        }
    };

    const styles = getErrorStyles();

    const renderInline = () => (
        <div className={`border rounded-lg p-4 ${styles.container} ${className}`}>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    {getErrorIcon()}
                </div>
                <div className="ml-3 flex-1">
                    <h3 className={`text-sm font-medium ${styles.text}`}>
                        {error.message}
                    </h3>
                    {showDetails && (
                        <div className="mt-2 text-sm">
                            {error.code && (
                                <p className={`${styles.text} opacity-75`}>
                                    Code d'erreur: {error.code}
                                </p>
                            )}
                            {error.correlationId && (
                                <p className={`${styles.text} opacity-75`}>
                                    ID de référence: {error.correlationId}
                                </p>
                            )}
                            {error.details && (
                                <details className="mt-2">
                                    <summary className={`cursor-pointer text-sm ${styles.text} opacity-75`}>
                                        Détails techniques
                                    </summary>
                                    <pre className="mt-2 text-xs bg-white bg-opacity-50 p-2 rounded overflow-auto">
                                        {JSON.stringify(error.details, null, 2)}
                                    </pre>
                                </details>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded ${styles.text} bg-white bg-opacity-50 hover:bg-opacity-75 transition-colors`}
                        >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Réessayer
                        </button>
                    )}
                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${styles.text} hover:bg-white hover:bg-opacity-50 transition-colors`}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    const renderBanner = () => (
        <div className={`border-l-4 ${styles.container} p-4 ${className}`}>
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    {getErrorIcon()}
                </div>
                <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${styles.text}`}>
                        {error.message}
                    </p>
                    {showDetails && error.correlationId && (
                        <p className={`text-xs ${styles.text} opacity-75 mt-1`}>
                            ID: {error.correlationId}
                        </p>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className={`text-xs font-medium ${styles.text} hover:underline`}
                        >
                            Réessayer
                        </button>
                    )}
                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className={`${styles.text} hover:opacity-75`}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    const renderModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <div className="flex-shrink-0">
                            {getErrorIcon()}
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-medium text-gray-900">
                                Erreur
                            </h3>
                        </div>
                    </div>

                    <p className="text-gray-700 mb-4">
                        {error.message}
                    </p>

                    {showDetails && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            {error.code && (
                                <p className="text-sm text-gray-600 mb-1">
                                    <strong>Code:</strong> {error.code}
                                </p>
                            )}
                            {error.correlationId && (
                                <p className="text-sm text-gray-600 mb-1">
                                    <strong>ID de référence:</strong> {error.correlationId}
                                </p>
                            )}
                            {error.details && (
                                <details className="text-sm">
                                    <summary className="cursor-pointer text-gray-600 font-medium">
                                        Détails techniques
                                    </summary>
                                    <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                                        {JSON.stringify(error.details, null, 2)}
                                    </pre>
                                </details>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end space-x-3">
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Réessayer
                            </button>
                        )}
                        {onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                            >
                                Fermer
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    switch (variant) {
        case 'banner':
            return renderBanner();
        case 'modal':
            return renderModal();
        case 'inline':
        default:
            return renderInline();
    }
};

/**
 * Composant pour afficher une liste d'erreurs
 */
export const ErrorList: React.FC<{
    errors: Array<ErrorDisplayProps['error']>;
    onRetry?: (index: number) => void;
    onDismiss?: (index: number) => void;
    showDetails?: boolean;
    variant?: ErrorDisplayProps['variant'];
    className?: string;
}> = ({ errors, onRetry, onDismiss, showDetails, variant, className }) => {
    if (errors.length === 0) return null;

    return (
        <div className={`space-y-3 ${className}`}>
            {errors.map((error, index) => (
                <ErrorDisplay
                    key={error.correlationId || index}
                    error={error}
                    onRetry={onRetry ? () => onRetry(index) : undefined}
                    onDismiss={onDismiss ? () => onDismiss(index) : undefined}
                    showDetails={showDetails}
                    variant={variant}
                />
            ))}
        </div>
    );
};
