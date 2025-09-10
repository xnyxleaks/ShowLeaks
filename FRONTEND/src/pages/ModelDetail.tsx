import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import ReportModal from '../components/ui/ReportModal';
import FilterPanel from '../components/ui/FilterPanel';
import SearchInput from '../components/ui/SearchInput';
import Pagination from '../components/ui/pagination';
import { 
  ArrowLeft, 
  Share2, 
  MoreVertical, 
  Eye, 
  Calendar,
  Ruler,
  Weight,
  User,
  Flag,
  X,
  Clock,
  TrendingUp,
  Filter
} from 'lucide-react';
import type { Model, Content, FilterOptions, SortOption } from '../types';
import { modelsApi, contentApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

const ITEMS_PER_PAGE = 12;

const ModelDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [model, setModel] = useState<Model | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchModelData = async () => {
      try {
        const modelData = await modelsApi.getBySlug(slug!);
        setModel(modelData);
      } catch (error) {
        console.error('Error loading model:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchModelData();
  }, [slug, navigate]);

  useEffect(() => {
    if (model) loadContents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, currentPage, sortOption, searchQuery, filters]);

  const loadContents = async () => {
    if (!model) return;
    setContentLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sortBy: sortOption,
        search: searchQuery || undefined,
        ...filters
      };
      const response = await contentApi.getByModel(model.id, params);
      setContents(response.contents || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.totalItems || 0);
    } catch (error) {
      console.error('Error loading contents:', error);
      setContents([]);
    } finally {
      setContentLoading(false);
    }
  };

  const handleBack = () => navigate('/');

  const handleShare = async () => {
    const shareData = {
      title: model?.name,
      text: `Check out ${model?.name} on our platform`,
      url: window.location.href
    };
    if (navigator.share && navigator.canShare(shareData)) {
      try { await navigator.share(shareData); } catch { /* cancelado */ }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
    setShowDropdown(false);
  };

  const formatViews = (views: number) =>
    new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(views);

  const getEthnicityLabel = (ethnicity?: string) => {
    const labels = {
      arab: 'Arab',
      asian: 'Asian',
      ebony: 'Ebony',
      indian: 'Indian',
      latina: 'Latina',
      white: 'White'
    } as const;
    return ethnicity ? labels[ethnicity as keyof typeof labels] : 'Not specified';
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => 
    (filters as any)[key] !== undefined && (filters as any)[key] !== ''
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const handleContentDetail = (contentId: number) => {
    navigate(`/content/${contentId}`);
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-300">
        <div className="animate-pulse text-primary-500 font-semibold text-xl">Loading model...</div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-300">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Model not found</h2>
          <Button onClick={handleBack}>Return to Gallery</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="pt-20 min-h-screen bg-dark-300">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-400 hover:text-primary-500 transition-colors mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span>Back to Gallery</span>
          </button>

          {/* Grid pai: duas colunas no desktop, 360px para a imagem; conteúdo pode ocupar as duas colunas abaixo */}
          <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-8">
            {/* Imagem — col 1, linha 1 */}
            <div className="lg:col-start-1 lg:row-start-1">
              <div className="sticky top-24">
                <div className="overflow-hidden rounded-lg bg-dark-200 shadow-lg relative">
                  <img
                    src={model.photoUrl}
                    alt={model.name}
                    className="w-full h-auto object-cover"
                  />

                  {/* Ações sobre a imagem */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <div className="relative">
                      <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-dark-200 rounded-lg shadow-lg overflow-hidden z-10">
                          <button
                            onClick={handleShare}
                            className="w-full px-4 py-3 text-left text-gray-300 hover:bg-dark-100 flex items-center"
                          >
                            <Share2 size={16} className="mr-2" />
                            Share Profile
                          </button>
                          <button
                            onClick={() => { setShowReportModal(true); setShowDropdown(false); }}
                            className="w-full px-4 py-3 text-left text-gray-300 hover:bg-dark-100 flex items-center"
                          >
                            <Flag size={16} className="mr-2" />
                            Report Model
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estatísticas sobre a imagem */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center">
                          <Eye size={16} className="mr-2 text-primary-500" />
                          <span className="font-medium">{formatViews(model.views)} views</span>
                        </div>
                        {model.ethnicity && (
                          <span className="px-2 py-1 bg-primary-500/80 text-xs font-medium rounded-full">
                            {getEthnicityLabel(model.ethnicity)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cabeçalho — col 2, linha 1 */}
            <div className="lg:col-start-2 lg:row-start-1">
              <div className="bg-dark-200 rounded-lg shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0">
                    <h1 className="text-3xl font-bold text-white mb-2">{model.name}</h1>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400">
                      <span>Added {new Date(model.createdAt).toLocaleDateString()}</span>
                      <div className="flex items-center">
                        <Eye size={16} className="mr-1 text-primary-500" />
                        <span>{formatViews(model.views)} views</span>
                      </div>
                      {typeof model.age === 'number' && (
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-1 text-primary-500" />
                          <span>{model.age} years</span>
                        </div>
                      )}
                      {model.height && (
                        <div className="flex items-center">
                          <Ruler size={16} className="mr-1 text-primary-500" />
                          <span>{model.height} cm</span>
                        </div>
                      )}
                      {model.weight && (
                        <div className="flex items-center">
                          <Weight size={16} className="mr-1 text-primary-500" />
                          <span>{model.weight} kg</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {model.birthPlace && (
                        <span className="px-2 py-1 rounded-md bg-dark-300 text-gray-300 text-xs">
                          Born: {model.birthPlace}
                        </span>
                      )}
                      {model.eyeColor && (
                        <span className="px-2 py-1 rounded-md bg-dark-300 text-gray-300 text-xs">
                          Eyes: {model.eyeColor}
                        </span>
                      )}
                      {model.hairColor && (
                        <span className="px-2 py-1 rounded-md bg-dark-300 text-gray-300 text-xs">
                          Hair: {model.hairColor}
                        </span>
                      )}
                      {model.bodyType && (
                        <span className="px-2 py-1 rounded-md bg-dark-300 text-gray-300 text-xs">
                          Body: {model.bodyType}
                        </span>
                      )}
                      {model.bustSize && (
                        <span className="px-2 py-1 rounded-md bg-dark-300 text-gray-300 text-xs">
                          Bust: {model.bustSize}
                        </span>
                      )}
                      {model.orientation && (
                        <span className="px-2 py-1 rounded-md bg-dark-300 text-gray-300 text-xs">
                          Orientation: {model.orientation}
                        </span>
                      )}
                      {model.ethnicity && (
                        <span className="px-2 py-1 rounded-md bg-dark-300 text-gray-300 text-xs">
                          Ethnicity: {getEthnicityLabel(model.ethnicity)}
                        </span>
                      )}
                      {model.tags && model.tags.length > 0 && (
                        <span className="px-2 py-1 rounded-md bg-dark-300 text-gray-300 text-xs">
                          {model.tags.length} tags
                        </span>
                      )}
                    </div>

                    {model.bio && (
                      <p className="text-gray-300 leading-relaxed mt-4">
                        {model.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* CONTEÚDOS — col-span-2 no desktop, linha 2. Fica mais largo também no mobile. */}
            <div className="lg:col-span-2 lg:row-start-2">
              <div className="bg-dark-200 rounded-lg shadow-lg p-6">
                {/* Header de filtros */}
                <div className="mb-6">
                  <div className="flex flex-col lg:flex-row gap-4 mb-4">
                    <div className="flex-1">
                      <SearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search content..."
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200 ${
                          showFilters || hasActiveFilters
                            ? 'bg-primary-500 text-white'
                            : 'bg-dark-300 text-gray-400 hover:bg-dark-100'
                        }`}
                      >
                        <Filter size={16} className="mr-2" />
                        Filters
                        {hasActiveFilters && (
                          <span className="ml-2 bg-white/20 text-xs px-2 py-1 rounded-full">
                            {Object.keys(filters).filter(key => (filters as any)[key]).length}
                          </span>
                        )}
                      </button>

                      {(searchQuery || hasActiveFilters) && (
                        <button
                          onClick={clearSearch}
                          className="px-3 py-2 text-gray-400 hover:text-white hover:bg-dark-300 rounded-lg transition-all duration-200"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {showFilters && (
                    <div className="mb-4">
                      <FilterPanel
                        filters={filters}
                        onFiltersChange={setFilters}
                        onClose={() => setShowFilters(false)}
                      />
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div className="mb-4 sm:mb-0">
                      <h3 className="text-xl font-semibold text-white">
                        Content ({totalItems})
                      </h3>
                      {searchQuery && (
                        <p className="text-gray-400 text-sm mt-1">
                          Found {totalItems} result{totalItems !== 1 ? 's' : ''} for "{searchQuery}"
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSortOption('recent')}
                        className={`px-3 py-1.5 rounded-lg flex items-center text-sm transition-all duration-200 ${
                          sortOption === 'recent'
                            ? 'bg-primary-500 text-white'
                            : 'bg-dark-300 text-gray-400 hover:bg-dark-100'
                        }`}
                      >
                        <Clock size={14} className="mr-1" />
                        Recent
                      </button>
                      <button
                        onClick={() => setSortOption('popular')}
                        className={`px-3 py-1.5 rounded-lg flex items-center text-sm transition-all duration-200 ${
                          sortOption === 'popular'
                            ? 'bg-primary-500 text-white'
                            : 'bg-dark-300 text-gray-400 hover:bg-dark-100'
                        }`}
                      >
                        <TrendingUp size={14} className="mr-1" />
                        Popular
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grid de conteúdos: 1 col no mobile, 2 no sm, 3 no md, 4 no lg; cards com aspecto mais alto no mobile */}
                {contentLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                      <div key={index} className="aspect-[3/4] sm:aspect-[4/5] bg-dark-300 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : contents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {contents.map((content) => (
                      <div
                        key={content.id}
                        onClick={() => handleContentDetail(content.id)}
                        className="group relative aspect-[3/4] sm:aspect-[4/5] bg-dark-300 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                      >
                        {content.thumbnailUrl ? (
                          <img
                            src={content.thumbnailUrl}
                            alt={content.title}
                            className="w-full h-full object-cover object-center"
                          />
                        ) : (
                          <>
                          </>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />


                        <div className="absolute top-2 right-2">
                          <div className="flex items-center px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                            <Eye size={12} className="text-primary-400 mr-1" />
                            <span className="text-white text-xs font-medium">{formatViews(content.views)}</span>
                          </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h4 className="text-white text-sm font-medium mb-1 line-clamp-2">{content.title}</h4>
                          <div className="flex items-center justify-between text-xs text-gray-300">
                            <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                            {content.tags && content.tags.length > 0 && (
                              <span className="bg-dark-300/50 px-2 py-1 rounded">
                                {content.tags.length} tag{content.tags.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-6xl mb-4">📄</div>
                    <p className="text-lg">
                      {searchQuery || hasActiveFilters 
                        ? 'No content found matching your criteria' 
                        : 'No content available for this model yet.'
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

                {/* Paginação */}
                {totalPages > 1 && (
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    className="mt-6"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        modelId={model?.id}
        title={model?.name || 'Model'}
      />
    </>
  );
};

export default ModelDetail;
