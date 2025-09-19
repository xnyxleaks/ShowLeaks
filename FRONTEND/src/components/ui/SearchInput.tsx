import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, X } from 'lucide-react';
import { modelsApi } from '../../services/api';
import type { Model } from '../../types';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  onModelSelect?: (model: Model) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  showSuggestions = true,
  onModelSelect
}) => {
  const [suggestions, setSuggestions] = useState<Model[]>([]);
  const [topModels, setTopModels] = useState<Model[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load top 5 models on component mount
  useEffect(() => {
    const loadTopModels = async () => {
      try {
        const response = await modelsApi.getAll({ 
          limit: 5, 
          sortBy: 'popular' 
        });
        setTopModels(response.models || []);
      } catch (error) {
        console.error('Error loading top models:', error);
      }
    };
    loadTopModels();
  }, []);

  // Search for models when user types
  useEffect(() => {
    const searchModels = async () => {
      if (value.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await modelsApi.getAll({ 
          search: value, 
          limit: 8 
        });
        setSuggestions(response.models || []);
      } catch (error) {
        console.error('Error searching models:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchModels, 300);
    return () => clearTimeout(debounceTimer);
  }, [value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputFocus = () => {
    if (showSuggestions) {
      setShowDropdown(true);
    }
  };

  const handleModelClick = (model: Model) => {
    if (onModelSelect) {
      onModelSelect(model);
    } else {
      onChange(model.name);
    }
    setShowDropdown(false);
  };

  const formatViews = (views: number) => {
    return new Intl.NumberFormat('en-US', { 
      notation: 'compact',
      maximumFractionDigits: 1 
    }).format(views);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={20} className="text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleInputFocus}
          className="w-full pl-12 pr-12 py-4 bg-gradient-to-r from-dark-200 to-dark-100 border border-dark-100/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-lg shadow-lg"
          placeholder={placeholder}
        />
        {value && (
          <button
            onClick={() => {
              onChange('');
              setSuggestions([]);
            }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Dropdown with suggestions */}
      {showSuggestions && showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-dark-200 to-dark-100 border border-dark-100/50 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-sm"
        >
          {/* Search Results */}
          {value.length >= 2 && (
            <div className="p-4 border-b border-dark-100/50">
              <div className="flex items-center mb-3">
                <Search size={16} className="text-primary-500 mr-2" />
                <h4 className="text-white font-semibold">Search Results</h4>
                {loading && (
                  <div className="ml-2 w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              
              {suggestions.length > 0 ? (
                <div className="space-y-2">
                  {suggestions.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => handleModelClick(model)}
                      className="w-full flex items-center p-3 hover:bg-dark-300/50 rounded-xl transition-all duration-200 group"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden mr-3 ring-2 ring-primary-500/20 group-hover:ring-primary-500/40 transition-all">
                        <img
                          src={model.photoUrl}
                          alt={model.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-white font-medium group-hover:text-primary-400 transition-colors">
                          {model.name}
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <span>{model.ethnicity}</span>
                          <span className="mx-2">•</span>
                          <div className="flex items-center">
                            <TrendingUp size={12} className="mr-1" />
                            <span>{formatViews(model.views)} views</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : !loading && (
                <div className="text-center py-4">
                  <p className="text-gray-400">No models found for "{value}"</p>
                </div>
              )}
            </div>
          )}

          {/* Top Models (shown when no search or empty search) */}
          {value.length < 2 && topModels.length > 0 && (
            <div className="p-4">
              <div className="flex items-center mb-3">
                <TrendingUp size={16} className="text-primary-500 mr-2" />
                <h4 className="text-white font-semibold">Top 5 Models</h4>
              </div>
              
              <div className="space-y-2">
                {topModels.map((model, index) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelClick(model)}
                    className="w-full flex items-center p-3 hover:bg-dark-300/50 rounded-xl transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center mr-3 text-primary-400 font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div className="w-12 h-12 rounded-xl overflow-hidden mr-3 ring-2 ring-primary-500/20 group-hover:ring-primary-500/40 transition-all">
                      <img
                        src={model.photoUrl}
                        alt={model.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-white font-medium group-hover:text-primary-400 transition-colors">
                        {model.name}
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <span>{model.ethnicity}</span>
                        <span className="mx-2">•</span>
                        <div className="flex items-center">
                          <TrendingUp size={12} className="mr-1" />
                          <span>{formatViews(model.views)} views</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;