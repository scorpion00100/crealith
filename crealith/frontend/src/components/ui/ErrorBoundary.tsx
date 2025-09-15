import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error,
            errorInfo
        });

        // Log l'erreur pour le monitoring
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Ici vous pourriez envoyer l'erreur à un service de monitoring
        // comme Sentry, LogRocket, etc.
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
                    <div className="max-w-md w-full text-center">
                        <div className="mb-8">
                            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-12 h-12 text-red-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-100 mb-4">
                                Oups ! Quelque chose s'est mal passé
                            </h1>
                            <p className="text-gray-400 mb-8">
                                Une erreur inattendue s'est produite. Notre équipe a été notifiée
                                et travaille à résoudre le problème.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={this.handleRetry}
                                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold px-6 py-3 rounded-2xl shadow-premium hover:shadow-2xl transition-all duration-300 hover:from-primary-600 hover:to-primary-700 transform hover:scale-105 flex items-center justify-center space-x-2"
                            >
                                <RefreshCw className="w-5 h-5" />
                                <span>Réessayer</span>
                            </button>

                            <button
                                onClick={this.handleGoHome}
                                className="w-full bg-gray-800 text-gray-300 font-semibold px-6 py-3 rounded-2xl border border-gray-700 hover:bg-gray-700 transition-colors duration-300 flex items-center justify-center space-x-2"
                            >
                                <Home className="w-5 h-5" />
                                <span>Retour à l'accueil</span>
                            </button>
                        </div>

                        {/* Détails de l'erreur en mode développement */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-8 text-left">
                                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400">
                                    Détails de l'erreur (développement)
                                </summary>
                                <div className="mt-4 p-4 bg-gray-800 rounded-xl border border-gray-700">
                                    <pre className="text-xs text-red-400 overflow-auto">
                                        {this.state.error.toString()}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Hook pour utiliser l'ErrorBoundary dans les composants fonctionnels
export const useErrorHandler = () => {
    const handleError = (error: Error, errorInfo?: string) => {
        console.error('Error caught by useErrorHandler:', error, errorInfo);

        // Ici vous pourriez envoyer l'erreur à un service de monitoring
        // ou dispatcher une action Redux pour afficher une notification
    };

    return { handleError };
};

// Composant pour afficher les erreurs de manière élégante
interface ErrorDisplayProps {
    error?: Error | string;
    title?: string;
    description?: string;
    onRetry?: () => void;
    showRetry?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    error,
    title = "Une erreur s'est produite",
    description = "Quelque chose s'est mal passé. Veuillez réessayer.",
    onRetry,
    showRetry = true
}) => {
    const errorMessage = error instanceof Error ? error.message : error;

    return (
        <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>

            <h3 className="text-xl font-bold text-gray-100 mb-4">{title}</h3>
            <p className="text-gray-400 mb-6">{description}</p>

            {errorMessage && (
                <div className="mb-6 p-4 bg-gray-800 rounded-xl border border-gray-700">
                    <p className="text-sm text-red-400">{errorMessage}</p>
                </div>
            )}

            {showRetry && onRetry && (
                <button
                    onClick={onRetry}
                    className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 flex items-center space-x-2 mx-auto"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Réessayer</span>
                </button>
            )}
        </div>
    );
};

// Hook pour gérer les erreurs async
export const useAsyncError = () => {
    const handleAsyncError = (error: unknown, context?: string) => {
        console.error(`Async error${context ? ` in ${context}` : ''}:`, error);

        // Ici vous pourriez dispatcher une action Redux pour afficher une notification
        // ou envoyer l'erreur à un service de monitoring
    };

    return { handleAsyncError };
};
