import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SettingsPage } from '@/pages/SettingsPage';

export const SellerSettingsPage: React.FC = () => {
    const { user } = useAuth();
    if (user?.role !== 'SELLER') return null;
    return <SettingsPage />;
};

export default SellerSettingsPage;

