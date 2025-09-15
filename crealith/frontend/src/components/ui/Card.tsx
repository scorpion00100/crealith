import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    variant?: 'default' | 'outlined' | 'elevated';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    padding = 'md',
    className,
    ...props
}) => {
    const baseClasses = 'rounded-xl transition-all duration-300';

    const variantClasses = {
        default: 'bg-gray-800 border border-gray-700',
        outlined: 'bg-transparent border-2 border-gray-700',
        elevated: 'bg-gray-800 border border-gray-700 shadow-lg hover:shadow-xl'
    };

    const paddingClasses = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    };

    return (
        <div
            className={cn(
                baseClasses,
                variantClasses[variant],
                paddingClasses[padding],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;