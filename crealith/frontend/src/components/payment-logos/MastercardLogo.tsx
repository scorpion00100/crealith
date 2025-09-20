import React from 'react';

interface MastercardLogoProps {
    className?: string;
    width?: number;
    height?: number;
}

export const MastercardLogo: React.FC<MastercardLogoProps> = ({
    className = '',
    width = 40,
    height = 24
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 80 50"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect width="80" height="50" rx="8" fill="white" />
            {/* Cercles Mastercard classiques */}
            <circle cx="32" cy="25" r="14" fill="#EB001B" />
            <circle cx="48" cy="25" r="14" fill="#F79E1B" />
            {/* Zone d'intersection */}
            <path
                d="M38 11c3.9 0 7.5 2.1 9.5 5.5-1.2 1.8-3 3.2-5.1 3.9-2.1-.7-3.9-2.1-5.1-3.9C35.5 13.1 36.7 11 38 11zm0 28c-3.9 0-7.5-2.1-9.5-5.5 1.2-1.8 3-3.2 5.1-3.9 2.1.7 3.9 2.1 5.1 3.9C40.5 35.9 39.3 39 38 39z"
                fill="#FF5F00"
            />
        </svg>
    );
};
