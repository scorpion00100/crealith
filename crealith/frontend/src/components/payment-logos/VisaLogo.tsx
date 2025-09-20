import React from 'react';

interface VisaLogoProps {
    className?: string;
    width?: number;
    height?: number;
}

export const VisaLogo: React.FC<VisaLogoProps> = ({
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
            <rect width="80" height="50" rx="8" fill="#1A1F71" />
            <g fill="white" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold">
                {/* VISA */}
                <text x="12" y="32" fontSize="20" fontWeight="700">VISA</text>
            </g>
        </svg>
    );
};
