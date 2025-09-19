import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
    Home,
    ShoppingBag,
    Download,
    Heart,
    Settings,
    User,
    LogOut,
    Menu,
    X,
    ChevronRight,
    TrendingUp,
    DollarSign,
    Package,
    BarChart3,
    Plus,
    Grid3X3,
    FileText,
    CreditCard
} from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
    variant?: 'buyer' | 'seller' | 'admin';
    title?: string;
    subtitle?: string;
}

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    variant = 'buyer',
    title,
    subtitle
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();

    const buyerNavItems: NavItem[] = [
        { label: 'Vue d\'ensemble', href: '/buyer-dashboard', icon: <Home className="w-5 h-5" /> },
        { label: 'Mes commandes', href: '/buyer-dashboard/orders', icon: <ShoppingBag className="w-5 h-5" /> },
        { label: 'Téléchargements', href: '/downloads', icon: <Download className="w-5 h-5" /> },
        { label: 'Favoris', href: '/buyer-dashboard/favorites', icon: <Heart className="w-5 h-5" /> },
        { label: 'Avis', href: '/my-reviews', icon: <FileText className="w-5 h-5" /> },
        { label: 'Paramètres', href: '/buyer-dashboard/settings', icon: <Settings className="w-5 h-5" /> }
    ];

    const sellerNavItems: NavItem[] = [
        { label: 'Vue d\'ensemble', href: '/seller-dashboard', icon: <Home className="w-5 h-5" /> },
        { label: 'Produits', href: '/seller-dashboard/products', icon: <Package className="w-5 h-5" /> },
        { label: 'Commandes', href: '/seller-dashboard/orders', icon: <ShoppingBag className="w-5 h-5" /> },
        { label: 'Analytics', href: '/seller-dashboard/analytics', icon: <BarChart3 className="w-5 h-5" /> },
        { label: 'Revenus', href: '/seller-dashboard/revenue', icon: <DollarSign className="w-5 h-5" /> },
        { label: 'Paramètres', href: '/seller-dashboard/settings', icon: <Settings className="w-5 h-5" /> }
    ];

    const navItems = variant === 'buyer' ? buyerNavItems : sellerNavItems;

    const getUserInitials = () => {
        return `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase();
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="min-h-screen bg-background-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-earth-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-earth-200">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-warm-500 rounded-xl flex items-center justify-center">
                                <Grid3X3 className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-bold text-gradient-primary">Crealith</span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 text-earth-400 hover:text-earth-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="p-6 border-b border-earth-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-white">{getUserInitials()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-earth-900 truncate">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-earth-500 capitalize">
                                    {variant === 'buyer' ? 'Acheteur' : 'Vendeur'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                                        : 'text-earth-600 hover:bg-earth-50 hover:text-earth-900'
                                        }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <div className={`${isActive ? 'text-primary-600' : 'text-earth-400'}`}>
                                        {item.icon}
                                    </div>
                                    <span className="flex-1">{item.label}</span>
                                    {item.badge && (
                                        <span className="px-2 py-1 text-xs font-bold bg-primary-100 text-primary-700 rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                    {isActive && <ChevronRight className="w-4 h-4 text-primary-600" />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-earth-200">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start"
                            onClick={handleLogout}
                            icon={<LogOut className="w-4 h-4" />}
                        >
                            Se déconnecter
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Top Bar */}
                <div className="sticky top-0 z-30 bg-white border-b border-earth-200">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 text-earth-400 hover:text-earth-600"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div>
                                {title && <h1 className="text-xl font-bold text-earth-900">{title}</h1>}
                                {subtitle && <p className="text-sm text-earth-500">{subtitle}</p>}
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            {variant === 'seller' && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    icon={<Plus className="w-4 h-4" />}
                                    onClick={() => {/* Handle add product */ }}
                                >
                                    Ajouter un produit
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};
