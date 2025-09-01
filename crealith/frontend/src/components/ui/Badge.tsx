import React from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'primary' | 'secondary' | 'accent' | 'warm' | 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
    variant = 'primary',
    size = 'md',
    className,
    children,
    ...props
}) => {
    const baseClasses = 'inline-flex items-center font-medium rounded-full';

    const variantClasses = {
        primary: 'bg-primary-100 text-primary-800 border border-primary-200',
        secondary: 'bg-secondary-100 text-secondary-800 border border-secondary-200',
        accent: 'bg-accent-100 text-accent-800 border border-accent-200',
        warm: 'bg-warm-100 text-warm-800 border border-warm-200',
        success: 'bg-success-100 text-success-800 border border-success-200',
        warning: 'bg-warning-100 text-warning-800 border border-warning-200',
        error: 'bg-error-100 text-error-800 border border-error-200',
        info: 'bg-earth-100 text-earth-800 border border-earth-200'
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm'
    };

    return (
        <span
            className={cn(
                baseClasses,
                variantClasses[variant],
                sizeClasses[size],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};

// Composants spécialisés pour les statuts
export const StatusBadge: React.FC<BadgeProps & { status?: string }> = ({
    status,
    variant,
    children,
    ...props
}) => {
    const getVariantFromStatus = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'paid':
            case 'completed':
                return 'success';
            case 'pending':
            case 'processing':
                return 'warning';
            case 'cancelled':
            case 'failed':
                return 'error';
            case 'draft':
                return 'info';
            default:
                return variant || 'primary';
        }
    };

    return (
        <Badge variant={getVariantFromStatus(status)} {...props}>
            {children || status}
        </Badge>
    );
};
