import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import ReportModal from '../components/ui/ReportModal';
import { 
  ArrowLeft, 
  ExternalLink, 
  Share2, 
  MoreVertical, 
  Eye, 
  Calendar,
  User,
  Flag,
  Download,
  Play,
  Image as ImageIcon
} from 'lucide-react';
import type { Content } from '../types';
import { contentApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { linkvertise } from '../components/Linkvertise/Linkvertise';

const ContentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<Content | null>(null);
  const [relatedContents, setRelatedContents] = useState<Content[]>([]);
  const [generalContents, setGeneralContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchContentData = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      try {

        setLoading(true);
        
        // Carregar dados do conteúdo
        const contentData = await contentApi.getById(parseInt(id));
        setContent(contentData);
        
        // Carregar conteúdos relacionados da mesma modelo
        if (contentData.modelId) {
          const relatedData = await contentApi.getByModel(contentData.modelId, { 
            limit: 6,
            sortBy: 'recent'
          });
          // Filtrar o conteúdo atual da lista de relacionados
          const filtered = (relatedData.contents || []).filter(c => c.id !== contentData.id);
          setRelatedContents(filtered);
          
          // Se não há conteúdos relacionados suficientes, carregar conteúdos gerais
          if (filtered.length < 3) {
            const generalData = await contentApi.getAll({ 
              limit: 8,
              sortBy: 'recent'
            });
            // Filtrar o conteúdo atual e os já relacionados
            const generalFiltered = (generalData.contents || [])
              .filter(c => c.id !== contentData.id && !filtered.some(r => r.id === c.id))
              .slice(0, 6);
            setGeneralContents(generalFiltered);
          }
        }
      } catch (error) {
        console.error('Error loading content:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchContentData();
  }, [id, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleMegaLinkClick = async () => {
    if (!content) return;

    try {
      // Registrar visualização
      await contentApi.recordView(content.id);
      
      // Abrir link em nova aba
      window.open(content.url, '_blank');
      
      // Atualizar contador local
      setContent(prev => prev ? { ...prev, views: prev.views + 1 } : null);
    } catch (error) {
      console.error('Error recording view:', error);
      // Mesmo com erro, abrir o link
      if (content) {
        window.open(content.url, '_blank');
      }
    }
  };

  const handleShare = async () => {
    if (!content) return;

    const shareData = {
      title: content.title,
      text: `Check out ${content.title} by ${content.model?.name}`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
    setShowDropdown(false);
  };

  const formatViews = (views: number) => {
    return new Intl.NumberFormat('en-US', { 
      notation: 'compact',
      maximumFractionDigits: 1 
    }).format(views);
  };




  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-300">
        <div className="animate-pulse text-primary-500 font-semibold text-xl">Loading content...</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-300">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Content not found</h2>
          <Button onClick={handleBack}>Go Back</Button>
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
            <span>Back</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Content Header */}
              <div className="bg-dark-200 rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3">
                      {content.title}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Eye size={16} className="mr-1 text-primary-500" />
                        <span>{formatViews(content.views)} views</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-1 text-primary-500" />
                        <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="bg-dark-300 hover:bg-dark-100 text-white p-2 rounded-lg transition-colors"
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
                          Share Content
                        </button>
                        <button
                          onClick={() => {
                            setShowReportModal(true);
                            setShowDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left text-gray-300 hover:bg-dark-100 flex items-center"
                        >
                          <Flag size={16} className="mr-2" />
                          Report Content
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {content.tags && content.tags.length > 0 && (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {content.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-500/20 text-primary-300 text-sm rounded-full border border-primary-500/30"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mega Link Section */}
                <div className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 border border-primary-500/20 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Download size={24} className="text-primary-500 mr-3" />
                    <div>
                      <h3 className="text-xl font-bold text-white">Premium Content Access</h3>
                      <p className="text-gray-300 text-sm">Click below to access the full content</p>
                    </div>
                  </div>
                  
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleMegaLinkClick}
                    className="group"
                  >
                    <span className="flex items-center justify-center">
                      <ExternalLink size={20} className="mr-2 transition-transform duration-300 group-hover:translate-x-1" />
                      Mega Link
                    </span>
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center mt-3">
                    By accessing this content, you confirm you are 18+ and accept our terms.
                  </p>
                </div>
              </div>

              {/* Model Info */}
              {content.model && (
                <div className="bg-dark-200 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">About the Model</h3>
                  <div className="flex items-start space-x-4">
                    <img
                      src={content.model.photoUrl}
                      alt={content.model.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-2">{content.model.name}</h4>
                      {content.model.bio && (
                        <p className="text-gray-300 text-sm mb-4 line-clamp-3">{content.model.bio}</p>
                      )}
                      <Link
                        to={`/model/${content.model.slug}`}
                        className="inline-flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                      >
                        <User size={16} className="mr-2" />
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Related Content */}
            <div className="lg:col-span-1">
              <div className="bg-dark-200 rounded-xl shadow-lg p-6 sticky top-24">
                {relatedContents.length > 0 ? (
                  <h3 className="text-xl font-semibold text-white mb-4">
                    More from {content.model?.name}
                  </h3>
                ) : (
                  <h3 className="text-xl font-semibold text-white mb-4">
                    More Content
                  </h3>
                )}
                
                <div className="space-y-4">
                  {(relatedContents.length > 0 ? relatedContents : generalContents).length > 0 ? (
                    (relatedContents.length > 0 ? relatedContents : generalContents).map((relatedContent) => (
                      <button
                        key={relatedContent.id}
                        onClick={() => handleContentClick(relatedContent.id)}
                        className="block group w-full text-left"
                      >
                        <div className="flex space-x-3 p-3 rounded-lg hover:bg-dark-300 transition-colors">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-dark-400">
                            {relatedContent.thumbnailUrl ? (
                              <img
                                src={relatedContent.thumbnailUrl}
                                alt={relatedContent.title}
                                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <img
                                src={relatedContent.model?.photoUrl}
                                alt={relatedContent.title}
                                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                              />
                            )}
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium text-sm group-hover:text-primary-400 transition-colors line-clamp-2 mb-1">
                              {relatedContent.title}
                            </h4>
                            {relatedContent.model && (
                              <p className="text-xs text-gray-400 mb-1">
                                by {relatedContent.model.name}
                              </p>
                            )}
                            <div className="flex items-center text-xs text-gray-400">
                              <Eye size={12} className="mr-1" />
                              <span>{formatViews(relatedContent.views)}</span>
                              <span className="mx-1">•</span>
                              <span>{new Date(relatedContent.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📱</div>
                      <p className="text-gray-400 text-sm">Loading more content...</p>
                    </div>
                  )}
                </div>

                {content.model && (
                  <div className="mt-6 pt-6 border-t border-dark-100">
                    <button
                      onClick={() => navigate(`/model/${content.model!.slug}`)}
                      className="w-full text-center px-4 py-3 bg-dark-300 hover:bg-dark-100 text-gray-300 hover:text-white rounded-lg transition-colors"
                    >
                      View All Content from {content.model.name}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentId={content?.id}
        title={content?.title || 'Content'}
      />
    </>
  );
};

export default ContentDetail;