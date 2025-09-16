import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Lock,
    Bell,
    Shield,
    CreditCard,
    Globe,
    Save,
    Eye,
    EyeOff
} from 'lucide-react';
import { cn } from '@/utils/cn';

export const SettingsPage: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const dispatch = useAppDispatch();

    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'billing'>('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // État du formulaire de profil
    const [profileData, setProfileData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        location: user?.location || 'Toulouse, France',
        bio: user?.bio || '',
        website: user?.website || '',
        company: user?.company || ''
    });

    // État du formulaire de sécurité
    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: false
    });

    // État des notifications
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        orderUpdates: true,
        newMessages: true,
        weeklyDigest: true
    });

    // État de la facturation
    const [billingData, setBillingData] = useState({
        paymentMethod: 'card',
        billingAddress: {
            street: '',
            city: 'Toulouse',
            postalCode: '',
            country: 'France'
        },
        taxId: '',
        vatNumber: ''
    });

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Simulation de mise à jour du profil
            await new Promise(resolve => setTimeout(resolve, 1000));

            dispatch(addNotification({
                type: 'success',
                message: 'Profil mis à jour avec succès',
                duration: 3000
            }));
        } catch (error) {
            dispatch(addNotification({
                type: 'error',
                message: 'Erreur lors de la mise à jour du profil',
                duration: 4000
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSecuritySubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (securityData.newPassword !== securityData.confirmPassword) {
            dispatch(addNotification({
                type: 'error',
                message: 'Les mots de passe ne correspondent pas',
                duration: 4000
            }));
            return;
        }

        setIsLoading(true);

        try {
            // Simulation de changement de mot de passe
            await new Promise(resolve => setTimeout(resolve, 1000));

            dispatch(addNotification({
                type: 'success',
                message: 'Mot de passe mis à jour avec succès',
                duration: 3000
            }));

            setSecurityData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
                twoFactorEnabled: securityData.twoFactorEnabled
            });
        } catch (error) {
            dispatch(addNotification({
                type: 'error',
                message: 'Erreur lors du changement de mot de passe',
                duration: 4000
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleNotificationsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Simulation de sauvegarde des préférences
            await new Promise(resolve => setTimeout(resolve, 1000));

            dispatch(addNotification({
                type: 'success',
                message: 'Préférences de notification sauvegardées',
                duration: 3000
            }));
        } catch (error) {
            dispatch(addNotification({
                type: 'error',
                message: 'Erreur lors de la sauvegarde',
                duration: 4000
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleBillingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Simulation de sauvegarde des informations de facturation
            await new Promise(resolve => setTimeout(resolve, 1000));

            dispatch(addNotification({
                type: 'success',
                message: 'Informations de facturation sauvegardées',
                duration: 3000
            }));
        } catch (error) {
            dispatch(addNotification({
                type: 'error',
                message: 'Erreur lors de la sauvegarde',
                duration: 4000
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profil', icon: User },
        { id: 'security', label: 'Sécurité', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'billing', label: 'Facturation', icon: CreditCard }
    ];

    return (
        <div className="min-h-screen bg-background-900">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-100 mb-2">Paramètres</h1>
                    <p className="text-text-400">Gérez vos informations personnelles et préférences</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-8 bg-background-800 p-1 rounded-2xl w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200',
                                activeTab === tab.id
                                    ? 'bg-primary-500 text-white'
                                    : 'text-text-400 hover:text-text-200 hover:bg-background-700'
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-background-800 rounded-2xl border border-background-700 p-6">
                    {/* Profil Tab */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-text-200 mb-2">
                                        Prénom
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.firstName}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                                        className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:border-primary-500 focus:outline-none transition-colors"
                                        placeholder="Votre prénom"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-200 mb-2">
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.lastName}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                                        className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:border-primary-500 focus:outline-none transition-colors"
                                        placeholder="Votre nom"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-text-200 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:border-primary-500 focus:outline-none transition-colors"
                                        placeholder="votre@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-200 mb-2">
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:border-primary-500 focus:outline-none transition-colors"
                                        placeholder="+33 6 09 40 93 59"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-200 mb-2">
                                    Localisation
                                </label>
                                <input
                                    type="text"
                                    value={profileData.location}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                                    className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:border-primary-500 focus:outline-none transition-colors"
                                    placeholder="Toulouse, France"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-200 mb-2">
                                    Bio
                                </label>
                                <textarea
                                    value={profileData.bio}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:border-primary-500 focus:outline-none transition-colors resize-none"
                                    placeholder="Parlez-nous de vous..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-text-200 mb-2">
                                        Site web
                                    </label>
                                    <input
                                        type="url"
                                        value={profileData.website}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                                        className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:border-primary-500 focus:outline-none transition-colors"
                                        placeholder="https://votre-site.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-200 mb-2">
                                        Entreprise
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.company}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                                        className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:border-primary-500 focus:outline-none transition-colors"
                                        placeholder="Nom de votre entreprise"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                            </button>
                        </form>
                    )}

                    {/* Sécurité Tab */}
                    {activeTab === 'security' && (
                        <form onSubmit={handleSecuritySubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-text-200 mb-2">
                                    Mot de passe actuel
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        value={securityData.currentPassword}
                                        onChange={(e) => setSecurityData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:border-primary-500 focus:outline-none transition-colors pr-12"
                                        placeholder="Votre mot de passe actuel"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-400 hover:text-text-200"
                                    >
                                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-200 mb-2">
                                    Nouveau mot de passe
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={securityData.newPassword}
                                        onChange={(e) => setSecurityData(prev => ({ ...prev, newPassword: e.target.value }))}
                                        className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:border-primary-500 focus:outline-none transition-colors pr-12"
                                        placeholder="Nouveau mot de passe"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-400 hover:text-text-200"
                                    >
                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-200 mb-2">
                                    Confirmer le nouveau mot de passe
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={securityData.confirmPassword}
                                        onChange={(e) => setSecurityData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:border-primary-500 focus:outline-none transition-colors pr-12"
                                        placeholder="Confirmer le nouveau mot de passe"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-400 hover:text-text-200"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-background-700 rounded-xl">
                                <div>
                                    <h3 className="font-medium text-text-100">Authentification à deux facteurs</h3>
                                    <p className="text-sm text-text-400">Ajoutez une couche de sécurité supplémentaire</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSecurityData(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                                    className={cn(
                                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                                        securityData.twoFactorEnabled ? 'bg-primary-500' : 'bg-background-600'
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                                            securityData.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                                        )}
                                    />
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                            >
                                <Lock className="w-4 h-4" />
                                {isLoading ? 'Mise à jour...' : 'Mettre à jour la sécurité'}
                            </button>
                        </form>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <form onSubmit={handleNotificationsSubmit} className="space-y-6">
                            <div className="space-y-4">
                                {[
                                    { key: 'emailNotifications', label: 'Notifications par email', description: 'Recevez des emails pour les mises à jour importantes' },
                                    { key: 'pushNotifications', label: 'Notifications push', description: 'Recevez des notifications dans votre navigateur' },
                                    { key: 'marketingEmails', label: 'Emails marketing', description: 'Recevez nos newsletters et offres spéciales' },
                                    { key: 'orderUpdates', label: 'Mises à jour de commandes', description: 'Notifications sur le statut de vos commandes' },
                                    { key: 'newMessages', label: 'Nouveaux messages', description: 'Alertes pour les nouveaux messages' },
                                    { key: 'weeklyDigest', label: 'Résumé hebdomadaire', description: 'Recevez un résumé de votre activité' }
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-4 bg-background-700 rounded-xl">
                                        <div>
                                            <h3 className="font-medium text-text-100">{item.label}</h3>
                                            <p className="text-sm text-text-400">{item.description}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifications] }))}
                                            className={cn(
                                                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                                                notifications[item.key as keyof typeof notifications] ? 'bg-primary-500' : 'bg-background-600'
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                                                    notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                                                )}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                            >
                                <Bell className="w-4 h-4" />
                                {isLoading ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
                            </button>
                        </form>
                    )}

                    {/* Facturation Tab */}
                    {activeTab === 'billing' && (
                        <form onSubmit={handleBillingSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-text-200 mb-2">
                                    Méthode de paiement
                                </label>
                                <select
                                    value={billingData.paymentMethod}
                                    onChange={(e) => setBillingData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                    className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:border-primary-500 focus:outline-none transition-colors"
                                >
                                    <option value="card">Carte bancaire</option>
                                    <option value="paypal">PayPal</option>
                                    <option value="sepa">Virement SEPA</option>
                                </select>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-text-100 mb-4">Adresse de facturation</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-text-200 mb-2">
                                            Adresse
                                        </label>
                                        <input
                                            type="text"
                                            value={billingData.billingAddress.street}
                                            onChange={(e) => setBillingData(prev => ({
                                                ...prev,
                                                billingAddress: { ...prev.billingAddress, street: e.target.value }
                                            }))}
                                            className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:border-primary-500 focus:outline-none transition-colors"
                                            placeholder="123 Rue de la Paix"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-200 mb-2">
                                            Ville
                                        </label>
                                        <input
                                            type="text"
                                            value={billingData.billingAddress.city}
                                            onChange={(e) => setBillingData(prev => ({
                                                ...prev,
                                                billingAddress: { ...prev.billingAddress, city: e.target.value }
                                            }))}
                                            className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:border-primary-500 focus:outline-none transition-colors"
                                            placeholder="Toulouse"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-200 mb-2">
                                            Code postal
                                        </label>
                                        <input
                                            type="text"
                                            value={billingData.billingAddress.postalCode}
                                            onChange={(e) => setBillingData(prev => ({
                                                ...prev,
                                                billingAddress: { ...prev.billingAddress, postalCode: e.target.value }
                                            }))}
                                            className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:border-primary-500 focus:outline-none transition-colors"
                                            placeholder="31000"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-text-200 mb-2">
                                        Numéro de TVA (optionnel)
                                    </label>
                                    <input
                                        type="text"
                                        value={billingData.vatNumber}
                                        onChange={(e) => setBillingData(prev => ({ ...prev, vatNumber: e.target.value }))}
                                        className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:border-primary-500 focus:outline-none transition-colors"
                                        placeholder="FR12345678901"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-200 mb-2">
                                        ID fiscal (optionnel)
                                    </label>
                                    <input
                                        type="text"
                                        value={billingData.taxId}
                                        onChange={(e) => setBillingData(prev => ({ ...prev, taxId: e.target.value }))}
                                        className="w-full px-4 py-3 bg-background-700 border border-background-600 rounded-xl text-text-100 focus:border-primary-500 focus:outline-none transition-colors"
                                        placeholder="123456789"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                            >
                                <CreditCard className="w-4 h-4" />
                                {isLoading ? 'Sauvegarde...' : 'Sauvegarder les informations'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
