import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchInput from '../components/ui/SearchInput';
import AgeVerificationModal from '../components/ui/AgeVerificationModal';
import Pagination from '../components/ui/pagination';
import { modelsApi, ageVerificationApi } from '../services/api';
import { 
  Flame, 
  TrendingUp, 
  Clock, 
  Search, 
  Play,
  Image as ImageIcon,
  Eye,
  Calendar,
  User
} from 'lucide-react';
import type { Model, SortOption } from '../types';
import { useAuthStore } from '../store/authStore';

const ITEMS_PER_PAGE = 12;

const Home: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const { fetchUser } = useAuthStore();

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
        search: searchQuery || undefined
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
  }, [currentPage, sortOption, searchQuery, showAgeVerification]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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

  const formatViews = (views: number) => {
    return new Intl.NumberFormat('en-US', { 
      notation: 'compact',
      maximumFractionDigits: 1 
    }).format(views);
  };

  const getEthnicityLabel = (ethnicity?: string) => {
    const labels = {
      arab: 'Arab',
      asian: 'Asian',
      ebony: 'Ebony',
      indian: 'Indian',
      latina: 'Latina',
      white: 'White'
    };
    return ethnicity ? labels[ethnicity as keyof typeof labels] : '';
  };

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
                Featured <span className="text-primary-500">Models</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 animate-fade-in-up">
                Discover exclusive content from the world's most beautiful models
              </p>
              <div className="flex items-center justify-center mb-8 text-gray-400 animate-fade-in-up delay-200">
                <Flame className="w-5 h-5 mr-2 text-primary-500" />
                <p>Explore {totalItems} verified models from around the world</p>
              </div>
              
              {/* Quick Navigation */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-200">
                <Link
                  to="/models"
                  className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center"
                >
                  <User size={18} className="mr-2" />
                  Browse All Models
                </Link>
                <Link
                  to="/premium"
                  className="px-6 py-3 bg-dark-200 hover:bg-dark-100 text-gray-300 font-medium rounded-lg transition-all duration-200 border border-dark-100"
                >
                  Go Premium
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Models Grid */}
        <section className="py-12 bg-dark-300">
          <div className="container mx-auto px-4">
            {/* Search and Controls */}
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
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 min-h-[800px]">
              {isLoading ? (
                Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-[3/4] bg-dark-200 rounded-lg animate-pulse"
                  />
                ))
              ) : models.length > 0 ? (
                models.map((model) => (
                  <a 
                    key={model.id}
                    href={`#/model/${model.slug}`} 
                    className="group block overflow-hidden bg-dark-200 rounded-lg shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img 
                        src={model.photoUrl} 
                        alt={model.name} 
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-dark-300/90"></div>
                      
                      {/* Ethnicity Badge */}
                      {model.ethnicity && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 bg-primary-500/80 text-white text-xs font-medium rounded-full">
                            {getEthnicityLabel(model.ethnicity)}
                          </span>
                        </div>
                      )}
                      
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-semibold text-lg text-white group-hover:text-primary-400 transition-colors mb-2">
                          {model.name}
                        </h3>
                        
                        <div className="space-y-1 mb-3">
                          {model.age && (
                            <div className="flex items-center text-xs text-gray-300">
                              <Calendar size={12} className="mr-1 text-primary-500" />
                              <span>{model.age} years old</span>
                            </div>
                          )}
                          
                          {model.birthPlace && (
                            <div className="flex items-center text-xs text-gray-300">
                              <User size={12} className="mr-1 text-primary-500" />
                              <span>{model.birthPlace}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-300">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                              <Eye size={14} className="mr-1 text-primary-500" />
                              <span>{formatViews(model.views)}</span>
                            </div>
                            
                            {model.tags && model.tags.length > 0 && (
                              <div className="flex items-center">
                                <span className="text-xs bg-dark-300/50 px-2 py-1 rounded">
                                  {model.tags.length} tag{model.tags.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-400">
                            {new Date(model.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <Search size={48} className="text-gray-600 mb-4" />
                  <p className="text-gray-400 text-xl">
                    {searchQuery 
                      ? 'No models found matching your search' 
                      : 'No models available'
                    }
                  </p>
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="mt-4 text-primary-500 hover:text-primary-400 transition-colors"
                    >
                      Clear search
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

export default Home;