import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, user } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Verification token not found');
      return;
    }

    handleVerification(token);
  }, [searchParams]);

  const handleVerification = async (token: string) => {
    try {
      setStatus('loading');
      await verifyEmail(token);
      setStatus('success');
      setMessage('Email successfully verified! You can now access all premium features.');
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Error verifying email. The token may have expired.');
    }
  };

  return (
    <main className="pt-20 min-h-screen bg-dark-300 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-dark-200 rounded-2xl p-8 text-center shadow-xl">
          {status === 'loading' && (
            <>
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Loader className="w-12 h-12 text-blue-500 animate-spin" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                Verifying Email...
              </h1>
              <p className="text-gray-300">
                Please wait while we verify your email.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                Email Verified!
              </h1>
              <p className="text-gray-300 mb-6">
                {message}
              </p>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                <p className="text-green-300 text-sm">
                  <strong>Congratulations!</strong> Your account has been successfully verified. You can now:
                </p>
                <ul className="text-green-400 text-sm mt-2 space-y-1">
                  <li>• Access unlimited content</li>
                  <li>• Purchase premium</li>
                  <li>• Comment and like</li>
                </ul>
              </div>
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
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-red-500" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                Verification Error
              </h1>
              <p className="text-gray-300 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => {
                    if (user?.email) {
                      // Resend verification email
                      window.location.href = '/resend-verification';
                    } else {
                      navigate('/');
                    }
                  }}
                >
                  {user?.email ? 'Resend Email' : 'Go to Site'}
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate('/')}
                >
                  Back to Home
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default EmailVerification;
