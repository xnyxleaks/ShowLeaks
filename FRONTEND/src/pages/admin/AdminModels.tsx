import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { modelsApi } from '../../services/api';
import { Plus, Edit, Trash2, Eye, ArrowLeft, Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import type { Model } from '../../types';

const AdminModels: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }
    loadModels();
  }, [user, navigate, currentPage, searchQuery]);

  const loadModels = async () => {
    try {
      setLoading(true);
      const response = await modelsApi.getAll({
        page: currentPage,
        limit: 12,
        search: searchQuery || undefined
      });
      setModels(response.models || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this model?')) return;
    
    try {
      await modelsApi.delete(id);
      loadModels();
    } catch (error) {
      console.error('Error deleting model:', error);
      alert('Error deleting model');
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
            <h1 className="text-3xl font-bold text-white">Manage Models</h1>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Create Model
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
              placeholder="Search models..."
              className="w-full pl-10 pr-4 py-2 bg-dark-200 border border-dark-100 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-dark-200 rounded-lg animate-pulse">
                <div className="aspect-[3/4] bg-dark-300 rounded-t-lg" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-dark-300 rounded" />
                  <div className="h-3 bg-dark-300 rounded w-2/3" />
                </div>
              </div>
            ))
          ) : models.length > 0 ? (
            models.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                onEdit={() => setEditingModel(model)}
                onDelete={() => handleDelete(model.id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 text-lg">No models found</p>
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
      {(showCreateModal || editingModel) && (
        <ModelModal
          model={editingModel}
          onClose={() => {
            setShowCreateModal(false);
            setEditingModel(null);
          }}
          onSave={() => {
            loadModels();
            setShowCreateModal(false);
            setEditingModel(null);
          }}
        />
      )}
    </main>
  );
};

interface ModelCardProps {
  model: Model;
  onEdit: () => void;
  onDelete: () => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, onEdit, onDelete }) => {
  return (
    <div className="bg-dark-200 rounded-lg overflow-hidden shadow-lg">
      <div className="aspect-[3/4] relative">
        <img
          src={model.photoUrl}
          alt={model.name}
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
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white mb-1">{model.name}</h3>
        <div className="flex items-center text-sm text-gray-400">
          <Eye size={14} className="mr-1" />
          <span>{model.views.toLocaleString()} views</span>
        </div>
        {model.ethnicity && (
          <span className="inline-block mt-2 px-2 py-1 bg-primary-500/20 text-primary-300 text-xs rounded-full">
            {model.ethnicity}
          </span>
        )}
      </div>
    </div>
  );
};

interface ModelModalProps {
  model: Model | null;
  onClose: () => void;
  onSave: () => void;
}

const ModelModal: React.FC<ModelModalProps> = ({ model, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: model?.name || '',
    photoUrl: model?.photoUrl || '',
    bio: model?.bio || '',
    age: model?.age || '',
    height: model?.height || '',
    weight: model?.weight || '',
    hairColor: model?.hairColor || '',
    eyeColor: model?.eyeColor || '',
    bodyType: model?.bodyType || '',
    bustSize: model?.bustSize || '',
    birthPlace: model?.birthPlace || '',
    ethnicity: model?.ethnicity || '',
    orientation: model?.orientation || '',
    tags: model?.tags?.join(', ') || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined,
        height: formData.height ? parseInt(formData.height) : undefined,
        weight: formData.weight ? parseInt(formData.weight) : undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      };

      if (model) {
        await modelsApi.update(model.id, data);
      } else {
        await modelsApi.create(data);
      }

      onSave();
    } catch (error) {
      console.error('Error saving model:', error);
      alert('Error saving model');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-200 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-dark-100">
          <h2 className="text-2xl font-bold text-white">
            {model ? 'Edit Model' : 'Create Model'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-dark-300 border border-dark-100 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Photo URL *
              </label>
              <input
                type="url"
                required
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                className="w-full px-3 py-2 bg-dark-300 border border-dark-100 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Age
              </label>
              <input
                type="number"
                min="18"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-3 py-2 bg-dark-300 border border-dark-100 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Ethnicity
              </label>
              <select
                value={formData.ethnicity}
                onChange={(e) => setFormData({ ...formData, ethnicity: e.target.value })}
                className="w-full px-3 py-2 bg-dark-300 border border-dark-100 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select ethnicity</option>
                <option value="arab">Arab</option>
                <option value="asian">Asian</option>
                <option value="ebony">Ebony</option>
                <option value="indian">Indian</option>
                <option value="latina">Latina</option>
                <option value="white">White</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Hair Color
              </label>
              <input
                type="text"
                value={formData.hairColor}
                onChange={(e) => setFormData({ ...formData, hairColor: e.target.value })}
                className="w-full px-3 py-2 bg-dark-300 border border-dark-100 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Eye Color
              </label>
              <input
                type="text"
                value={formData.eyeColor}
                onChange={(e) => setFormData({ ...formData, eyeColor: e.target.value })}
                className="w-full px-3 py-2 bg-dark-300 border border-dark-100 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="w-full px-3 py-2 bg-dark-300 border border-dark-100 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-3 py-2 bg-dark-300 border border-dark-100 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Bio
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 bg-dark-300 border border-dark-100 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
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
              disabled={loading}
            >
              {loading ? 'Saving...' : (model ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminModels;