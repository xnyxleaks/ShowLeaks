import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { likesApi } from '../../services/api';

interface LikeButtonProps {
  contentId?: number;
  modelId?: number;
  initialLikes: number;
  initialIsLiked: boolean;
  type: 'content' | 'model';
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  contentId,
  modelId,
  initialLikes,
  initialIsLiked,
  type,
  size = 'md',
  showCount = true
}) => {
  const { user } = useAuthStore();
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [loading, setLoading] = useState(false);

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
    try {
      await likesApi.toggle({
        contentId,
        modelId,
        type
      });

      setIsLiked(!isLiked);
      setLikes(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLikes = (count: number) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

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