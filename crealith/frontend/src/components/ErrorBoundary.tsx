import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/utils/logger';
import { Sentry } from '@/config/sentry';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    showDetails?: boolean;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    errorId: string;
}

/**
 * Error Boundary pour capturer et gérer les erreurs React
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: '',
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        // Génère un ID unique pour cette erreur
        const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return {
            hasError: true,
            error,
            errorId,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log l'erreur
        logger.error('ErrorBoundary caught an error:', error, errorInfo);

        // Mettre à jour l'état avec les détails de l'erreur
        this.setState({
            error,
            errorInfo,
        });

        // Appeler le callback personnalisé si fourni
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Envoyer l'erreur à un service de monitoring (ex: Sentry)
        this.reportError(error, errorInfo);
    }

    private reportError = (error: Error, errorInfo: ErrorInfo) => {
        // Ici, vous pourriez envoyer l'erreur à un service de monitoring
        // comme Sentry, LogRocket, ou votre propre service
        const errorReport = {
            errorId: this.state.errorId,
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
        };

        // Logger l'erreur
        logger.error('Error Report:', errorReport);

        // Envoyer vers Sentry en production
        if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
            Sentry.captureException(error, {
                contexts: {
                    react: errorInfo,
                    errorReport
                }
            });
        }
    };

    private handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: '',
        });
    };

    private handleGoHome = () => {
        window.location.href = '/';
    };

    private handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Si un fallback personnalisé est fourni, l'utiliser
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Interface d'erreur par défaut
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>

                        <div className="text-center">
                            <h1 className="text-xl font-semibold text-gray-900 mb-2">
                                Oups ! Quelque chose s'est mal passé
                            </h1>
                            <p className="text-gray-600 mb-6">
                                Une erreur inattendue s'est produite. Notre équipe a été notifiée.
                            </p>

                            {this.props.showDetails && this.state.error && (
                                <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                                        Détails de l'erreur :
                                    </h3>
                                    <p className="text-sm text-gray-700 mb-2">
                                        <strong>Message :</strong> {this.state.error.message}
                                    </p>
                                    <p className="text-sm text-gray-700 mb-2">
                                        <strong>ID d'erreur :</strong> {this.state.errorId}
                                    </p>
                                    {this.state.error.stack && (
                                        <details className="text-xs text-gray-600">
                                            <summary className="cursor-pointer font-medium">
                                                Stack trace
                                            </summary>
                                            <pre className="mt-2 whitespace-pre-wrap">
                                                {this.state.error.stack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            <div className="space-y-3">
                                <button
                                    onClick={this.handleRetry}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Réessayer
                                </button>

                                <button
                                    onClick={this.handleGoHome}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                                >
                                    <Home className="w-4 h-4 mr-2" />
                                    Retour à l'accueil
                                </button>

                                <button
                                    onClick={this.handleReload}
                                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Recharger la page
                                </button>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-500">
                                    Si le problème persiste, contactez notre support avec l'ID d'erreur :{' '}
                                    <code className="bg-gray-100 px-1 rounded">{this.state.errorId}</code>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Error Boundary spécialisé pour les pages
 */
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <ErrorBoundary
            showDetails={process.env.NODE_ENV === 'development'}
            onError={(error, errorInfo) => {
                // Log supplémentaire pour les erreurs de page
                logger.error('Page Error:', error, errorInfo);
            }}
        >
            {children}
        </ErrorBoundary>
    );
};

/**
 * Error Boundary spécialisé pour les composants
 */
export const ComponentErrorBoundary: React.FC<{
    children: ReactNode;
    fallback?: ReactNode;
}> = ({ children, fallback }) => {
    const defaultFallback = (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
            <div className="flex items-center">
                <Bug className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800 text-sm">
                    Ce composant a rencontré une erreur. Veuillez recharger la page.
                </p>
            </div>
        </div>
    );

    return (
        <ErrorBoundary
            fallback={fallback || defaultFallback}
            onError={(error, errorInfo) => {
                logger.error('Component Error:', error, errorInfo);
            }}
        >
            {children}
        </ErrorBoundary>
    );
};
