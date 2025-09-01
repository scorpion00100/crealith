import React from 'react';
import { cn } from '@/utils/cn';
import { Search, Mail, Lock } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    variant?: 'default' | 'filled' | 'outline';
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    variant = 'default',
    className,
    id,
    ...props
}) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const baseClasses = 'w-full rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        default: 'bg-background-100 border border-earth-200 text-earth-700 placeholder-earth-400 focus:ring-primary-500 focus:border-transparent',
        filled: 'bg-earth-50 border border-earth-200 text-earth-700 placeholder-earth-400 focus:ring-primary-500 focus:border-transparent focus:bg-white',
        outline: 'bg-transparent border-2 border-earth-200 text-earth-700 placeholder-earth-400 focus:ring-primary-500 focus:border-primary-500'
    };

    const errorClasses = error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : '';

    const paddingClasses = leftIcon || rightIcon ? 'pl-12 pr-12' : 'px-4';
    const sizeClasses = 'py-3';

    return (
        <div className="space-y-2">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-earth-700">
                    {label}
                </label>
            )}

            <div className="relative">
                {leftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <div className="text-earth-400">
                            {leftIcon}
                        </div>
                    </div>
                )}

                <input
                    id={inputId}
                    className={cn(
                        baseClasses,
                        variantClasses[variant],
                        errorClasses,
                        paddingClasses,
                        sizeClasses,
                        className
                    )}
                    {...props}
                />

                {rightIcon && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <div className="text-earth-400">
                            {rightIcon}
                        </div>
                    </div>
                )}
            </div>

            {(error || helperText) && (
                <div className="flex items-center space-x-2">
                    {error && (
                        <p className="text-sm text-error-600 flex items-center">
                            <span className="w-1 h-1 bg-error-500 rounded-full mr-2"></span>
                            {error}
                        </p>
                    )}
                    {helperText && !error && (
                        <p className="text-sm text-earth-500">
                            {helperText}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

// Composants spécialisés
export const SearchInput: React.FC<InputProps> = (props) => (
    <Input
        variant="filled"
        leftIcon={<Search className="w-4 h-4" />}
        placeholder="Rechercher..."
        {...props}
    />
);

export const EmailInput: React.FC<InputProps> = (props) => (
    <Input
        type="email"
        leftIcon={<Mail className="w-4 h-4" />}
        placeholder="votre@email.com"
        {...props}
    />
);

export const PasswordInput: React.FC<InputProps> = (props) => (
    <Input
        type="password"
        leftIcon={<Lock className="w-4 h-4" />}
        placeholder="••••••••"
        {...props}
    />
);
