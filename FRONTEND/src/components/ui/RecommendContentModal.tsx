import React, { useState, useEffect } from 'react';
import { X, Star, Search, Send } from 'lucide-react';
import Button from './Button';
import AlertModal from './AlertModal';
import { useAlert } from '../../hooks/useAlert';
import { modelsApi, recommendationsApi } from '../../services/api';
import type { Model } from '../../types';

interface RecommendContentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RecommendContentModal: React.FC<RecommendContentModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [remainingRecommendations, setRemainingRecommendations] = useState(2);
  const { alert, showError, showSuccess, hideAlert } = useAlert();

  useEffect(() => {
    if (isOpen) {
      loadRemainingRecommendations();
    }
  }, [isOpen]);

  const loadRemainingRecommendations = async () => {
    try {
      const response = await recommendationsApi.getRemainingCount();
      setRemainingRecommendations(response.remaining);
    } catch (error) {
      console.error('Error loading remaining recommendations:', error);
    }
  };

  const searchModels = async (query: string) => {
    if (query.length < 2) {
      setModels([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await modelsApi.getAll({ search: query, limit: 10 });
      setModels(response.models || []);
    } catch (error) {
      console.error('Error searching models:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchModels(searchQuery);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedModel) {
      showError('Model Required', 'Please select a model to recommend.');
      return;
    }

    if (!description.trim()) {
      showError('Description Required', 'Please provide a description for your recommendation.');
      return;
    }

    if (remainingRecommendations <= 0) {
      showError('Recommendation Limit Reached', 'You have reached your monthly recommendation limit of 2 recommendations.');
      return;
    }

    setLoading(true);
    try {
      await recommendationsApi.create({
        modelId: selectedModel.id,
        description: description.trim()
      });
      
      showSuccess('Recommendation Submitted', 'Thank you for your recommendation! Our team will review it shortly.', () => {
        onClose();
        resetForm();
      });
      
      setRemainingRecommendations(prev => prev - 1);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to submit recommendation';
      showError('Submission Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSearchQuery('');
    setSelectedModel(null);
    setDescription('');
    setModels([]);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-dark-200 to-dark-100 w-full max-w-lg rounded-2xl shadow-2xl border border-dark-100/50 animate-fade-in-up">
          <div className="relative p-6">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Star size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Recommend Content</h2>
              <p className="text-gray-400">Suggest new models for our platform</p>
              <div className="mt-3 px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full inline-block border border-yellow-500/30">
                {remainingRecommendations} recommendations remaining this month
              </div>
            </div>

            {remainingRecommendations <= 0 ? (
              <div className="text-center py-8">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                  <AlertTriangle size={32} className="text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Limit Reached</h3>
                  <p className="text-gray-300">
                    You have used all your recommendations for this month. Premium members can submit up to 2 recommendations per month.
                  </p>
                </div>
                <Button variant="outline" fullWidth onClick={handleClose} className="mt-6">
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Search for Model
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-dark-300/50 border border-dark-100/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                      placeholder="Search for a model..."
                    />
                    {searchLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Model Search Results */}
                  {models.length > 0 && (
                    <div className="mt-2 max-h-48 overflow-y-auto bg-dark-300/50 border border-dark-100/50 rounded-xl">
                      {models.map((model) => (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => {
                            setSelectedModel(model);
                            setSearchQuery(model.name);
                            setModels([]);
                          }}
                          className="w-full flex items-center p-3 hover:bg-dark-200/50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          <img
                            src={model.photoUrl}
                            alt={model.name}
                            className="w-10 h-10 rounded-full object-cover mr-3"
                          />
                          <div className="text-left">
                            <div className="text-white font-medium">{model.name}</div>
                            <div className="text-gray-400 text-xs">{model.ethnicity}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Selected Model */}
                  {selectedModel && (
                    <div className="mt-3 p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                      <div className="flex items-center">
                        <img
                          src={selectedModel.photoUrl}
                          alt={selectedModel.name}
                          className="w-12 h-12 rounded-full object-cover mr-3"
                        />
                        <div className="flex-1">
                          <div className="text-white font-medium">{selectedModel.name}</div>
                          <div className="text-primary-300 text-sm">Selected for recommendation</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedModel(null);
                            setSearchQuery('');
                          }}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Why do you recommend this model?
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-300/50 border border-dark-100/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500 transition-all resize-none"
                    rows={4}
                    placeholder="Tell us why you think this model should be featured on our platform..."
                    maxLength={500}
                    required
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {description.length}/500 characters
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={handleClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={loading || !selectedModel || !description.trim()}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                  >
                    {loading ? (
                      'Submitting...'
                    ) : (
                      <>
                        <Send size={16} className="mr-2" />
                        Submit Recommendation
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={alert.isOpen}
        onClose={hideAlert}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
        onConfirm={alert.onConfirm}
        showCancel={alert.showCancel}
      />
    </>
  );
};

export default RecommendContentModal;