import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Edit,
    Save,
    X,
    Camera,
    Shield,
    CreditCard,
    Bell,
    Globe,
    Award,
    Star,
    Download,
    ShoppingBag
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user, isAuthenticated, refreshProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        bio: '',
        location: '',
        website: '',
        avatar: ''
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            dispatch(addNotification({
                type: 'warning',
                message: 'Vous devez être connecté pour accéder à votre profil',
                duration: 4000
            }));
            navigate('/login?redirect=/profile');
            return;
        }

        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: '',
                bio: user.bio || '',
                location: '',
                website: '',
                avatar: (user as any).avatar || ''
            });
            setAvatarFile(null);
            setAvatarPreview(null);
        }
    }, [isAuthenticated, user, navigate, dispatch]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // 1) Envoi au backend des champs supportés
            const updated = await authService.updateProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                bio: formData.bio || undefined,
                avatar: formData.avatar ? formData.avatar : null,
            });

            // 2) Optionnel: upload avatarFile (non implémenté ici)
            // TODO: si on implémente l'upload, récupérer une URL et refaire updateProfile({ avatar: url })

            // 3) Rafraîchir le profil global pour que tout le front voie la mise à jour
            // useAuth expose refreshProfile
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            refreshProfile();

            dispatch(addNotification({
                type: 'success',
                message: 'Profil mis à jour avec succès !',
                duration: 3000
            }));

            setIsEditing(false);
        } catch (error: any) {
            dispatch(addNotification({
                type: 'error',
                message: error?.message || 'Erreur lors de la mise à jour du profil',
                duration: 4000
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: '',
                bio: user.bio || '',
                location: '',
                website: '',
                avatar: (user as any).avatar || ''
            });
            setAvatarFile(null);
            setAvatarPreview(null);
        }
        setIsEditing(false);
    };

    const getUserInitials = () => {
        return `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase();
    };

    const getRoleName = () => {
        switch (user?.role) {
            case 'ADMIN':
                return 'Administrateur';
            case 'SELLER':
                return 'Vendeur';
            case 'BUYER':
                return 'Acheteur';
            default:
                return 'Utilisateur';
        }
    };

    const getRoleColor = () => {
        switch (user?.role) {
            case 'ADMIN':
                return 'from-red-500 to-red-600';
            case 'SELLER':
                return 'from-green-500 to-green-600';
            case 'BUYER':
                return 'from-blue-500 to-blue-600';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="min-h-screen text-gray-100">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-accent-500/10"></div>

                <div className="relative container-custom section-padding">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="relative inline-block mb-8">
                            <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-premium mx-auto overflow-hidden">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-black text-white">{getUserInitials()}</span>
                                )}
                            </div>
                            {isEditing && (
                                <>
                                    <input
                                        id="avatar-input"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files && e.target.files[0];
                                            if (!file) return;
                                            setAvatarFile(file);
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                                setAvatarPreview(reader.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('avatar-input')?.click()}
                                        className="absolute bottom-0 right-0 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center shadow-lg hover:bg-primary-600 transition-colors duration-300"
                                    >
                                        <Camera className="w-5 h-5 text-white" />
                                    </button>
                                    {(avatarPreview || formData.avatar) && (
                                        <button
                                            type="button"
                                            onClick={() => { setAvatarFile(null); setAvatarPreview(null); setFormData(prev => ({ ...prev, avatar: '' })); }}
                                            className="absolute bottom-0 left-0 w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors duration-300"
                                            aria-label="Supprimer l'avatar"
                                        >
                                            <X className="w-5 h-5 text-white" />
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        <h1 className="responsive-text font-black mb-2 text-gradient-primary">
                            {user.firstName} {user.lastName}
                        </h1>

                        <div className="flex items-center justify-center space-x-4 mb-6">
                            <div className={`px-4 py-2 bg-gradient-to-r ${getRoleColor()} rounded-full text-white text-sm font-semibold`}>
                                {getRoleName()}
                            </div>
                            <div className="text-gray-400 text-sm">
                                Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                            </div>
                        </div>

                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold px-6 py-3 rounded-2xl shadow-premium hover:shadow-2xl transition-all duration-300 hover:from-primary-600 hover:to-primary-700 transform hover:scale-105"
                            >
                                <Edit className="w-5 h-5" />
                                <span>Modifier le profil</span>
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Profile Content */}
            <section className="py-20 bg-gray-800">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-gray-900 rounded-3xl p-8 border border-gray-700">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-black text-gray-100">
                                        Informations personnelles
                                    </h2>
                                    {isEditing && (
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={handleCancel}
                                                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-colors duration-300 flex items-center space-x-2"
                                            >
                                                <X className="w-4 h-4" />
                                                <span>Annuler</span>
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                disabled={isLoading}
                                                className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
                                            >
                                                {isLoading ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                ) : (
                                                    <Save className="w-4 h-4" />
                                                )}
                                                <span>Sauvegarder</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                                Prénom
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-2xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                                                />
                                            ) : (
                                                <div className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-2xl text-gray-100">
                                                    {user.firstName}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                                Nom
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-2xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                                                />
                                            ) : (
                                                <div className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-2xl text-gray-100">
                                                    {user.lastName}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                                            Email
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-2xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-2xl text-gray-100">
                                                {user.email}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                                            Bio
                                        </label>
                                        {isEditing ? (
                                            <textarea
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                                rows={4}
                                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-2xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 resize-none"
                                                placeholder="Parlez-nous de vous..."
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-2xl text-gray-100 min-h-[100px]">
                                                {user.bio || 'Aucune bio disponible'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Account Status */}
                            <div className="bg-gray-900 rounded-3xl p-6 border border-gray-700">
                                <h3 className="text-lg font-bold text-gray-100 mb-4">Statut du compte</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Statut</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${user.isActive
                                            ? 'bg-green-500/20 text-green-300'
                                            : 'bg-red-500/20 text-red-300'
                                            }`}>
                                            {user.isActive ? 'Actif' : 'Inactif'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Rôle</span>
                                        <span className="text-gray-100 font-semibold">{getRoleName()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Membre depuis</span>
                                        <span className="text-gray-100 font-semibold">
                                            {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-gray-900 rounded-3xl p-6 border border-gray-700">
                                <h3 className="text-lg font-bold text-gray-100 mb-4">Actions rapides</h3>
                                <div className="space-y-3">
                                    <button className="w-full flex items-center space-x-3 p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors duration-300">
                                        <Shield className="w-5 h-5 text-primary-400" />
                                        <span className="text-gray-100">Sécurité</span>
                                    </button>
                                    <button className="w-full flex items-center space-x-3 p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors duration-300">
                                        <Bell className="w-5 h-5 text-secondary-400" />
                                        <span className="text-gray-100">Notifications</span>
                                    </button>
                                    <button className="w-full flex items-center space-x-3 p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors duration-300">
                                        <CreditCard className="w-5 h-5 text-accent-400" />
                                        <span className="text-gray-100">Paiements</span>
                                    </button>
                                </div>
                            </div>

                            {/* Stats (if seller) */}
                            {user.role === 'SELLER' && (
                                <div className="bg-gray-900 rounded-3xl p-6 border border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-100 mb-4">Statistiques</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                                                    <Award className="w-4 h-4 text-green-400" />
                                                </div>
                                                <span className="text-gray-400">Produits</span>
                                            </div>
                                            <span className="text-gray-100 font-semibold">0</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                    <Download className="w-4 h-4 text-blue-400" />
                                                </div>
                                                <span className="text-gray-400">Ventes</span>
                                            </div>
                                            <span className="text-gray-100 font-semibold">0</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                                    <Star className="w-4 h-4 text-yellow-400" />
                                                </div>
                                                <span className="text-gray-400">Note</span>
                                            </div>
                                            <span className="text-gray-100 font-semibold">-</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Stats (if buyer) */}
                            {user.role === 'BUYER' && (
                                <div className="bg-gray-900 rounded-3xl p-6 border border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-100 mb-4">Activité</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                                                    <ShoppingBag className="w-4 h-4 text-primary-400" />
                                                </div>
                                                <span className="text-gray-400">Achats</span>
                                            </div>
                                            <span className="text-gray-100 font-semibold">0</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-secondary-500/20 rounded-lg flex items-center justify-center">
                                                    <Download className="w-4 h-4 text-secondary-400" />
                                                </div>
                                                <span className="text-gray-400">Téléchargements</span>
                                            </div>
                                            <span className="text-gray-100 font-semibold">0</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
