import React, { useEffect, useState } from 'react';
import ModelCard from '../components/ui/ModelCard';
import SearchInput from '../components/ui/SearchInput';
import FilterPanel from '../components/ui/FilterPanel';
import AgeVerificationModal from '../components/ui/AgeVerificationModal';
import Pagination from '../components/ui/pagination';
import { modelsApi, ageVerificationApi } from '../services/api';
import { Flame, TrendingUp, Clock, Search, Filter, X, Users } from 'lucide-react';
import type { Model, SortOption, FilterOptions } from '../types';
import { useAuthStore } from '../store/authStore';
import { linkvertise } from '../components/Linkvertise/Linkvertise';


const ITEMS_PER_PAGE = 24;

const Models: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showFilters, setShowFilters] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const { fetchUser } = useAuthStore();

      useEffect(() =>{
        linkvertise("1329936", { whitelist: ["mega.nz"] });
      },[])

  useEffect(() => {
    window.scrollTo(0, 0);
    checkAgeVerification();
  }, []);

  const checkAgeVerification = async () => {
    const ageConfirmed = sessionStorage.getItem('ageConfirmed');
    if (ageConfirmed !== 'true') {
      try {
        const status = await ageVerificationApi.getStatus();
        if (!status.ageConfirmed) {
          setShowAgeVerification(true);
          return;
        }
      } catch (error) {
        setShowAgeVerification(true);
        return;
      }
    }
    loadModels();
  };

  const loadModels = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sortBy: sortOption,
        search: searchQuery || undefined,
        ...filters
      };

      const response = await modelsApi.getAll(params);
      setModels(response.models || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.totalItems || 0);
    } catch (error) {
      console.error('Error loading models:', error);
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!showAgeVerification) {
      loadModels();
    }
  }, [currentPage, sortOption, searchQuery, filters, showAgeVerification]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAgeVerificationConfirm = () => {
    setShowAgeVerification(false);
    loadModels();
  };

  const handleAgeVerificationExit = () => {
    window.location.href = 'https://www.google.com';
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key as keyof FilterOptions] !== undefined && 
    filters[key as keyof FilterOptions] !== ''
  );

  return (
    <>
      <AgeVerificationModal
        isOpen={showAgeVerification}
        onConfirm={handleAgeVerificationConfirm}
        onExit={handleAgeVerificationExit}
      />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-20 lg:pt-28 pb-16 lg:pb-24">
          <div className="absolute inset-0 bg-gradient-to-br from-dark-400 via-dark-300 to-dark-400 z-[-1]"></div>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white animate-fade-in">
                <span className="text-primary-500">Premium</span> Models
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 animate-fade-in-up">
                Discover exclusive content from the world's most beautiful models
              </p>
              <div className="flex items-center justify-center mb-8 text-gray-400 animate-fade-in-up delay-200">
                <Users className="w-5 h-5 mr-2 text-primary-500" />
                <p>Explore {totalItems} verified models from around the world</p>
              </div>
            </div>
          </div>
        </section>

        {/* Models Grid */}
        <section className="py-12 bg-dark-300">
          <div className="container mx-auto px-4">
            {/* Search and Filters */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search models by name..."
                  />
                </div>
              </div>
              
              {/* Inline Filters */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
                <select
                  value={filters.ethnicity || ''}
                  onChange={(e) => setFilters({ ...filters, ethnicity: e.target.value || undefined })}
                  className="px-4 py-2 bg-dark-200 border border-dark-100 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">🌍 All Ethnicities</option>
                  <option value="arab">🏺 Arab</option>
                  <option value="asian">🏮 Asian</option>
                  <option value="ebony">🌟 Ebony</option>
                  <option value="indian">🪔 Indian</option>
                  <option value="latina">🌶️ Latina</option>
                  <option value="white">❄️ White</option>
                </select>

                <select
                  value={filters.hairColor || ''}
                  onChange={(e) => setFilters({ ...filters, hairColor: e.target.value || undefined })}
                  className="px-4 py-2 bg-dark-200 border border-dark-100 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">💇‍♀️ Hair Color</option>
                  <option value="Blonde">👱‍♀️ Blonde</option>
                  <option value="Brunette">👩‍🦱 Brunette</option>
                  <option value="Black">🖤 Black</option>
                  <option value="Red">🔥 Red</option>
                  <option value="Auburn">🍂 Auburn</option>
                </select>

                <select
                  value={filters.bodyType || ''}
                  onChange={(e) => setFilters({ ...filters, bodyType: e.target.value || undefined })}
                  className="px-4 py-2 bg-dark-200 border border-dark-100 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">💪 Body Type</option>
                  <option value="Slim">🌟 Slim</option>
                  <option value="Athletic">💪 Athletic</option>
                  <option value="Average">⚖️ Average</option>
                  <option value="Curvy">🍑 Curvy</option>
                  <option value="Plus Size">💖 Plus Size</option>
                </select>

                <input
                  type="number"
                  min="18"
                  max="65"
                  value={filters.minAge || ''}
                  onChange={(e) => setFilters({ ...filters, minAge: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="🎂 Min Age"
                  className="px-4 py-2 bg-dark-200 border border-dark-100 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />

                <input
                  type="number"
                  min="18"
                  max="65"
                  value={filters.maxAge || ''}
                  onChange={(e) => setFilters({ ...filters, maxAge: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="🎂 Max Age"
                  className="px-4 py-2 bg-dark-200 border border-dark-100 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />

                {(searchQuery || hasActiveFilters) && (
                  <button
                    onClick={clearSearch}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-200 border border-red-500/30 text-sm font-medium"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>
              
              {/* Results Info and Sort */}
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="mb-4 sm:mb-0">
                  <h2 className="text-2xl font-bold text-white">
                    {searchQuery ? 'Search Results' : 'Featured'} <span className="text-primary-500">Models</span>
                  </h2>
                  {searchQuery && (
                    <p className="text-gray-400 mt-1">
                      Found {totalItems} result{totalItems !== 1 ? 's' : ''} for "{searchQuery}"
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSortOption('recent')}
                    className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200 ${
                      sortOption === 'recent'
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-200 text-gray-400 hover:bg-dark-100'
                    }`}
                  >
                    <Clock size={16} className="mr-2" />
                    Recent
                  </button>
                  <button
                    onClick={() => setSortOption('popular')}
                    className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200 ${
                      sortOption === 'popular'
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-200 text-gray-400 hover:bg-dark-100'
                    }`}
                  >
                    <TrendingUp size={16} className="mr-2" />
                    Popular
                  </button>
                </div>
              </div>
            </div>
            
            {/* Models Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 min-h-[300px]">
              {isLoading ? (
                Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-[3/4] bg-dark-200 rounded-lg animate-pulse"
                  />
                ))
              ) : models.length > 0 ? (
                models.map((model) => (
                  <ModelCard key={model.id} model={model} />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <Search size={48} className="text-gray-600 mb-4" />
                  <p className="text-gray-400 text-xl">
                    {searchQuery || hasActiveFilters 
                      ? 'No models found matching your criteria' 
                      : 'No models available'
                    }
                  </p>
                  {(searchQuery || hasActiveFilters) && (
                    <button 
                      onClick={clearSearch}
                      className="mt-4 text-primary-500 hover:text-primary-400 transition-colors"
                    >
                      Clear search and filters
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="mt-8"
              />
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default Models;