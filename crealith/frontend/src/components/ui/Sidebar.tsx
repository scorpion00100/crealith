import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '@/types';

interface SidebarProps {
    selectedCategory: string;
    onCategoryChange: (categoryId: string) => void;
    categories?: Category[];
}

export const Sidebar: React.FC<SidebarProps> = ({
    selectedCategory,
    onCategoryChange,
    categories
}) => {
    const defaultCategories: Category[] = [
        { id: 'all', name: 'Tous les produits', count: 10000, icon: '📂' },
        { id: 'templates', name: 'Templates Web', count: 1250, icon: '🌐' },
        { id: 'ui-kits', name: 'UI Kits', count: 890, icon: '🎨' },
        { id: 'dashboards', name: 'Dashboards', count: 640, icon: '📊' },
        { id: 'mobile', name: 'Mobile Apps', count: 520, icon: '📱' },
        { id: 'logos', name: 'Logos', count: 1100, icon: '🎯' },
        { id: 'illustrations', name: 'Illustrations', count: 780, icon: '🎭' }
    ];

    const categoriesToUse = categories || defaultCategories;

    const handleCategoryClick = (categoryId: string) => {
        onCategoryChange(categoryId);
    };

    const formatCount = (count: number): string => {
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k`;
        }
        return count.toString();
    };

    return (
        <div className="sidebar">
            {/* Categories */}
            <div className="sidebar-section">
                <h3 className="sidebar-title">Catégories populaires</h3>
                <ul className="category-menu">
                    {categoriesToUse.map((category) => (
                        <li key={category.id} className="category-item">
                            <button
                                type="button"
                                className={`category-link ${selectedCategory === category.id ? 'active' : ''}`}
                                onClick={() => handleCategoryClick(category.id)}
                                aria-pressed={selectedCategory === category.id}
                            >
                                <div className="category-info">
                                    {category.icon && (
                                        <span className="category-icon" role="img" aria-label={category.name}>
                                            {category.icon}
                                        </span>
                                    )}
                                    <span className="category-name">{category.name}</span>
                                </div>
                                <span className="category-count">{formatCount(category.count)}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Filtres prix */}
            <div className="sidebar-section">
                <h4 className="sidebar-subtitle">Prix</h4>
                <div className="price-filters">
                    <label className="checkbox-label">
                        <input type="checkbox" />
                        <span>Gratuit</span>
                    </label>
                    <label className="checkbox-label">
                        <input type="checkbox" />
                        <span>0€ - 25€</span>
                    </label>
                    <label className="checkbox-label">
                        <input type="checkbox" />
                        <span>25€ - 50€</span>
                    </label>
                    <label className="checkbox-label">
                        <input type="checkbox" />
                        <span>50€ - 100€</span>
                    </label>
                    <label className="checkbox-label">
                        <input type="checkbox" />
                        <span>100€+</span>
                    </label>
                </div>
            </div>

            {/* CTA Vendeur */}
            <div className="sidebar-section seller-cta">
                <h4>Prêt à rejoindre notre communauté créative ?</h4>
                <p>Vendez vos créations et connectez-vous avec des milliers d'acheteurs passionnés</p>
                <Link to="/register?type=seller" className="btn btn-primary">
                    Créer un compte vendeur
                </Link>
            </div>
        </div>
    );
};
