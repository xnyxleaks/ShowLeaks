import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';

const ResendVerification: React.FC = () => {
  const navigate = useNavigate();
  const { user, resendVerification } = useAuthStore();
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      await resendVerification(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error resending verification email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="pt-20 min-h-screen bg-dark-300 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-dark-200 rounded-2xl p-8 text-center shadow-xl">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                <Mail className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Email Sent!
            </h1>
            <p className="text-gray-300 mb-6">
              A new verification email has been sent to <strong>{email}</strong>. 
              Please check your inbox and click the link to verify your account.
            </p>
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate('/')}
            >
              Back to Site
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-dark-300 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-dark-200 rounded-2xl p-8 shadow-xl">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={32} className="text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Resend Verification
            </h1>
            <p className="text-gray-300">
              Enter your email to receive a new verification link
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-dark-300 border border-dark-100 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter your email"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading || !email}
            >
              {loading ? 'Sending...' : 'Resend Email'}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default ResendVerification;
