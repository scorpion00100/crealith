import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    ShoppingBag,
    Heart,
    User,
    History,
    Star,
    Settings,
    Package,
    TrendingUp,
    DollarSign,
    MessageSquare,
    BarChart3,
    Plus,
    FileText,
    Download,
    CreditCard
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    variant?: 'buyer' | 'seller';
}

interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
    badge?: number;
    children?: NavItem[];
}

const buyerNavItems: NavItem[] = [
    {
        id: 'dashboard',
        label: 'Tableau de bord',
        icon: Home,
        path: '/buyer-dashboard',
    },
    {
        id: 'catalog',
        label: 'Catalogue',
        icon: Package,
        path: '/catalog',
    },
    {
        id: 'orders',
        label: 'Mes commandes',
        icon: ShoppingBag,
        path: '/orders',
    },
    {
        id: 'favorites',
        label: 'Favoris',
        icon: Heart,
        path: '/favorites',
    },
    {
        id: 'profile',
        label: 'Profil',
        icon: User,
        path: '/profile',
    },
    {
        id: 'settings',
        label: 'Paramètres',
        icon: Settings,
        path: '/settings',
    }
];

const sellerNavItems: NavItem[] = [
    {
        id: 'dashboard',
        label: 'Tableau de bord',
        icon: Home,
        path: '/seller-dashboard',
    },
    {
        id: 'products',
        label: 'Mes produits',
        icon: Package,
        path: '/seller-dashboard#products',
    },
    {
        id: 'profile',
        label: 'Profil',
        icon: User,
        path: '/profile',
    },
    {
        id: 'settings',
        label: 'Paramètres',
        icon: Settings,
        path: '/settings',
    }
];

export const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onClose,
    variant = 'buyer'
}) => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const navItems = variant === 'buyer' ? buyerNavItems : sellerNavItems;

    const isActivePath = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const NavItemComponent: React.FC<{ item: NavItem; level?: number }> = ({
        item,
        level = 0
    }) => {
        const isActive = isActivePath(item.path);
        const hasChildren = item.children && item.children.length > 0;

        return (
            <div>
                <Link
                    to={item.path}
                    onClick={onClose}
                    className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                        level > 0 && 'ml-6',
                        isActive
                            ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                            : 'text-text-400 hover:text-text-200 hover:bg-background-700'
                    )}
                >
                    <item.icon className={cn(
                        'w-5 h-5 flex-shrink-0',
                        isActive ? 'text-primary-400' : 'text-text-500 group-hover:text-text-300'
                    )} />
                    <span className="flex-1 font-medium">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-2 py-1 bg-secondary-500 text-white text-xs font-medium rounded-full min-w-[20px] text-center">
                            {item.badge}
                        </span>
                    )}
                </Link>

                {/* Children */}
                {hasChildren && (
                    <div className="mt-2 space-y-1">
                        {item.children!.map((child) => (
                            <NavItemComponent key={child.id} item={child} level={level + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Fermeture au clavier (Escape)
    React.useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose]);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    role="presentation"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div id="buyer-sidebar" className={cn(
                'fixed top-0 left-0 h-full w-80 bg-background-900 border-r border-background-700 z-50 transform transition-transform duration-300 ease-in-out',
                isOpen ? 'translate-x-0' : '-translate-x-full',
                'lg:translate-x-0 lg:fixed lg:z-40'
            )}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-background-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">C</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-text-100">
                                    {variant === 'buyer' ? 'Mon Compte' : 'Vendeur'}
                                </h2>
                                <p className="text-sm text-text-400">
                                    {user?.firstName} {user?.lastName}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => (
                            <NavItemComponent key={item.id} item={item} />
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-background-700">
                        <div className="bg-background-800 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-primary-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-text-200">
                                        {variant === 'buyer' ? 'Découvrez plus' : 'Boostez vos ventes'}
                                    </p>
                                    <p className="text-xs text-text-400">
                                        {variant === 'buyer'
                                            ? 'Explorez nos recommandations'
                                            : 'Optimisez votre boutique'
                                        }
                                    </p>
                                </div>
                            </div>
                            <Link
                                to={variant === 'buyer' ? '/catalog' : '/seller-dashboard'}
                                onClick={onClose}
                                className="block text-center w-full py-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded-lg text-sm font-medium transition-colors duration-200"
                                aria-label={variant === 'buyer' ? 'Voir les suggestions' : 'Analyser les performances'}
                            >
                                {variant === 'buyer' ? 'Voir les suggestions' : 'Analyser les performances'}
                            </Link>
                        </div>
                    </div>

                    {/* Bouton de déconnexion */}
                    <div className="p-4 border-t border-background-700">
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-text-400 hover:text-text-200 hover:bg-background-700 rounded-xl transition-all duration-200 group"
                        >
                            <svg className="w-5 h-5 text-text-500 group-hover:text-text-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="font-medium">🚪 Déconnexion</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
