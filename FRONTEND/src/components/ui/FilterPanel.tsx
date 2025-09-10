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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    ethnicity: true,
    physical: false,
    age: false
  });

  const ethnicities = [
    { value: 'arab', label: 'Arab', emoji: '🏺' },
    { value: 'asian', label: 'Asian', emoji: '🏮' },
    { value: 'ebony', label: 'Ebony', emoji: '🌍' },
    { value: 'indian', label: 'Indian', emoji: '🕌' },
    { value: 'latina', label: 'Latina', emoji: '🌶️' },
    { value: 'white', label: 'White', emoji: '❄️' }
  ];

  const hairColors = [
    { value: 'Blonde', emoji: '👱‍♀️' },
    { value: 'Brunette', emoji: '👩‍🦱' },
    { value: 'Black', emoji: '👩‍🦲' },
    { value: 'Red', emoji: '👩‍🦰' },
    { value: 'Auburn', emoji: '🔥' },
    { value: 'Gray', emoji: '👵' },
    { value: 'Other', emoji: '🎨' }
  ];

  const eyeColors = [
    { value: 'Blue', emoji: '💙' },
    { value: 'Brown', emoji: '🤎' },
    { value: 'Green', emoji: '💚' },
    { value: 'Hazel', emoji: '🌰' },
    { value: 'Gray', emoji: '🩶' },
    { value: 'Amber', emoji: '🟡' },
    { value: 'Other', emoji: '👁️' }
  ];

  const bodyTypes = [
    { value: 'Slim', emoji: '🪶' },
    { value: 'Athletic', emoji: '💪' },
    { value: 'Average', emoji: '👤' },
    { value: 'Curvy', emoji: '🍑' },
    { value: 'Plus Size', emoji: '🤗' },
    { value: 'Muscular', emoji: '🏋️‍♀️' }
  ];

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
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
            <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center mr-3">
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
          <button
            onClick={() => toggleSection('ethnicity')}
            className="flex items-center justify-between w-full text-left group"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-500/20 transition-colors">
                <span className="text-lg">🌍</span>
              </div>
              <span className="text-white font-semibold">Ethnicity</span>
            </div>
            <ChevronDown 
              size={18} 
              className={`text-gray-400 transition-all duration-200 ${expandedSections.ethnicity ? 'rotate-180 text-primary-400' : ''}`}
            />
          </button>
          
          {expandedSections.ethnicity && (
            <div className="ml-11 grid grid-cols-2 gap-3">
              {ethnicities.map(({ value, label, emoji }) => (
                <label 
                  key={value} 
                  className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                    filters.ethnicity === value
                      ? 'bg-primary-500/20 border-primary-500/50 text-primary-300'
                      : 'bg-dark-300/30 border-dark-100/30 hover:bg-dark-300/50 text-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="ethnicity"
                    value={value}
                    checked={filters.ethnicity === value}
                    onChange={(e) => updateFilter('ethnicity', e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-lg mr-2">{emoji}</span>
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Age Filter */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('age')}
            className="flex items-center justify-between w-full text-left group"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-500/20 transition-colors">
                <span className="text-lg">🎂</span>
              </div>
              <span className="text-white font-semibold">Age Range</span>
            </div>
            <ChevronDown 
              size={18} 
              className={`text-gray-400 transition-all duration-200 ${expandedSections.age ? 'rotate-180 text-primary-400' : ''}`}
            />
          </button>
          
          {expandedSections.age && (
            <div className="ml-11 space-y-4">
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
              
              {/* Age Range Slider Visual */}
              <div className="bg-dark-300/30 rounded-lg p-3">
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>18</span>
                  <span>65</span>
                </div>
                <div className="h-2 bg-dark-400 rounded-full relative">
                  <div 
                    className="absolute h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                    style={{
                      left: `${((filters.minAge || 18) - 18) / 47 * 100}%`,
                      width: `${((filters.maxAge || 65) - (filters.minAge || 18)) / 47 * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Physical Attributes */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('physical')}
            className="flex items-center justify-between w-full text-left group"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-500/20 transition-colors">
                <span className="text-lg">✨</span>
              </div>
              <span className="text-white font-semibold">Physical Attributes</span>
            </div>
            <ChevronDown 
              size={18} 
              className={`text-gray-400 transition-all duration-200 ${expandedSections.physical ? 'rotate-180 text-primary-400' : ''}`}
            />
          </button>
          
          {expandedSections.physical && (
            <div className="ml-11 space-y-4">
              {/* Hair Color */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Hair Color</label>
                <div className="grid grid-cols-2 gap-2">
                  {hairColors.map(({ value, emoji }) => (
                    <button
                      key={value}
                      onClick={() => updateFilter('hairColor', filters.hairColor === value ? undefined : value)}
                      className={`flex items-center p-2.5 rounded-lg text-sm transition-all duration-200 border ${
                        filters.hairColor === value
                          ? 'bg-primary-500/20 border-primary-500/50 text-primary-300'
                          : 'bg-dark-300/30 border-dark-100/30 hover:bg-dark-300/50 text-gray-300'
                      }`}
                    >
                      <span className="mr-2">{emoji}</span>
                      <span className="font-medium">{value}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Eye Color */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Eye Color</label>
                <div className="grid grid-cols-2 gap-2">
                  {eyeColors.map(({ value, emoji }) => (
                    <button
                      key={value}
                      onClick={() => updateFilter('eyeColor', filters.eyeColor === value ? undefined : value)}
                      className={`flex items-center p-2.5 rounded-lg text-sm transition-all duration-200 border ${
                        filters.eyeColor === value
                          ? 'bg-primary-500/20 border-primary-500/50 text-primary-300'
                          : 'bg-dark-300/30 border-dark-100/30 hover:bg-dark-300/50 text-gray-300'
                      }`}
                    >
                      <span className="mr-2">{emoji}</span>
                      <span className="font-medium">{value}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Body Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Body Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {bodyTypes.map(({ value, emoji }) => (
                    <button
                      key={value}
                      onClick={() => updateFilter('bodyType', filters.bodyType === value ? undefined : value)}
                      className={`flex items-center p-2.5 rounded-lg text-sm transition-all duration-200 border ${
                        filters.bodyType === value
                          ? 'bg-primary-500/20 border-primary-500/50 text-primary-300'
                          : 'bg-dark-300/30 border-dark-100/30 hover:bg-dark-300/50 text-gray-300'
                      }`}
                    >
                      <span className="mr-2">{emoji}</span>
                      <span className="font-medium">{value}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4">
            <h4 className="text-primary-300 font-medium mb-2 flex items-center">
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