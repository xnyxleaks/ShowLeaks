import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { contentApi, modelsApi } from '../../services/api';
import { Plus, Edit, Trash2, Eye, ArrowLeft, Search, User } from 'lucide-react';
import Button from '../../components/ui/Button';
import type { Content, Model } from '../../types';

const AdminContent: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }
    loadContents();
  }, [user, navigate, currentPage, searchQuery]);

  const loadContents = async () => {
    try {
      setLoading(true);
      const response = await contentApi.getAll({
        page: currentPage,
        limit: 12,
        search: searchQuery || undefined
      });
      setContents(response.contents || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error loading contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    
    try {
      await contentApi.delete(id);
      loadContents();
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Error deleting content');
    }
  };

  if (!user?.isAdmin) return null;

  return (
    <main className="pt-20 min-h-screen bg-dark-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin')}
              className="mr-4 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold text-white">Manage Content</h1>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Add Content
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search content or model..."
              className="w-full pl-10 pr-4 py-2 bg-dark-200 border border-dark-100 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-dark-200 rounded-lg animate-pulse">
                <div className="aspect-[4/5] bg-dark-300 rounded-t-lg" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-dark-300 rounded" />
                  <div className="h-3 bg-dark-300 rounded w-2/3" />
                </div>
              </div>
            ))
          ) : contents.length > 0 ? (
            contents.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                onEdit={() => setEditingContent(content)}
                onDelete={() => handleDelete(content.id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 text-lg">No content found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-200 text-gray-400 hover:bg-dark-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingContent) && (
        <ContentModal
          content={editingContent}
          onClose={() => {
            setShowCreateModal(false);
            setEditingContent(null);
          }}
          onSave={() => {
            loadContents();
            setShowCreateModal(false);
            setEditingContent(null);
          }}
        />
      )}
    </main>
  );
};

interface ContentCardProps {
  content: Content;
  onEdit: () => void;
  onDelete: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ content, onEdit, onDelete }) => {
  return (
    <div className="bg-dark-200 rounded-lg overflow-hidden shadow-lg">
      <div className="aspect-[4/5] relative">
        <img
          src={content.thumbnailUrl || content.model?.photoUrl}
          alt={content.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex space-x-1">
          <button
            onClick={onEdit}
            className="p-2 bg-blue-500/80 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-primary-500/80 text-white text-xs rounded-full">
            {content.type}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white mb-1 line-clamp-2">{content.title}</h3>
        {content.model && (
          <div className="flex items-center text-sm text-gray-400 mb-2">
            <User size={14} className="mr-1" />
            <span>{content.model.name}</span>
          </div>
        )}
        <div className="flex items-center text-sm text-gray-400">
          <Eye size={14} className="mr-1" />
          <span>{content.views.toLocaleString()} views</span>
        </div>
      </div>
    </div>
  );
};

interface ContentModalProps {
  content: Content | null;
  onClose: () => void;
  onSave: () => void;
}

const ContentModal: React.FC<ContentModalProps> = ({ content, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: content?.title || '',
    url: content?.url || '',
    thumbnailUrl: content?.thumbnailUrl || '',
    type: content?.type || 'image',
    tags: content?.tags?.join(', ') || '',
    modelId: content?.modelId || '',
    modelSearch: content?.model?.name || ''
  });
  const [loading, setLoading] = useState(false);
  const [modelSuggestions, setModelSuggestions] = useState<Model[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchModels = async (query: string) => {
    if (query.length < 2) {
      setModelSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await modelsApi.getAll({ search: query, limit: 10 });
      setModelSuggestions(response.models || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching models:', error);
    }
  };

  const selectModel = (model: Model) => {
    setFormData({
      ...formData,
      modelId: model.id.toString(),
      modelSearch: model.name
    });
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.modelId) {
      alert('Please select a model');
      return;
    }

    setLoading(true);

    try {
      const data = {
        title: formData.title,
        url: formData.url,
        thumbnailUrl: formData.thumbnailUrl || undefined,
        type: formData.type as 'video' | 'image' | 'gallery',
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        modelId: parseInt(formData.modelId)
      };

      if (content) {
        await contentApi.update(content.id, data);
      } else {
        await contentApi.create(data);
      }

      onSave();
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-200 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-dark-100">
          <h2 className="text-2xl font-bold text-white">
            {content ? 'Edit Content' : 'Add Content'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-dark-300 border border-dark-100 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Model *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.modelSearch}
                onChange={(e) => {
                  setFormData({ ...formData, modelSearch: e.target.value, modelId: '' });
                  searchModels(e.target.value);
                }}
                placeholder="Search for a model..."
                className="w-full px-3 py-2 bg-dark-300 border border-dark-100 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {showSuggestions && modelSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-dark-300 border border-dark-100 rounded-lg mt-1 max-h-48 overflow-y-auto z-10">
                  {modelSuggestions.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => selectModel(model)}
                      className="w-full px-3 py-2 text-left hover:bg-dark-200 flex items-center"
                    >
                      <img
                        src={model.photoUrl}
                        alt={model.name}
                        className="w-8 h-8 rounded-full object-cover mr-3"
                      />
                      <div>
                        <div className="text-white font-medium">{model.name}</div>
                        <div className="text-gray-400 text-xs">{model.ethnicity}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Mega Link URL *
            </label>
            <input
              type="url"
              required
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://mega.nz/..."
              className="w-full px-3 py-2 bg-dark-300 border border-dark-100 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Thumbnail URL
            </label>
            <input
              type="url"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              className="w-full px-3 py-2 bg-dark-300 border border-dark-100 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 bg-dark-300 border border-dark-100 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="gallery">Gallery</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="tag1, tag2, tag3"
              className="w-full px-3 py-2 bg-dark-300 border border-dark-100 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading || !formData.modelId}
            >
              {loading ? 'Saving...' : (content ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminContent;