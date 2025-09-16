import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Heart, MessageCircle, User, X, Check } from 'lucide-react';
import { notificationsApi } from '../../services/api';
import type { Notification } from '../../types';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await notificationsApi.getAll({ limit: 10 });
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type and data
    if (notification.data) {
      const { contentId, modelId, commentId } = notification.data;
      
      if (contentId) {
        // Navigate to content and scroll to comment if available
        const url = `/content/${contentId}${commentId ? `#comment-${commentId}` : ''}`;
        navigate(url);
      } else if (modelId) {
        navigate(`/model/${modelId}`);
      }
    }
    
    onClose();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment_like':
        return <Heart size={16} className="text-red-500" />;
      case 'comment_reply':
        return <MessageCircle size={16} className="text-blue-500" />;
      case 'model_follow':
        return <User size={16} className="text-green-500" />;
      case 'content_like':
        return <Heart size={16} className="text-red-500" />;
      default:
        return <Bell size={16} className="text-gray-400" />;
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
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-dark-200 border border-dark-100 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-100">
        <div className="flex items-center">
          <Bell size={18} className="text-primary-500 mr-2" />
          <h3 className="font-semibold text-white">Notifications</h3>
        </div>
        <div className="flex items-center space-x-2">
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
            >
              <Check size={14} className="inline mr-1" />
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-dark-300 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-dark-300 rounded w-3/4" />
                    <div className="h-2 bg-dark-300 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-dark-100">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full p-4 text-left hover:bg-dark-100 transition-colors ${
                  !notification.isRead ? 'bg-primary-500/5' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm font-medium ${
                        !notification.isRead ? 'text-white' : 'text-gray-300'
                      }`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Bell size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No notifications yet</p>
            <p className="text-gray-500 text-xs mt-1">
              You'll see notifications here when people interact with your content
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-dark-100 p-3">
          <button
            onClick={() => {
              // Navigate to full notifications page if you have one
              onClose();
            }}
            className="w-full text-center text-xs text-primary-400 hover:text-primary-300 transition-colors"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;