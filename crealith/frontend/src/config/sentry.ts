import * as Sentry from "@sentry/react";

/**
 * Configuration Sentry pour le monitoring des erreurs en production
 * 
 * Pour activer Sentry, définir VITE_SENTRY_DSN dans .env.production
 */
export const initSentry = () => {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE;
  const isProduction = environment === 'production';

  // N'initialiser Sentry qu'en production ET si DSN est défini
  if (isProduction && sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment,
      
      // Performance Monitoring
      tracesSampleRate: 1.0, // 100% des transactions en production
      
      // Session Replay
      integrations: [
        new Sentry.BrowserTracing({
          // Tracer les navigations
          routingInstrumentation: Sentry.reactRouterV6Instrumentation(
            React.useEffect,
            useLocation,
            useNavigationType,
            createRoutesFromChildren,
            matchRoutes
          ),
        }),
        new Sentry.Replay({
          // Capturer 10% des sessions normales
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% des sessions
      replaysOnErrorSampleRate: 1.0, // 100% des sessions avec erreur
      
      // Filtrer les erreurs non pertinentes
      beforeSend(event, hint) {
        // Ignorer les erreurs de réseau
        if (event.exception?.values?.[0]?.value?.includes('Network Error')) {
          return null;
        }
        
        // Ignorer les erreurs d'extension navigateur
        if (event.exception?.values?.[0]?.stacktrace?.frames?.some(
          frame => frame.filename?.includes('extension://')
        )) {
          return null;
        }
        
        return event;
      },
    });
    
    console.log('✅ Sentry initialized in production');
  } else if (!isProduction) {
    console.log('ℹ️ Sentry disabled in development');
  } else {
    console.warn('⚠️ Sentry DSN not configured');
  }
};

// Re-exporter Sentry pour usage dans l'app
export { Sentry };

// Importer les hooks React Router (à ajouter si besoin)
import { useEffect } from 'react';
import { 
  useLocation, 
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes
} from 'react-router-dom';
import React from 'react';

