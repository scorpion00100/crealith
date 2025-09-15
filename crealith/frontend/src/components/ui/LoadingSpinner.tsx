import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    text?: string;
    fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    className = '',
    text,
    fullScreen = false,
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12',
    };

    const spinner = (
        <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
            <Loader2 className={`animate-spin text-primary-500 ${sizeClasses[size]}`} />
            {text && (
                <p className="text-sm text-gray-400 font-medium">{text}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
                    {spinner}
                </div>
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;
