import React from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    variant?: 'default' | 'outlined' | 'filled';
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    variant = 'default',
    className,
    id,
    ...props
}) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const variantClasses = {
        default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
        outlined: 'border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500',
        filled: 'bg-gray-100 border-0 focus:bg-white focus:ring-2 focus:ring-blue-500'
    };

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    {label}
                </label>
            )}

            <input
                id={inputId}
                className={cn(
                    'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 transition-colors',
                    variantClasses[variant],
                    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                    className
                )}
                {...props}
            />

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}

            {helperText && !error && (
                <p className="mt-1 text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    );
};

export default Input;