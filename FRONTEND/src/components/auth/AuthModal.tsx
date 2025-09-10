import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { login, register, loading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login({ email, password });
        onClose();
      } else {
        if (!ageConfirmed) {
          alert('You must confirm that you are 18 years or older');
          return;
        }
        await register({ name, email, password, ageConfirmed });
        setShowSuccess(true);
      }
    } catch (error) {
      // Error is handled by the store
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setAgeConfirmed(false);
    setShowSuccess(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-200 w-full max-w-md rounded-xl shadow-xl p-6 m-4 animate-fade-in-up">
        {showSuccess ? (
          <div className="text-center">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Check Your Email</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <X size={32} className="text-green-500" />
              </div>
              <p className="text-gray-300 mb-4">
                We've sent a verification email to <strong className="text-white">{email}</strong>
              </p>
              <p className="text-sm text-gray-400">
                Please check your inbox and click the verification link to activate your account.
              </p>
            </div>
            
            <Button variant="primary" fullWidth onClick={handleClose}>
              Got it
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-dark-300 border border-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-300 border border-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-300 border border-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>

              {!isLogin && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ageConfirmed}
                      onChange={(e) => setAgeConfirmed(e.target.checked)}
                      className="mt-1 mr-3 text-primary-500 focus:ring-primary-500"
                      required
                    />
                    <span className="text-sm text-gray-300">
                      I confirm that I am <strong className="text-white">18 years of age or older</strong> and 
                      I agree to view adult content.
                    </span>
                  </label>
                </div>
              )}

              <Button 
                type="submit" 
                variant="primary" 
                fullWidth 
                size="lg"
                disabled={loading || (!isLogin && !ageConfirmed)}
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
                >
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;