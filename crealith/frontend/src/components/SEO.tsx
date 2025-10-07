import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    image?: string;
    type?: 'website' | 'product' | 'article';
    url?: string;
    keywords?: string[];
}

/**
 * Composant SEO réutilisable avec React Helmet
 * Gère les meta tags pour le SEO et les réseaux sociaux
 */
export const SEO: React.FC<SEOProps> = ({
    title,
    description,
    image = 'https://crealith.com/og-image.jpg',
    type = 'website',
    url,
    keywords = []
}) => {
    const fullTitle = `${title} | Crealith - Marketplace Créative`;
    const siteUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    return (
        <Helmet>
            {/* Titre de la page */}
            <title>{fullTitle}</title>

            {/* Meta tags standards */}
            <meta name="description" content={description} />
            {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}

            {/* Open Graph (Facebook, LinkedIn) */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:type" content={type} />
            <meta property="og:url" content={siteUrl} />
            <meta property="og:site_name" content="Crealith" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Liens canoniques */}
            {url && <link rel="canonical" href={url} />}
        </Helmet>
    );
};

export default SEO;

