import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'form' | 'success' | 'error'>('form');
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing reset token');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      return;
    }

    if (!token) return;

    setLoading(true);
    setMessage('');

    try {
      await resetPassword(token, password);
      setStatus('success');
      setMessage('Password reset successfully! You can now login with your new password.');
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Failed to reset password. The token may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-20 min-h-screen bg-dark-300 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-gradient-to-br from-dark-200 to-dark-100 rounded-2xl p-8 text-center shadow-2xl border border-dark-100/50">
          {status === 'success' && (
            <>
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                Password Reset!
              </h1>
              <p className="text-gray-300 mb-6">
                {message}
              </p>
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate('/')}
              >
                Go to Site
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <XCircle className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                Reset Error
              </h1>
              <p className="text-gray-300 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate('/')}
                >
                  Back to Home
                </Button>
              </div>
            </>
          )}

          {status === 'form' && (
            <>
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Lock className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                Reset Password
              </h1>
              <p className="text-gray-300 mb-6">
                Enter your new password below
              </p>

              {message && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2 text-left">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-dark-300/50 border border-dark-100/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-white placeholder-gray-500"
                      placeholder="Enter new password"
                      required
                      minLength={6}
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
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2 text-left">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-dark-300/50 border border-dark-100/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-white placeholder-gray-500"
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={loading}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default ResetPassword;