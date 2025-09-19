import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import ReportModal from '../components/ui/ReportModal';
import FilterPanel from '../components/ui/FilterPanel';
import SearchInput from '../components/ui/SearchInput';
import Pagination from '../components/ui/pagination';
import CommentSection from '../components/ui/CommentSection';
import LikeButton from '../components/ui/LikeButton';
import { 
  ArrowLeft, 
  Share2, 
  MoreVertical, 
  Eye, 
  Calendar,
  Ruler,
  Weight,
  MapPin,
  Heart,
  Star,
  Music,
  Users,
  Crown,
  Zap,
  Camera,
  User,
  Flag,
  X,
  Clock,
  TrendingUp,
  Filter,
  Play,
  Image as ImageIcon,
  Video,
  HardDrive
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

  const getTagIcon = (tag: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      'PROFESSION_INFLUENCER': <Star size={16} className="text-yellow-500" />,
      'PROFESSION_PORN_STAR': <Crown size={16} className="text-red-500" />,
      'PROFESSION_TIKTOK_STAR': <Music size={16} className="text-pink-500" />,
      'PROFESSION_COSPLAYER': <Users size={16} className="text-purple-500" />,
      'PROFESSION_CHEERLEADER': <Star size={16} className="text-blue-500" />,
      'PROFESSION_GAMER': <Zap size={16} className="text-green-500" />,
      'CATEGORY_MASTURBATION': <Heart size={16} className="text-red-400" />,
      'CATEGORY_KISSING': <Heart size={16} className="text-pink-400" />,
      'CATEGORY_BOOBS_TOUCHING': <Heart size={16} className="text-orange-400" />,
      'CATEGORY_BOOBS_LICKING': <Heart size={16} className="text-red-400" />,
      'CATEGORY_FINGERING': <Heart size={16} className="text-purple-400" />,
      'CATEGORY_DILDO': <Zap size={16} className="text-blue-400" />,
      'CATEGORY_ORAL': <Heart size={16} className="text-green-400" />,
      'CATEGORY_BLOWJOB': <Heart size={16} className="text-indigo-400" />,
      'CATEGORY_VAGINAL': <Heart size={16} className="text-pink-400" />,
      'CATEGORY_DILDO_BLOWJOB': <Zap size={16} className="text-cyan-400" />
    };
    return iconMap[tag] || <Star size={16} className="text-gray-400" />;
  };

  const formatTagName = (tag: string) => {
    return tag
      .replace('PROFESSION_', '')
      .replace('CATEGORY_', '')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
      <main className="min-h-screen bg-dark-300">
        {/* Hero Section with Background Image */}
        <div className="relative">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${model.photoUrl})`,
              filter: 'blur(20px)',
              transform: 'scale(1.1)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-dark-300" />
          
          {/* Content */}
          <div className="relative pt-20 pb-16">
            <div className="container mx-auto px-4">
              {/* Back Button */}
              <button
                onClick={handleBack}
                className="flex items-center text-white/80 hover:text-white transition-colors mb-8 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full"
              >
                <ArrowLeft size={20} className="mr-2" />
                <span>Back to Gallery</span>
              </button>

              {/* Profile Header */}
              <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8 mb-12">
                {/* Profile Image */}
                <div className="relative">
                  <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/20 backdrop-blur-sm">
                    <img
                      src={model.photoUrl}
                      alt={model.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Floating Stats */}
                  <div className="absolute -bottom-4 -right-4 bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center text-white">
                      <Eye size={18} className="mr-2 text-primary-400" />
                      <span className="font-bold text-lg">{formatViews(model.views)}</span>
                      <span className="text-sm text-gray-300 ml-1">views</span>
                    </div>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="mb-6">
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                      {model.name}
                    </h1>
                    
                    {/* Quick Info */}
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-white/90 mb-4">
                      {(model.age || model.birthDate) && (
                        <div className="flex items-center bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <Calendar size={16} className="mr-2 text-primary-400" />
                          <span className="font-medium">{model.age || calculateAge(model.birthDate)} years</span>
                        </div>
                      )}
                      
                      {(model.placeOfBirth || model.birthPlace) && (
                        <div className="flex items-center bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <MapPin size={16} className="mr-2 text-primary-400" />
                          <span className="font-medium">{model.placeOfBirth || model.birthPlace}</span>
                        </div>
                      )}
                      
                      {model.ethnicity && (
                        <div className="flex items-center bg-primary-500/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <span className="font-medium text-white">{getEthnicityLabel(model.ethnicity)}</span>
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    {model.bio && (
                      <p className="text-lg text-white/90 leading-relaxed max-w-2xl drop-shadow-sm">
                        {model.bio}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                    <LikeButton
                      modelId={model.id}
                      type="model"
                      initialLikes={0}
                      initialIsLiked={false}
                      size="lg"
                    />
                    
                    <button
                      onClick={handleShare}
                      className="flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl transition-all duration-200 border border-white/20"
                    >
                      <Share2 size={18} className="mr-2" />
                      Share Profile
                    </button>
                    
                    <div className="relative">
                      <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl transition-all duration-200 border border-white/20"
                      >
                        <MoreVertical size={18} />
                      </button>
                      
                      {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-dark-200 rounded-xl shadow-xl overflow-hidden z-10 border border-dark-100">
                          <button
                            onClick={() => { setShowReportModal(true); setShowDropdown(false); }}
                            className="w-full px-4 py-3 text-left text-gray-300 hover:bg-dark-100 flex items-center transition-colors"
                          >
                            <Flag size={16} className="mr-2" />
                            Report Model
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Model Details Section */}
        <div className="bg-dark-300 relative">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Model Information Cards */}
              <div className="lg:col-span-1 space-y-6">
                {/* Physical Attributes */}
                <div className="bg-gradient-to-br from-dark-200 to-dark-100 rounded-2xl p-6 border border-dark-100/50 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <User size={20} className="mr-3 text-primary-500" />
                    Physical Attributes
                  </h3>
                  
                  <div className="space-y-4">
                    {model.height && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-400">
                          <Ruler size={16} className="mr-2 text-primary-500" />
                          <span>Height</span>
                        </div>
                        <span className="text-white font-medium">{model.height} cm</span>
                      </div>
                    )}
                    
                    {model.weight && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-400">
                          <Weight size={16} className="mr-2 text-primary-500" />
                          <span>Weight</span>
                        </div>
                        <span className="text-white font-medium">{model.weight} kg</span>
                      </div>
                    )}
                    
                    {model.hairColor && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Hair</span>
                        <span className="text-white font-medium">{model.hairColor}</span>
                      </div>
                    )}
                    
                    {model.eyeColor && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Eyes</span>
                        <span className="text-white font-medium">{model.eyeColor}</span>
                      </div>
                    )}
                    
                    {model.bodyType && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Body Type</span>
                        <span className="text-white font-medium">{model.bodyType}</span>
                      </div>
                    )}
                    
                    {model.boobsType && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Boobs Type</span>
                        <span className="text-white font-medium">{model.boobsType}</span>
                      </div>
                    )}
                    
                    {model.cupSize && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Cup Size</span>
                        <span className="text-white font-medium">{model.cupSize}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Personal Info */}
                <div className="bg-gradient-to-br from-dark-200 to-dark-100 rounded-2xl p-6 border border-dark-100/50 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <Heart size={20} className="mr-3 text-primary-500" />
                    Personal Info
                  </h3>
                  
                  <div className="space-y-4">
                    {model.sexuality && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Sexuality</span>
                        <span className="text-white font-medium">{model.sexuality}</span>
                      </div>
                    )}
                    
                    {model.orientation && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Orientation</span>
                        <span className="text-white font-medium">{model.orientation}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Joined</span>
                      <span className="text-white font-medium">
                        {new Date(model.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                {model.tags && model.tags.length > 0 && (
                  <div className="bg-gradient-to-br from-dark-200 to-dark-100 rounded-2xl p-6 border border-dark-100/50 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                      <Star size={20} className="mr-3 text-primary-500" />
                      Specialties
                    </h3>
                    
                    <div className="space-y-3">
                      {model.tags.map((tag, index) => (
                        <div key={index} className="flex items-center bg-gradient-to-r from-primary-500/10 to-primary-600/10 border border-primary-500/20 px-4 py-3 rounded-xl">
                          {getTagIcon(tag)}
                          <span className="text-white font-medium ml-3">
                            {formatTagName(tag)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="lg:col-span-3">
                <div className="bg-gradient-to-br from-dark-200 to-dark-100 rounded-2xl p-6 border border-dark-100/50 shadow-xl">
                  {/* Content Header */}
                  <div className="mb-8">
                    <div className="flex flex-col lg:flex-row gap-6 mb-6">
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
                          className={`px-6 py-3 rounded-xl flex items-center transition-all duration-200 font-medium ${
                            showFilters || hasActiveFilters
                              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                              : 'bg-dark-300 text-gray-400 hover:bg-dark-100 hover:text-white'
                          }`}
                        >
                          <Filter size={18} className="mr-2" />
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
                            className="px-4 py-3 text-gray-400 hover:text-white hover:bg-dark-300 rounded-xl transition-all duration-200"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    </div>

                    {showFilters && (
                      <div className="mb-6 animate-fade-in-up">
                        <FilterPanel
                          filters={filters}
                          onFiltersChange={setFilters}
                          onClose={() => setShowFilters(false)}
                        />
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-center">
                      <div className="mb-4 sm:mb-0">
                        <h2 className="text-3xl font-bold text-white">
                          Content <span className="text-primary-500">({totalItems})</span>
                        </h2>
                        {searchQuery && (
                          <p className="text-gray-400 mt-1">
                            Found {totalItems} result{totalItems !== 1 ? 's' : ''} for "{searchQuery}"
                          </p>
                        )}
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => setSortOption('recent')}
                          className={`px-4 py-2 rounded-xl flex items-center transition-all duration-200 ${
                            sortOption === 'recent'
                              ? 'bg-primary-500 text-white shadow-lg'
                              : 'bg-dark-300 text-gray-400 hover:bg-dark-100'
                          }`}
                        >
                          <Clock size={16} className="mr-2" />
                          Recent
                        </button>
                        <button
                          onClick={() => setSortOption('popular')}
                          className={`px-4 py-2 rounded-xl flex items-center transition-all duration-200 ${
                            sortOption === 'popular'
                              ? 'bg-primary-500 text-white shadow-lg'
                              : 'bg-dark-300 text-gray-400 hover:bg-dark-100'
                          }`}
                        >
                          <TrendingUp size={16} className="mr-2" />
                          Popular
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Content Grid */}
                  {contentLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                        <div key={index} className="aspect-[4/5] bg-dark-300 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : contents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {contents.map((content) => (
                        <div
                          key={content.id}
                          onClick={() => handleContentDetail(content.id)}
                          className="group relative aspect-[4/5] bg-dark-300 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
                        >
                          {content.thumbnailUrl ? (
                            <img
                              src={content.thumbnailUrl}
                              alt={content.title}
                              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center">
                              <Play size={48} className="text-primary-400" />
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />

                          {/* Content Info Badges */}
                          <div className="absolute top-3 right-3 flex flex-col gap-2">
                            {content.info?.images && content.info.images > 0 && (
                              <div className="flex items-center px-2 py-1 bg-blue-500/80 backdrop-blur-sm rounded-full">
                                <ImageIcon size={12} className="text-white mr-1" />
                                <span className="text-white text-xs font-medium">{content.info.images}</span>
                              </div>
                            )}
                            {content.info?.videos && content.info.videos > 0 && (
                              <div className="flex items-center px-2 py-1 bg-red-500/80 backdrop-blur-sm rounded-full">
                                <Video size={12} className="text-white mr-1" />
                                <span className="text-white text-xs font-medium">{content.info.videos}</span>
                              </div>
                            )}
                            {content.info?.size && content.info.size > 0 && (
                              <div className="flex items-center px-2 py-1 bg-green-500/80 backdrop-blur-sm rounded-full">
                                <HardDrive size={12} className="text-white mr-1" />
                                <span className="text-white text-xs font-medium">{formatFileSize(content.info.size)}</span>
                              </div>
                            )}
                          </div>

                          {/* Views Badge */}
                          <div className="absolute top-3 left-3">
                            <div className="flex items-center px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                              <Eye size={12} className="text-primary-400 mr-1" />
                              <span className="text-white text-xs font-medium">{formatViews(content.views)}</span>
                            </div>
                          </div>

                          {/* Content Info */}
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h4 className="text-white text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
                              {content.title}
                            </h4>
                            
                            <div className="flex items-center justify-between text-sm text-gray-300">
                              <span className="text-xs">
                                {new Date(content.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                              
                              {content.tags && content.tags.length > 0 && (
                                <span className="bg-primary-500/20 px-2 py-1 rounded-full text-xs text-primary-300">
                                  {content.tags.length} tag{content.tags.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div className="w-24 h-24 bg-dark-300/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Camera size={32} className="text-gray-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">No Content Yet</h3>
                      <p className="text-gray-400 text-lg">
                        {searchQuery || hasActiveFilters 
                          ? 'No content found matching your criteria' 
                          : 'This model hasn\'t uploaded any content yet.'
                        }
                      </p>
                      {(searchQuery || hasActiveFilters) && (
                        <button 
                          onClick={clearSearch}
                          className="mt-4 text-primary-500 hover:text-primary-400 transition-colors font-medium"
                        >
                          Clear search and filters
                        </button>
                      )}
                    </div>
                  )}

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
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-dark-400 py-12">
          <div className="container mx-auto px-4">
            <CommentSection
              modelId={model.id}
              type="model"
            />
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