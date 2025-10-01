import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProfilePage } from '@/pages/ProfilePage';

export const SellerProfilePage: React.FC = () => {
    const { user } = useAuth();
    if (user?.role !== 'SELLER') return null;
    return <ProfilePage />;
};

export default SellerProfilePage;

