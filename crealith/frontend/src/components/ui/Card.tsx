import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'interactive' | 'glass';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
    variant = 'default',
    padding = 'md',
    className,
    children,
    ...props
}) => {
    const baseClasses = 'rounded-2xl transition-all duration-300';

    const variantClasses = {
        default: 'bg-white border border-earth-200 shadow-soft hover:shadow-medium',
        elevated: 'bg-white border border-earth-200 shadow-medium hover:shadow-large transform hover:-translate-y-1',
        interactive: 'bg-white border border-earth-200 shadow-soft hover:shadow-medium hover:border-primary-300 cursor-pointer',
        glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-soft'
    };

    const paddingClasses = {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8'
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

// Composants spécialisés pour les cas d'usage courants
export const ProductCard: React.FC<CardProps> = (props) => (
    <Card variant="interactive" padding="none" {...props} />
);

export const DashboardCard: React.FC<CardProps> = (props) => (
    <Card variant="elevated" padding="lg" {...props} />
);

export const StatsCard: React.FC<CardProps> = (props) => (
    <Card variant="default" padding="md" {...props} />
);
