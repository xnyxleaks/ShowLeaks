import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { likesApi } from '../../services/api';

interface LikeButtonProps {
  contentId?: number;
  modelId?: number;
  type: 'content' | 'model';
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  contentId,
  modelId,
  type,
  size = 'md',
  showCount = true
}) => {
  const { user } = useAuthStore();
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load initial like stats
  React.useEffect(() => {
    const loadLikeStats = async () => {
      if (!contentId && !modelId) return;
      
      try {
        const stats = await likesApi.getStats({ contentId, modelId });
        setLikes(stats.totalLikes);
        setIsLiked(stats.isLiked);
        setInitialized(true);
      } catch (error) {
        console.error('Error loading like stats:', error);
        setInitialized(true);
      }
    };

    loadLikeStats();
  }, [contentId, modelId]);

  const sizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  const handleToggleLike = async () => {
    if (!user || loading) return;

    setLoading(true);
    const previousState = { likes, isLiked };
    
    // Optimistic update
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    
    try {
      await likesApi.toggle({
        contentId,
        modelId,
        type
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setIsLiked(previousState.isLiked);
      setLikes(previousState.likes);
    } finally {
      setLoading(false);
    }
  };

  const formatLikes = (count: number) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  if (!initialized) {
    return (
      <div className={`
        flex items-center space-x-2 rounded-lg transition-all duration-200
        ${sizeClasses[size]}
        bg-dark-300/50 text-gray-400 border border-dark-100
      `}>
        <Heart size={iconSizes[size]} className="animate-pulse" />
        {showCount && <span className="text-sm">...</span>}
      </div>
    );
  }
  return (
    <button
      onClick={handleToggleLike}
      disabled={!user || loading}
      className={`
        flex items-center space-x-2 rounded-lg transition-all duration-200
        ${sizeClasses[size]}
        ${isLiked 
          ? 'bg-red-500/20 text-red-500 border border-red-500/30' 
          : 'bg-dark-300/50 text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-dark-100'
        }
        ${!user ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'}
        ${loading ? 'opacity-50' : ''}
      `}
      title={!user ? 'Sign in to like' : isLiked ? 'Unlike' : 'Like'}
    >
      <Heart 
        size={iconSizes[size]} 
        className={`transition-all duration-200 ${
          isLiked ? 'fill-current scale-110' : ''
        }`} 
      />
      {showCount && (
        <span className={`font-medium ${
          size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
        }`}>
          {formatLikes(likes)}
        </span>
      )}
    </button>
  );
};

export default LikeButton;