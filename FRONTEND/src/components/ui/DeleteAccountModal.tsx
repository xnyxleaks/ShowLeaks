import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import Button from './Button';
import AlertModal from './AlertModal';
import { useAlert } from '../../hooks/useAlert';
import { authApi } from '../../services/api';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const { alert, showError, showSuccess, hideAlert } = useAlert();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (confirmText !== 'DELETE') {
      showError('Confirmation Required', 'Please type "DELETE" to confirm account deletion.');
      return;
    }

    if (!password) {
      showError('Password Required', 'Please enter your password to confirm account deletion.');
      return;
    }

    setLoading(true);
    try {
      await authApi.deleteAccount(password);
      showSuccess('Account Deleted', 'Your account has been permanently deleted. You will be redirected to the homepage.', () => {
        onSuccess();
        onClose();
        resetForm();
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete account';
      showError('Account Deletion Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPassword('');
    setConfirmText('');
    setShowPassword(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-dark-200 to-dark-100 w-full max-w-md rounded-2xl shadow-2xl border border-red-500/20 animate-fade-in-up">
          <div className="relative p-6">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Trash2 size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Delete Account</h2>
              <p className="text-gray-400">This action cannot be undone</p>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle size={20} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-300">
                  <p className="font-medium mb-1">Warning: Permanent Deletion</p>
                  <ul className="space-y-1 text-xs">
                    <li>• All your data will be permanently deleted</li>
                    <li>• Your comments and activity will be removed</li>
                    <li>• Premium subscription will be cancelled</li>
                    <li>• This action cannot be reversed</li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Enter Your Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-dark-300/50 border border-dark-100/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmText" className="block text-sm font-medium text-gray-300 mb-2">
                  Type "DELETE" to confirm
                </label>
                <input
                  type="text"
                  id="confirmText"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-300/50 border border-dark-100/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                  placeholder="Type DELETE"
                  required
                />
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
                  variant="danger"
                  fullWidth
                  disabled={loading || confirmText !== 'DELETE'}
                >
                  {loading ? 'Deleting...' : 'Delete Account'}
                </Button>
              </div>
            </form>
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

export default DeleteAccountModal;