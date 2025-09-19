import React, { useState } from 'react';
import { Filter, X, ChevronDown, Search } from 'lucide-react';
import type { FilterOptions } from '../../types';

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClose?: () => void;
  isOpen?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  filters, 
  onFiltersChange, 
  onClose,
  isOpen = true 
}) => {
  const ethnicities = [
    { value: '', label: 'All Ethnicities' },
    { value: 'arab', label: 'Arab' },
    { value: 'asian', label: 'Asian' },
    { value: 'ebony', label: 'Ebony' },
    { value: 'indian', label: 'Indian' },
    { value: 'latina', label: 'Latina' },
    { value: 'white', label: 'White' }
  ];

  const hairColors = [
    { value: '', label: 'All Hair Colors' },
    { value: 'Blonde', label: 'Blonde' },
    { value: 'Brunette', label: 'Brunette' },
    { value: 'Black', label: 'Black' },
    { value: 'Red', label: 'Red' },
    { value: 'Auburn', label: 'Auburn' },
    { value: 'Gray', label: 'Gray' },
    { value: 'Other', label: 'Other' }
  ];

  const eyeColors = [
    { value: '', label: 'All Eye Colors' },
    { value: 'Blue', label: 'Blue' },
    { value: 'Brown', label: 'Brown' },
    { value: 'Green', label: 'Green' },
    { value: 'Hazel', label: 'Hazel' },
    { value: 'Gray', label: 'Gray' },
    { value: 'Amber', label: 'Amber' },
    { value: 'Other', label: 'Other' }
  ];

  const bodyTypes = [
    { value: '', label: 'All Body Types' },
    { value: 'Slim', label: 'Slim' },
    { value: 'Athletic', label: 'Athletic' },
    { value: 'Average', label: 'Average' },
    { value: 'Curvy', label: 'Curvy' },
    { value: 'Plus Size', label: 'Plus Size' },
    { value: 'Muscular', label: 'Muscular' }
  ];

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key as keyof FilterOptions] !== undefined && 
    filters[key as keyof FilterOptions] !== ''
  );

  if (!isOpen) return null;

  return (
    <div className="bg-gradient-to-br from-dark-200 to-dark-100 rounded-2xl shadow-2xl border border-dark-100/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500/20 to-primary-600/20 px-6 py-4 border-b border-dark-100/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center mr-3">
              <Filter size={18} className="text-primary-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Advanced Filters</h3>
              <p className="text-gray-400 text-sm">Refine your search</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-all duration-200 border border-red-500/30"
              >
                Clear All
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 bg-dark-300/50 hover:bg-dark-300 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Ethnicity Filter */}
        <div className="space-y-3">
          <label className="flex items-center text-white font-semibold">
            <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center mr-3">
              <span className="text-lg">🌍</span>
            </div>
            Ethnicity
          </label>
          <select
            value={filters.ethnicity || ''}
            onChange={(e) => updateFilter('ethnicity', e.target.value)}
            className="w-full px-4 py-3 bg-dark-300/50 border border-dark-100/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.75rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em'
            }}
          >
            {ethnicities.map(({ value, label }) => (
              <option key={value} value={value} className="bg-dark-300 text-white">
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Age Range */}
        <div className="space-y-3">
          <label className="flex items-center text-white font-semibold">
            <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center mr-3">
              <span className="text-lg">🎂</span>
            </div>
            Age Range
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Min Age</label>
              <input
                type="number"
                min="18"
                max="65"
                value={filters.minAge || ''}
                onChange={(e) => updateFilter('minAge', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-4 py-3 bg-dark-300/50 border border-dark-100/30 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                placeholder="18"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Max Age</label>
              <input
                type="number"
                min="18"
                max="65"
                value={filters.maxAge || ''}
                onChange={(e) => updateFilter('maxAge', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-4 py-3 bg-dark-300/50 border border-dark-100/30 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                placeholder="65"
              />
            </div>
          </div>
        </div>

        {/* Hair Color */}
        <div className="space-y-3">
          <label className="flex items-center text-white font-semibold">
            <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center mr-3">
              <span className="text-lg">💇‍♀️</span>
            </div>
            Hair Color
          </label>
          <select
            value={filters.hairColor || ''}
            onChange={(e) => updateFilter('hairColor', e.target.value)}
            className="w-full px-4 py-3 bg-dark-300/50 border border-dark-100/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.75rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em'
            }}
          >
            {hairColors.map(({ value, label }) => (
              <option key={value} value={value} className="bg-dark-300 text-white">
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Eye Color */}
        <div className="space-y-3">
          <label className="flex items-center text-white font-semibold">
            <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center mr-3">
              <span className="text-lg">👁️</span>
            </div>
            Eye Color
          </label>
          <select
            value={filters.eyeColor || ''}
            onChange={(e) => updateFilter('eyeColor', e.target.value)}
            className="w-full px-4 py-3 bg-dark-300/50 border border-dark-100/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.75rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em'
            }}
          >
            {eyeColors.map(({ value, label }) => (
              <option key={value} value={value} className="bg-dark-300 text-white">
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Body Type */}
        <div className="space-y-3">
          <label className="flex items-center text-white font-semibold">
            <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center mr-3">
              <span className="text-lg">💪</span>
            </div>
            Body Type
          </label>
          <select
            value={filters.bodyType || ''}
            onChange={(e) => updateFilter('bodyType', e.target.value)}
            className="w-full px-4 py-3 bg-dark-300/50 border border-dark-100/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.75rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em'
            }}
          >
            {bodyTypes.map(({ value, label }) => (
              <option key={value} value={value} className="bg-dark-300 text-white">
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4">
            <h4 className="text-primary-300 font-medium mb-3 flex items-center">
              <Search size={16} className="mr-2" />
              Active Filters
            </h4>
            <div className="flex flex-wrap gap-2">
              {filters.ethnicity && (
                <span className="px-3 py-1 bg-primary-500/20 text-primary-300 text-xs rounded-full border border-primary-500/30">
                  {ethnicities.find(e => e.value === filters.ethnicity)?.label}
                </span>
              )}
              {filters.minAge && (
                <span className="px-3 py-1 bg-primary-500/20 text-primary-300 text-xs rounded-full border border-primary-500/30">
                  Min Age: {filters.minAge}
                </span>
              )}
              {filters.maxAge && (
                <span className="px-3 py-1 bg-primary-500/20 text-primary-300 text-xs rounded-full border border-primary-500/30">
                  Max Age: {filters.maxAge}
                </span>
              )}
              {filters.hairColor && (
                <span className="px-3 py-1 bg-primary-500/20 text-primary-300 text-xs rounded-full border border-primary-500/30">
                  Hair: {filters.hairColor}
                </span>
              )}
              {filters.eyeColor && (
                <span className="px-3 py-1 bg-primary-500/20 text-primary-300 text-xs rounded-full border border-primary-500/30">
                  Eyes: {filters.eyeColor}
                </span>
              )}
              {filters.bodyType && (
                <span className="px-3 py-1 bg-primary-500/20 text-primary-300 text-xs rounded-full border border-primary-500/30">
                  Body: {filters.bodyType}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;