import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, TrendingUp, Clock, Star } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SearchSuggestion {
    id: string;
    text: string;
    type: 'product' | 'category' | 'seller' | 'trending';
    count?: number;
}

interface SearchBarProps {
    placeholder?: string;
    onSearch?: (query: string, filters?: SearchFilters) => void;
    onSuggestionClick?: (suggestion: SearchSuggestion) => void;
    suggestions?: SearchSuggestion[];
    recentSearches?: string[];
    trendingSearches?: string[];
    showFilters?: boolean;
    className?: string;
}

interface SearchFilters {
    category?: string;
    priceMin?: number;
    priceMax?: number;
    rating?: number;
    sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

export const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = "Rechercher des produits digitaux...",
    onSearch,
    onSuggestionClick,
    suggestions = [],
    recentSearches = [],
    trendingSearches = [],
    showFilters = true,
    className,
}) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [showFiltersPanel, setShowFiltersPanel] = useState(false);
    const [filters, setFilters] = useState<SearchFilters>({});
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
    const [typingTimer, setTypingTimer] = useState<number | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Mock suggestions for demo
    const mockSuggestions: SearchSuggestion[] = [
        { id: '1', text: 'Templates PowerPoint', type: 'product', count: 1250 },
        { id: '2', text: 'Logos', type: 'category', count: 890 },
        { id: '3', text: 'Photoshop Actions', type: 'product', count: 567 },
        { id: '4', text: 'Marie Designer', type: 'seller', count: 234 },
        { id: '5', text: 'Mockups', type: 'trending', count: 1890 },
    ];

    const displaySuggestions = suggestions.length > 0 ? suggestions : mockSuggestions;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setIsOpen(value.length > 0);
        setSelectedSuggestionIndex(-1);

        if (typingTimer) window.clearTimeout(typingTimer);
        const t = window.setTimeout(() => {
            if (value.trim()) {
                onSearch?.(value.trim(), filters);
                setIsOpen(false);
            }
        }, 300);
        setTypingTimer(t);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedSuggestionIndex(prev =>
                    prev < displaySuggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedSuggestionIndex >= 0) {
                    handleSuggestionClick(displaySuggestions[selectedSuggestionIndex]);
                } else {
                    handleSearch();
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSelectedSuggestionIndex(-1);
                break;
        }
    };

    const handleSearch = () => {
        if (query.trim()) {
            onSearch?.(query.trim(), filters);
            setIsOpen(false);
        }
    };

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
        setQuery(suggestion.text);
        setIsOpen(false);
        onSuggestionClick?.(suggestion);
        onSearch?.(suggestion.text, filters);
    };

    const clearSearch = () => {
        setQuery('');
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const getSuggestionIcon = (type: SearchSuggestion['type']) => {
        switch (type) {
            case 'product':
                return <Search className="w-4 h-4" />;
            case 'category':
                return <Filter className="w-4 h-4" />;
            case 'seller':
                return <Star className="w-4 h-4" />;
            case 'trending':
                return <TrendingUp className="w-4 h-4" />;
            default:
                return <Search className="w-4 h-4" />;
        }
    };

    const getSuggestionColor = (type: SearchSuggestion['type']) => {
        switch (type) {
            case 'product':
                return 'text-primary-400';
            case 'category':
                return 'text-secondary-400';
            case 'seller':
                return 'text-success-400';
            case 'trending':
                return 'text-warning-400';
            default:
                return 'text-text-400';
        }
    };

    return (
        <div className={cn('relative w-full max-w-2xl', className)} ref={dropdownRef}>
            {/* Search Input */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-text-400" />
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length > 0 && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-20 py-3 bg-background-800 border border-background-700 rounded-2xl text-text-100 placeholder-text-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />

                <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3">
                    {query && (
                        <button
                            onClick={clearSearch}
                            className="p-2 min-h-[44px] min-w-[44px] text-text-400 hover:text-text-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            aria-label="Effacer la recherche"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}

                    {showFilters && (
                        <button
                            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                            className={cn(
                                'p-2 min-h-[44px] min-w-[44px] rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500',
                                showFiltersPanel
                                    ? 'bg-primary-500 text-white'
                                    : 'text-text-400 hover:text-text-200 hover:bg-background-700'
                            )}
                            aria-expanded={showFiltersPanel}
                            aria-controls="search-filters-panel"
                            aria-label="Afficher les filtres"
                        >
                            <Filter className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 min-h-[44px] bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        aria-label="Lancer la recherche"
                    >
                        Rechercher
                    </button>
                </div>
            </div>

            {/* Filters Panel */}
            {showFiltersPanel && (
                <div id="search-filters-panel" className="absolute top-full left-0 right-0 mt-2 bg-background-800 border border-background-700 rounded-2xl shadow-large p-4 z-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-text-200 mb-2">
                                Catégorie
                            </label>
                            <select
                                value={filters.category || ''}
                                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-3 py-2 bg-background-700 border border-background-600 rounded-lg text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Toutes les catégories</option>
                                <option value="templates">Templates</option>
                                <option value="graphics">Graphiques</option>
                                <option value="photos">Photos</option>
                                <option value="fonts">Polices</option>
                                <option value="icons">Icônes</option>
                            </select>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-medium text-text-200 mb-2">
                                Prix
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.priceMin || ''}
                                    onChange={(e) => setFilters(prev => ({ ...prev, priceMin: Number(e.target.value) }))}
                                    className="w-full px-3 py-2 bg-background-700 border border-background-600 rounded-lg text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.priceMax || ''}
                                    onChange={(e) => setFilters(prev => ({ ...prev, priceMax: Number(e.target.value) }))}
                                    className="w-full px-3 py-2 bg-background-700 border border-background-600 rounded-lg text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="block text-sm font-medium text-text-200 mb-2">
                                Trier par
                            </label>
                            <select
                                value={filters.sortBy || 'relevance'}
                                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as SearchFilters['sortBy'] }))}
                                className="w-full px-3 py-2 bg-background-700 border border-background-600 rounded-lg text-text-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="relevance">Pertinence</option>
                                <option value="price_asc">Prix croissant</option>
                                <option value="price_desc">Prix décroissant</option>
                                <option value="rating">Mieux notés</option>
                                <option value="newest">Plus récents</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Suggestions Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background-800 border border-background-700 rounded-2xl shadow-large overflow-hidden z-40">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                        <div className="p-3 border-b border-background-700">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-text-400" />
                                <span className="text-sm font-medium text-text-300">Recherches récentes</span>
                            </div>
                            <div className="space-y-1">
                                {recentSearches.slice(0, 3).map((search, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setQuery(search);
                                            onSearch?.(search, filters);
                                            setIsOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm text-text-400 hover:text-text-200 hover:bg-background-700 rounded-lg transition-colors duration-200"
                                    >
                                        {search}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Trending Searches */}
                    {trendingSearches.length > 0 && (
                        <div className="p-3 border-b border-background-700">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-warning-400" />
                                <span className="text-sm font-medium text-text-300">Tendances</span>
                            </div>
                            <div className="space-y-1">
                                {trendingSearches.slice(0, 3).map((search, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setQuery(search);
                                            onSearch?.(search, filters);
                                            setIsOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm text-text-400 hover:text-text-200 hover:bg-background-700 rounded-lg transition-colors duration-200"
                                    >
                                        {search}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suggestions */}
                    <div className="p-3">
                        <div className="space-y-1">
                            {displaySuggestions.map((suggestion, index) => (
                                <button
                                    key={suggestion.id}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200',
                                        selectedSuggestionIndex === index
                                            ? 'bg-primary-500/20 text-primary-400'
                                            : 'text-text-400 hover:text-text-200 hover:bg-background-700'
                                    )}
                                >
                                    <div className={cn('flex-shrink-0', getSuggestionColor(suggestion.type))}>
                                        {getSuggestionIcon(suggestion.type)}
                                    </div>
                                    <span className="flex-1 text-left">{suggestion.text}</span>
                                    {suggestion.count && (
                                        <span className="text-xs text-text-500">
                                            {suggestion.count.toLocaleString()}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
