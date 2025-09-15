import React from 'react';
import { IKImage } from 'imagekitio-react';
import { IMAGEKIT_CONFIG, IMAGE_TRANSFORMATIONS, buildImageUrl } from '../../config/imagekit';

interface ImageDisplayProps {
    src: string;
    alt: string;
    className?: string;
    transformation?: keyof typeof IMAGE_TRANSFORMATIONS | Record<string, any>;
    loading?: 'lazy' | 'eager';
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    blur?: number;
    placeholder?: string;
    onLoad?: () => void;
    onError?: () => void;
    fallbackSrc?: string;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({
    src,
    alt,
    className = '',
    transformation,
    loading = 'lazy',
    quality = 80,
    format = 'auto',
    blur,
    placeholder,
    onLoad,
    onError,
    fallbackSrc,
}) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageLoaded, setImageLoaded] = React.useState(false);

    // Déterminer les transformations à appliquer
    const getTransformations = () => {
        if (!transformation) return undefined;

        if (typeof transformation === 'string') {
            return IMAGE_TRANSFORMATIONS[transformation];
        }

        return transformation;
    };

    const handleLoad = () => {
        setImageLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        setImageError(true);
        onError?.();
    };

    // Si l'image a échoué et qu'on a un fallback, l'utiliser
    if (imageError && fallbackSrc) {
        return (
            <img
                src={fallbackSrc}
                alt={alt}
                className={className}
                loading={loading}
                onLoad={handleLoad}
                onError={handleError}
            />
        );
    }

    // Si l'image a échoué et qu'on n'a pas de fallback, afficher un placeholder
    if (imageError) {
        return (
            <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        );
    }

    // Construire les transformations finales
    const finalTransformations = {
        ...getTransformations(),
        quality,
        format,
        ...(blur && { blur }),
    };

    return (
        <div className={`relative ${className}`}>
            {/* Placeholder pendant le chargement */}
            {!imageLoaded && placeholder && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <img src={placeholder} alt="Loading..." className="w-full h-full object-cover opacity-50" />
                </div>
            )}

            {/* Image principale */}
            <IKImage
                urlEndpoint={IMAGEKIT_CONFIG.urlEndpoint}
                src={src}
                alt={alt}
                transformation={[finalTransformations]}
                loading={loading}
                onLoad={handleLoad}
                onError={handleError}
                className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
        </div>
    );
};

// Composant spécialisé pour les avatars
export const AvatarImage: React.FC<Omit<ImageDisplayProps, 'transformation'> & { size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({
    size = 'md',
    className = '',
    ...props
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24',
    };

    return (
        <ImageDisplay
            {...props}
            transformation="avatar"
            className={`${sizeClasses[size]} rounded-full ${className}`}
        />
    );
};

// Composant spécialisé pour les images de produits
export const ProductImage: React.FC<Omit<ImageDisplayProps, 'transformation'> & {
    variant?: 'thumbnail' | 'medium' | 'large' | 'full'
}> = ({
    variant = 'medium',
    className = '',
    ...props
}) => {
        const variantClasses = {
            thumbnail: 'w-20 h-20',
            medium: 'w-48 h-48',
            large: 'w-64 h-64',
            full: 'w-full h-64',
        };

        const transformation = variant === 'full' ? 'large' : variant;

        return (
            <ImageDisplay
                {...props}
                transformation={transformation}
                className={`object-cover rounded-lg ${variantClasses[variant]} ${className}`}
            />
        );
    };

// Composant pour les galeries d'images
export const ImageGallery: React.FC<{
    images: string[];
    alt: string;
    className?: string;
    onImageClick?: (index: number) => void;
}> = ({ images, alt, className = '', onImageClick }) => {
    if (!images || images.length === 0) {
        return (
            <div className={`bg-gray-200 flex items-center justify-center rounded-lg ${className}`}>
                <p className="text-gray-500">Aucune image disponible</p>
            </div>
        );
    }

    return (
        <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
            {images.map((image, index) => (
                <div
                    key={index}
                    className="relative cursor-pointer group"
                    onClick={() => onImageClick?.(index)}
                >
                    <ProductImage
                        src={image}
                        alt={`${alt} ${index + 1}`}
                        variant="thumbnail"
                        className="transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg" />
                </div>
            ))}
        </div>
    );
};

export default ImageDisplay;
