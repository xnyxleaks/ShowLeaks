import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/api';
import { 
  User, 
  Mail, 
  Calendar, 
  Crown, 
  Shield, 
  Globe, 
  MapPin,
  Edit,
  Eye,
  Heart,
  MessageCircle,
  Settings,
  CheckCircle,
  XCircle,
  Camera,
  Upload,
  Lock,
  Trash2,
  Star
} from 'lucide-react';
import Button from '../components/ui/Button';
import ChangePasswordModal from '../components/ui/ChangePasswordModal';
import DeleteAccountModal from '../components/ui/DeleteAccountModal';
import RecommendContentModal from '../components/ui/RecommendContentModal';
import AlertModal from '../components/ui/AlertModal';
import { useAlert } from '../hooks/useAlert';

const YourAccount: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showRecommendContent, setShowRecommendContent] = useState(false);
  const { alert, showError, showSuccess, hideAlert } = useAlert();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    language: user?.language || 'en',
    country: user?.country || ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    window.scrollTo(0, 0);
  }, [user, navigate]);

  const handleSave = async () => {
    try {
      await authApi.updateProfile(formData);
      updateUser(formData);
      setIsEditing(false);
      showSuccess('Profile Updated', 'Your profile has been successfully updated.');
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Update Failed', 'Failed to update your profile. Please try again.');
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      showError('Invalid File Type', 'Please select only image files.');
      return;
    }

    // Validar tamanho (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showError('File Too Large', 'Image must be no larger than 5MB.');
      return;
    }

    setUploadingPhoto(true);
    try {
      const response = await authApi.uploadProfilePhoto(file);
      // Update both local state and user store
      if (response.user) {
        updateUser(response.user);
      } else {
        updateUser({ profilePhoto: response.profilePhoto });
      }
      showSuccess('Photo Updated', 'Your profile photo has been successfully updated.');
    } catch (error) {
      console.error('Error uploading photo:', error);
      showError('Upload Failed', 'Failed to upload your photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeleteAccount = () => {
    // Logout and redirect to home
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('ageConfirmed');
    navigate('/');
  };
  if (!user) return null;

  return (
    <main className="pt-20 min-h-screen bg-dark-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <User className="w-8 h-8 text-primary-500 mr-3" />
            <h1 className="text-3xl font-bold text-white">Your Account</h1>
          </div>
          <p className="text-gray-400">Manage your profile and account settings</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-2">
              <div className="bg-dark-200 rounded-xl p-6 border border-dark-100">
                {/* Profile Photo Section */}
                <div className="flex items-center mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-dark-300 flex items-center justify-center">
                      {user.profilePhoto ? (
                        <img
                          src={user.profilePhoto}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={32} className="text-gray-400" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 hover:bg-primary-600 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                      {uploadingPhoto ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera size={16} className="text-white" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploadingPhoto}
                      />
                    </label>
                  </div>
                  <div className="ml-6">
                    <h3 className="text-xl font-bold text-white">{user.name}</h3>
                    <p className="text-gray-400">{user.email}</p>
                    <div className="flex items-center mt-2">
                      {user.isPremium ? (
                        <>
                          <Crown size={16} className="text-yellow-500 mr-1" />
                          <span className="text-yellow-500 text-sm font-medium">Premium Member</span>
                        </>
                      ) : (
                        <span className="text-gray-400 text-sm">Free Account</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Profile Information</h2>
                  <Button
                    variant={isEditing ? "primary" : "outline"}
                    size="sm"
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  >
                    {isEditing ? (
                      <>
                        <CheckCircle size={16} className="mr-2" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Edit size={16} className="mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Display Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-dark-300 border border-dark-100 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <div className="flex items-center px-4 py-3 bg-dark-300/50 rounded-lg">
                        <User size={18} className="text-primary-500 mr-3" />
                        <span className="text-white font-medium">{user.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center px-4 py-3 bg-dark-300/50 rounded-lg">
                      <Mail size={18} className="text-primary-500 mr-3" />
                      <span className="text-white font-medium flex-1">{user.email}</span>
                      {user.isVerified ? (
                        <div className="flex items-center text-green-500">
                          <CheckCircle size={16} className="mr-1" />
                          <span className="text-sm">Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-500">
                          <XCircle size={16} className="mr-1" />
                          <span className="text-sm">Not Verified</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Language
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        className="w-full px-4 py-3 bg-dark-300 border border-dark-100 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="pt">Português</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="ru">Русский</option>
                      </select>
                    ) : (
                      <div className="flex items-center px-4 py-3 bg-dark-300/50 rounded-lg">
                        <Globe size={18} className="text-primary-500 mr-3" />
                        <span className="text-white font-medium">
                          {user.language === 'en' ? 'English' :
                           user.language === 'es' ? 'Español' :
                           user.language === 'pt' ? 'Português' :
                           user.language === 'fr' ? 'Français' :
                           user.language === 'de' ? 'Deutsch' :
                           user.language === 'ru' ? 'Русский' : 'English'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Country
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        placeholder="Enter your country"
                        className="w-full px-4 py-3 bg-dark-300 border border-dark-100 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <div className="flex items-center px-4 py-3 bg-dark-300/50 rounded-lg">
                        <MapPin size={18} className="text-primary-500 mr-3" />
                        <span className="text-white font-medium">{user.country || 'Not specified'}</span>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex space-x-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: user.name,
                            language: user.language || 'en',
                            country: user.country || ''
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button variant="primary" onClick={handleSave}>
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Stats */}
            <div className="space-y-6">
              {/* Account Status */}
              <div className="bg-dark-200 rounded-xl p-6 border border-dark-100">
                <h3 className="text-lg font-bold text-white mb-4">Account Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Membership</span>
                    <div className="flex items-center">
                      {user.isPremium ? (
                        <>
                          <Crown size={16} className="text-yellow-500 mr-1" />
                          <span className="text-yellow-500 font-medium">Premium</span>
                        </>
                      ) : (
                        <span className="text-gray-400">Free</span>
                      )}
                    </div>
                  </div>

                  {user.isAdmin && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Role</span>
                      <div className="flex items-center">
                        <Shield size={16} className="text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">Admin</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Joined</span>
                    <span className="text-white font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {user.isPremium && user.expiredPremium && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Premium Expires</span>
                      <span className="text-yellow-500 font-medium">
                        {new Date(user.expiredPremium).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Stats */}
              <div className="bg-dark-200 rounded-xl p-6 border border-dark-100">
                <h3 className="text-lg font-bold text-white mb-4">Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Eye size={16} className="text-primary-500 mr-2" />
                      <span className="text-gray-400">Content Views</span>
                    </div>
                    <span className="text-white font-medium">-</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Heart size={16} className="text-red-500 mr-2" />
                      <span className="text-gray-400">Likes Given</span>
                    </div>
                    <span className="text-white font-medium">-</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageCircle size={16} className="text-blue-500 mr-2" />
                      <span className="text-gray-400">Comments</span>
                    </div>
                    <span className="text-white font-medium">-</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-dark-200 rounded-xl p-6 border border-dark-100">
                <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setShowChangePassword(true)}
                  >
                    <Lock size={16} className="mr-2" />
                    Change Password
                  </Button>

                  {!user.isPremium && (
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => navigate('/premium')}
                    >
                      <Crown size={16} className="mr-2" />
                      Upgrade to Premium
                    </Button>
                  )}

                  {user.isPremium && (
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => setShowRecommendContent(true)}
                    >
                      <Star size={16} className="mr-2" />
                      Recommend Content
                    </Button>
                  )}

                  {user.isPremium && (
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => navigate('/billing')}
                    >
                      <Settings size={16} className="mr-2" />
                      Manage Billing
                    </Button>
                  )}

                  {!user.isVerified && (
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => {
                        window.open('/resend-verification', '_blank');
                      }}
                    >
                      <Mail size={16} className="mr-2" />
                      Verify Email
                    </Button>
                  )}

                  <div className="pt-4 border-t border-dark-100">
                    <Button
                      variant="danger"
                      fullWidth
                      onClick={() => setShowDeleteAccount(true)}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

      <DeleteAccountModal
        isOpen={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
        onSuccess={handleDeleteAccount}
      />

      <RecommendContentModal
        isOpen={showRecommendContent}
        onClose={() => setShowRecommendContent(false)}
      />

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
    </main>
  );
};

export default YourAccount;