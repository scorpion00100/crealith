import React from 'react';
import { useAppSelector } from '@/store';
import { LoadingSpinner } from './LoadingSpinner';

export const GlobalLoadingOverlay: React.FC = () => {
    const isLoading = useAppSelector(state => state.ui.loading);
    if (!isLoading) return null;
    return (
        <LoadingSpinner fullScreen text="Chargement en cours..." />
    );
};

export default GlobalLoadingOverlay;


