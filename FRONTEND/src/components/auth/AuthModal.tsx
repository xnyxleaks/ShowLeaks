import React, { useState } from 'react';
import { Mail, X, ArrowLeft, Lock, User, Eye, EyeOff } from 'lucide-react';
import Button from '../ui/Button';
import AlertModal from '../ui/AlertModal';
import { useAlert } from '../../hooks/useAlert';
import { useAuthStore } from '../../store/authStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot-password' | 'email-sent';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [showEmailReminder, setShowEmailReminder] = useState(false);
  const { alert, showError, showSuccess, hideAlert } = useAlert();
  const { login, register, forgotPassword, loading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await login({ email, password });
        showSuccess('Login Successful', 'Welcome back! You have been successfully logged in.');
        onClose();
      } else if (mode === 'register') {
        if (!ageConfirmed) {
          showError('Age Confirmation Required', 'You must confirm that you are 18 years or older to create an account.');
          return;
        }
        await register({ name, email, password, ageConfirmed });
        setShowEmailReminder(true);
      } else if (mode === 'forgot-password') {
        await forgotPassword(email);
        setMode('email-sent');
      }
    } catch (error) {
      const errorMessage = (error as any)?.response?.data?.error || 'An unexpected error occurred';
      showError('Authentication Error', errorMessage);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setAgeConfirmed(false);
    setShowEmailReminder(false);
    setShowPassword(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
    setMode('login');
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-dark-200 to-dark-100 w-full max-w-md rounded-2xl shadow-2xl border border-dark-100/50 animate-fade-in-up">
        {showEmailReminder ? (
          <EmailReminderContent email={email} onClose={handleClose} />
        ) : mode === 'email-sent' ? (
          <EmailSentContent email={email} onBack={() => setMode('login')} onClose={handleClose} />
        ) : (
          <>
            {/* Header */}
            <div className="relative p-8 pb-6">
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              
              {mode === 'forgot-password' && (
                <button
                  onClick={() => setMode('login')}
                  className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={24} />
                </button>
              )}

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {mode === 'login' ? (
                    <User size={28} className="text-white" />
                  ) : mode === 'register' ? (
                    <User size={28} className="text-white" />
                  ) : (
                    <Lock size={28} className="text-white" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {mode === 'login' && 'Welcome Back'}
                  {mode === 'register' && 'Create Account'}
                  {mode === 'forgot-password' && 'Reset Password'}
                </h2>
                <p className="text-gray-400">
                  {mode === 'login' && 'Sign in to your account'}
                  {mode === 'register' && 'Join our community today'}
                  {mode === 'forgot-password' && 'Enter your email to reset password'}
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="px-8 pb-8">
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === 'register' && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-300/50 border border-dark-100/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-300/50 border border-dark-100/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                {mode !== 'forgot-password' && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-12 bg-dark-300/50 border border-dark-100/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                        placeholder="Enter your password"
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
                )}

                {mode === 'register' && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ageConfirmed}
                        onChange={(e) => setAgeConfirmed(e.target.checked)}
                        className="mt-1 mr-3 text-primary-500 focus:ring-primary-500 rounded"
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
                  disabled={loading || (mode === 'register' && !ageConfirmed)}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg"
                >
                  {loading ? 'Please wait...' : (
                    mode === 'login' ? 'Sign In' :
                    mode === 'register' ? 'Create Account' :
                    'Send Reset Link'
                  )}
                </Button>

                {/* Mode Switchers */}
                <div className="text-center space-y-3">
                  {mode === 'login' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setMode('forgot-password')}
                        className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
                      >
                        Forgot your password?
                      </button>
                      <div>
                        <button
                          type="button"
                          onClick={() => switchMode('register')}
                          className="text-gray-400 hover:text-white text-sm transition-colors"
                        >
                          Don't have an account? <span className="text-primary-400">Sign up</span>
                        </button>
                      </div>
                    </>
                  )}

                  {mode === 'register' && (
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      Already have an account? <span className="text-primary-400">Sign in</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </>
        )}
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
    </div>
  );
};

const EmailReminderContent: React.FC<{ email: string; onClose: () => void }> = ({ email, onClose }) => (
  <div className="p-8 text-center">
    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
      <Mail size={28} className="text-white" />
    </div>
    <h2 className="text-2xl font-bold text-white mb-4">Account Created!</h2>
    
    <div className="mb-6">
      <p className="text-white text-lg font-semibold mb-2">Welcome to ExtremeLeaks!</p>
      <p className="text-gray-300 mb-4">
        Your account has been created successfully.
      </p>
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-4">
        <p className="text-yellow-300 text-sm">
          <strong>Important:</strong> Please verify your email to unlock all features and purchase premium.
        </p>
        <p className="text-yellow-400 text-xs mt-1">
          Check your inbox at: <strong>{email}</strong>
        </p>
      </div>
      <div className="mb-4">
        <button
          onClick={() => {
            window.open('/resend-verification', '_blank');
          }}
          className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
        >
          Didn't receive the email? Click here to resend
        </button>
      </div>
      <p className="text-xs text-gray-400">
        You can browse content now, but verification is required for premium features.
      </p>
    </div>
    
    <Button variant="primary" fullWidth onClick={onClose}>
      Start Browsing
    </Button>
  </div>
);

const EmailSentContent: React.FC<{ email: string; onBack: () => void; onClose: () => void }> = ({ email, onBack, onClose }) => (
  <div className="p-8 text-center">
    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
      <Mail size={28} className="text-white" />
    </div>
    <h2 className="text-2xl font-bold text-white mb-4">Email Sent!</h2>
    
    <div className="mb-6">
      <p className="text-gray-300 mb-4">
        We've sent a password reset link to:
      </p>
      <p className="text-white font-semibold mb-4">{email}</p>
      <p className="text-gray-400 text-sm">
        Check your inbox and click the link to reset your password.
      </p>
    </div>
    
    <div className="space-y-3">
      <Button variant="primary" fullWidth onClick={onBack}>
        Back to Login
      </Button>
      <Button variant="outline" fullWidth onClick={onClose}>
        Close
      </Button>
    </div>
  </div>
);

export default AuthModal;