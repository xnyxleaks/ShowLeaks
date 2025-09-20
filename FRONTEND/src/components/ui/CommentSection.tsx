import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Heart, MoreVertical, Flag, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from './Button';
import { commentsApi } from '../../services/api';

interface Comment {
  id: number;
  userId: number;
  contentId?: number;
  modelId?: number;
  parentId?: number;
  text: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  user: {
    id: number;
    name: string;
    isPremium: boolean;
    isAdmin: boolean;
    profilePhoto?: string | null;
  };
  replies?: Comment[];
}

interface CommentSectionProps {
  contentId?: number;
  modelId?: number;
  type: 'content' | 'model';
}

const CommentSection: React.FC<CommentSectionProps> = ({ contentId, modelId, type }) => {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadComments();
  }, [contentId, modelId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await commentsApi.getAll({
        contentId,
        modelId,
        limit: 50
      });
      setComments(response.comments || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      await commentsApi.create({
        contentId,
        modelId,
        text: newComment.trim()
      });
      setNewComment('');
      loadComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: number) => {
    if (!user || !replyText.trim()) return;

    try {
      await commentsApi.create({
        contentId,
        modelId,
        text: replyText.trim(),
        parentId
      });
      setReplyText('');
      setReplyingTo(null);
      loadComments();
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  const handleLikeComment = async (commentId: number) => {
    if (!user) return;

    try {
      await commentsApi.toggleLike(commentId);
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
            }
          : {
              ...comment,
              replies: comment.replies?.map(reply =>
                reply.id === commentId
                  ? {
                      ...reply,
                      isLiked: !reply.isLiked,
                      likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1
                    }
                  : reply
              )
            }
      ));
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentsApi.delete(commentId);
      loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleReportComment = async (commentId: number) => {
    try {
      // TODO: Implement report comment functionality
    } catch (error) {
      console.error('Error reporting comment:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-dark-200 rounded-xl p-6 border border-dark-100">
      <div className="flex items-center mb-6">
        <MessageCircle className="w-6 h-6 text-primary-500 mr-3" />
        <h3 className="text-xl font-bold text-white">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-500/20 flex items-center justify-center">
              {user.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-primary-400 font-medium text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-4 py-3 bg-dark-300 border border-dark-100 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {newComment.length}/500 characters
                </span>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!newComment.trim() || submitting}
                >
                  {submitting ? (
                    'Posting...'
                  ) : (
                    <>
                      <Send size={14} className="mr-2" />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-dark-300/50 rounded-lg text-center">
          <p className="text-gray-400">Please sign in to leave a comment</p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-dark-300 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-dark-300 rounded w-1/4" />
                  <div className="h-3 bg-dark-300 rounded w-3/4" />
                  <div className="h-3 bg-dark-300 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              user={user}
              onLike={() => handleLikeComment(comment.id)}
              onDelete={() => handleDeleteComment(comment.id)}
              onReport={() => handleReportComment(comment.id)}
              onReply={() => setReplyingTo(comment.id)}
              replyingTo={replyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              onSubmitReply={() => handleSubmitReply(comment.id)}
              onCancelReply={() => {
                setReplyingTo(null);
                setReplyText('');
              }}
              formatTimeAgo={formatTimeAgo}
              onLikeReply={handleLikeComment}
              onDeleteReply={handleDeleteComment}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface CommentItemProps {
  comment: Comment;
  user: any;
  onLike: () => void;
  onDelete: () => void;
  onReport: () => void;
  onReply: () => void;
  replyingTo: number | null;
  replyText: string;
  setReplyText: (text: string) => void;
  onSubmitReply: () => void;
  onCancelReply: () => void;
  formatTimeAgo: (date: string) => string;
  onLikeReply: (replyId: number) => void;
  onDeleteReply: (replyId: number) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  user,
  onLike,
  onDelete,
  onReport,
  onReply,
  replyingTo,
  replyText,
  setReplyText,
  onSubmitReply,
  onCancelReply,
  formatTimeAgo,
  onLikeReply,
  onDeleteReply
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="bg-dark-300/30 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-500/20 flex items-center justify-center">
            {comment.user.profilePhoto ? (
              <img
                src={comment.user.profilePhoto}
                alt={comment.user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-primary-400 font-medium text-sm">
                {comment.user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-white">{comment.user.name}</span>
              {comment.user.isPremium && (
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                  Premium
                </span>
              )}
              {comment.user.isAdmin && (
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                  Admin
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <MoreVertical size={16} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-dark-200 rounded-lg shadow-lg overflow-hidden z-10">
              {user && (
                <button
                  onClick={() => {
                    onReply();
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-dark-100 flex items-center"
                >
                  <MessageCircle size={14} className="mr-2" />
                  Reply
                </button>
              )}
              {user && (user.id === comment.userId || user.isAdmin) && (
                <button
                  onClick={() => {
                    onDelete();
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-dark-100 flex items-center"
                >
                  <Trash2 size={14} className="mr-2" />
                  Delete
                </button>
              )}
              {user && user.id !== comment.userId && (
                <button
                  onClick={() => {
                    onReport();
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-dark-100 flex items-center"
                >
                  <Flag size={14} className="mr-2" />
                  Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div id={`comment-${comment.id}`} className="text-gray-300 mb-3 leading-relaxed">
        {comment.text}
      </div>

      <div className="flex items-center space-x-4 mb-3">
        <button
          onClick={onLike}
          disabled={!user}
          className={`flex items-center space-x-1 transition-colors ${
            comment.isLiked 
              ? 'text-red-500' 
              : 'text-gray-400 hover:text-red-400'
          } ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <Heart size={16} className={comment.isLiked ? 'fill-current' : ''} />
          <span className="text-sm">{comment.likes}</span>
        </button>
        
        {user && (
          <button
            onClick={onReply}
            className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
          >
            Reply
          </button>
        )}
      </div>

      {/* Reply Form */}
      {replyingTo === comment.id && (
        <div className="mt-4 pl-6 border-l-2 border-primary-500/30">
          <div className="flex space-x-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-500/20 flex items-center justify-center">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-primary-400 font-medium text-xs">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.user.name}...`}
                className="w-full px-3 py-2 bg-dark-300 border border-dark-100 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
                rows={2}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {replyText.length}/500 characters
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onCancelReply}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onSubmitReply}
                    disabled={!replyText.trim()}
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 pl-6 border-l-2 border-primary-500/30 space-y-3">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="bg-dark-400/30 rounded-lg p-3">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-500/20 flex items-center justify-center">
                    {reply.user.profilePhoto ? (
                      <img
                        src={reply.user.profilePhoto}
                        alt={reply.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-primary-400 font-medium text-xs">
                        {reply.user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white text-sm">{reply.user.name}</span>
                      {reply.user.isPremium && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                          Premium
                        </span>
                      )}
                      {reply.user.isAdmin && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(reply.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-gray-300 mb-2 leading-relaxed text-sm">
                {reply.text}
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onLikeReply(reply.id)}
                  disabled={!user}
                  className={`flex items-center space-x-1 transition-colors ${
                    reply.isLiked 
                      ? 'text-red-500' 
                      : 'text-gray-400 hover:text-red-400'
                  } ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <Heart size={14} className={reply.isLiked ? 'fill-current' : ''} />
                  <span className="text-xs">{reply.likes}</span>
                </button>
                
                {user && user.id === reply.userId && (
                  <button
                    onClick={() => onDeleteReply(reply.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors text-xs"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;