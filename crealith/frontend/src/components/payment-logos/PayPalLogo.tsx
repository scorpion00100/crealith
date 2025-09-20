import React from 'react';

interface PayPalLogoProps {
    className?: string;
    width?: number;
    height?: number;
}

export const PayPalLogo: React.FC<PayPalLogoProps> = ({
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
            <rect width="80" height="50" rx="8" fill="#0070BA" />
            <g fill="white" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold">
                {/* PayPal */}
                <text x="15" y="32" fontSize="18" fontWeight="700">PayPal</text>
            </g>
        </svg>
    );
};
