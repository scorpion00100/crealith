import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store';
import { searchProductsAsync } from '@/store/slices/searchSlice';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchBarProps {
  placeholder?: string;
  variant?: 'simple' | 'advanced';
  size?: 'small' | 'medium' | 'large';
  showFilters?: boolean;
  autoSearch?: boolean;
  debounceMs?: number;
  onSearch?: (query: string, filters?: SearchFilters) => void;
  onClear?: () => void;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

interface SearchFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  sortBy?: string;
}

const getSizeClasses = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return {
        input: 'pl-8 pr-8 py-2 text-sm',
        icon: 'w-4 h-4 left-2',
        clear: 'w-3 h-3 right-2',
        filter: 'w-3 h-3 right-8'
      };
    case 'large':
      return {
        input: 'pl-12 pr-16 py-4 text-lg',
        icon: 'w-6 h-6 left-4',
        clear: 'w-5 h-5 right-3',
        filter: 'w-5 h-5 right-12'
      };
    default: // medium
      return {
        input: 'pl-10 pr-12 py-3',
        icon: 'w-5 h-5 left-3',
        clear: 'w-4 h-4 right-3',
        filter: 'w-4 h-4 right-10'
      };
  }
};

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Rechercher des produits...",
  variant = 'advanced',
  size = 'medium',
  showFilters = true,
  autoSearch = true,
  debounceMs = 300,
  onSearch,
  onClear,
  className = "",
  value: controlledValue,
  onChange: controlledOnChange
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState(controlledValue || '');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, debounceMs);
  const sizeClasses = getSizeClasses(size);

  // Utiliser la valeur contrôlée si fournie
  const currentValue = controlledValue !== undefined ? controlledValue : query;
  const handleInputChange = (newValue: string) => {
    if (controlledOnChange) {
      controlledOnChange(newValue);
    } else {
      setQuery(newValue);
    }
  };

  // Fermer les filtres quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowAdvancedFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recherche automatique avec debounce
  useEffect(() => {
    if (autoSearch && debouncedQuery.length >= 2) {
      handleSearch(debouncedQuery, filters);
    }
  }, [debouncedQuery, filters, autoSearch]);

  const handleSearch = async (searchQuery: string, searchFilters?: SearchFilters) => {
    try {
      if (variant === 'advanced') {
        await dispatch(searchProductsAsync({
          query: searchQuery,
          filters: searchFilters || filters,
          page: 1,
          limit: 20
        })).unwrap();
      }

      onSearch?.(searchQuery, searchFilters || filters);

      // Naviguer vers la page de résultats si on n'y est pas déjà
      if (window.location.pathname !== '/catalog') {
        navigate(`/catalog?q=${encodeURIComponent(searchQuery)}`);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentValue.trim()) {
      handleSearch(currentValue.trim(), filters);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    if (currentValue.trim()) {
      handleSearch(currentValue.trim(), newFilters);
    }
  };

  const clearFilters = () => {
    setFilters({});
    if (currentValue.trim()) {
      handleSearch(currentValue.trim(), {});
    }
  };

  const clearSearch = () => {
    handleInputChange('');
    setFilters({});
    setIsExpanded(false);
    setShowAdvancedFilters(false);
    onClear?.();
  };

  const hasActiveFilters = Object.values(filters).some(value =>
    value !== undefined && value !== '' && value !== 0
  );

  // Version simple
  if (variant === 'simple') {
    return (
      <form onSubmit={handleSubmit} className={`relative ${className}`}>
        <div className="relative">
          <Search className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 ${sizeClasses.icon}`} />
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${sizeClasses.input}`}
          />
          {currentValue && (
            <button
              type="button"
              onClick={clearSearch}
              className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors ${sizeClasses.clear}`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
    );
  }

  // Version avancée
  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 ${sizeClasses.icon}`} />
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder={placeholder}
            className={`w-full bg-gray-800 border border-gray-700 rounded-2xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 ${isExpanded ? 'pl-12 pr-20 py-4 text-lg' : sizeClasses.input
              }`}
          />

          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {currentValue && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {showFilters && (
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`p-2 rounded-xl transition-all duration-200 ${showAdvancedFilters || hasActiveFilters
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                  }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Filtres avancés */}
      {showAdvancedFilters && showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl z-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-100">Filtres de recherche</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors duration-200"
              >
                Effacer tout
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Catégorie */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Catégorie
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Toutes les catégories</option>
                <option value="graphics">Graphiques</option>
                <option value="templates">Modèles</option>
                <option value="icons">Icônes</option>
                <option value="fonts">Polices</option>
                <option value="photos">Photos</option>
                <option value="videos">Vidéos</option>
                <option value="audio">Audio</option>
                <option value="3d">3D</option>
                <option value="ui-kits">UI Kits</option>
                <option value="web-templates">Templates Web</option>
                <option value="presentations">Présentations</option>
                <option value="documents">Documents</option>
                <option value="other">Autre</option>
              </select>
            </div>

            {/* Prix minimum */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Prix min (€)
              </label>
              <input
                type="number"
                value={filters.priceMin || ''}
                onChange={(e) => handleFilterChange('priceMin', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Prix maximum */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Prix max (€)
              </label>
              <input
                type="number"
                value={filters.priceMax || ''}
                onChange={(e) => handleFilterChange('priceMax', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="1000"
                min="0"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Note minimum */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Note min
              </label>
              <select
                value={filters.rating || ''}
                onChange={(e) => handleFilterChange('rating', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Toutes les notes</option>
                <option value="4">4+ étoiles</option>
                <option value="3">3+ étoiles</option>
                <option value="2">2+ étoiles</option>
                <option value="1">1+ étoile</option>
              </select>
            </div>
          </div>

          {/* Tri */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Trier par
            </label>
            <select
              value={filters.sortBy || 'relevance'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full md:w-auto px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="relevance">Pertinence</option>
              <option value="newest">Plus récents</option>
              <option value="oldest">Plus anciens</option>
              <option value="price-low">Prix croissant</option>
              <option value="price-high">Prix décroissant</option>
              <option value="rating">Mieux notés</option>
              <option value="popular">Plus populaires</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(false)}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-colors duration-200"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={() => handleSearch(currentValue, filters)}
              className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200"
            >
              Rechercher
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
