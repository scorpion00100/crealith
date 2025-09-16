import React, { useState } from 'react';
import {
  Search,
  Filter,
  Calendar,
  DollarSign,
  Star,
  Download,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export interface FilterOptions {
  search?: string;
  status?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  category?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface DashboardFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  variant?: 'buyer' | 'seller' | 'admin';
  categories?: Array<{ id: string; name: string; slug: string }>;
}

const statusOptions = [
  { value: 'active', label: 'Actif', color: 'bg-green-100 text-green-800' },
  { value: 'draft', label: 'Brouillon', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'archived', label: 'Archivé', color: 'bg-gray-100 text-gray-800' },
  { value: 'pending', label: 'En attente', color: 'bg-blue-100 text-blue-800' },
  { value: 'paid', label: 'Payé', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Annulé', color: 'bg-red-100 text-red-800' }
];

const sortOptions = [
  { value: 'createdAt', label: 'Date de création' },
  { value: 'updatedAt', label: 'Dernière modification' },
  { value: 'price', label: 'Prix' },
  { value: 'rating', label: 'Note' },
  { value: 'downloads', label: 'Téléchargements' },
  { value: 'sales', label: 'Ventes' },
  { value: 'revenue', label: 'Revenus' }
];

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  variant = 'buyer',
  categories = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const updateFilters = (updates: Partial<FilterOptions>) => {
    const newFilters = { ...filters, ...updates };
    onFiltersChange(newFilters);

    // Update active filters count
    const active = [];
    if (newFilters.search) active.push('Recherche');
    if (newFilters.status?.length) active.push('Statut');
    if (newFilters.dateRange?.start || newFilters.dateRange?.end) active.push('Date');
    if (newFilters.priceRange?.min || newFilters.priceRange?.max) active.push('Prix');
    if (newFilters.rating) active.push('Note');
    if (newFilters.category?.length) active.push('Catégorie');
    if (newFilters.sortBy) active.push('Tri');

    setActiveFilters(active);
  };

  const clearFilter = (filterType: keyof FilterOptions) => {
    const newFilters = { ...filters };
    delete newFilters[filterType];
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
            {hasActiveFilters && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {activeFilters.length} actif{activeFilters.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Effacer tout</span>
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Filters Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recherche
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={filters.search || ''}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions
                .filter(option => {
                  if (variant === 'buyer') {
                    return ['pending', 'paid', 'cancelled'].includes(option.value);
                  }
                  if (variant === 'seller') {
                    return ['active', 'draft', 'archived'].includes(option.value);
                  }
                  return true;
                })
                .map((option) => (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status?.includes(option.value) || false}
                      onChange={(e) => {
                        const currentStatus = filters.status || [];
                        const newStatus = e.target.checked
                          ? [...currentStatus, option.value]
                          : currentStatus.filter(s => s !== option.value);
                        updateFilters({ status: newStatus });
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => updateFilters({
                  dateRange: { ...filters.dateRange, start: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => updateFilters({
                  dateRange: { ...filters.dateRange, end: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fourchette de prix
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  placeholder="Prix min"
                  value={filters.priceRange?.min || ''}
                  onChange={(e) => updateFilters({
                    priceRange: { ...filters.priceRange, min: parseFloat(e.target.value) || undefined }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Prix max"
                  value={filters.priceRange?.max || ''}
                  onChange={(e) => updateFilters({
                    priceRange: { ...filters.priceRange, max: parseFloat(e.target.value) || undefined }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note minimum
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => updateFilters({ rating: filters.rating === rating ? undefined : rating })}
                  className={`p-2 rounded-lg transition-colors ${filters.rating === rating
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">{rating}+</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégories
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.category?.includes(category.id) || false}
                      onChange={(e) => {
                        const currentCategories = filters.category || [];
                        const newCategories = e.target.checked
                          ? [...currentCategories, category.id]
                          : currentCategories.filter(c => c !== category.id);
                        updateFilters({ category: newCategories });
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trier par
            </label>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={filters.sortBy || ''}
                onChange={(e) => updateFilters({ sortBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner...</option>
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => updateFilters({ sortOrder: e.target.value as 'asc' | 'desc' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <span
                key={index}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
              >
                <span>{filter}</span>
                <button
                  onClick={() => {
                    // Clear specific filter - this is a simplified version
                    onClearFilters();
                  }}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
