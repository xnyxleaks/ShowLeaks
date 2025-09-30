import React, { useState } from 'react';
import { Shield, Calendar, AlertTriangle } from 'lucide-react';
import Button from './Button';
import { ageVerificationApi } from '../../services/api';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onExit: () => void;
}

const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({ 
  isOpen, 
  onConfirm, 
  onExit 
}) => {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!agreed) {
      setError('You must confirm that you are 18 years or older');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await ageVerificationApi.confirm(true);
      localStorage.setItem('ageConfirmed', 'true');
      onConfirm();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify age');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-200 w-full max-w-md rounded-xl shadow-xl animate-fade-in-up">
        <div className="p-6 text-center border-b border-dark-100">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Age Verification Required</h2>
          <p className="text-gray-300">
            This website contains adult content intended for individuals 18 years or older.
          </p>
        </div>

        <div className="p-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle size={20} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-300">
                <p className="font-medium mb-1">Warning: Adult Content</p>
                <p>
                  By continuing, you acknowledge that you are of legal age in your jurisdiction 
                  and consent to viewing adult content.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">

            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 mr-3 text-primary-500 focus:ring-primary-500"
                disabled={loading}
              />
              <span className="text-sm text-gray-300">
                I confirm that I am <strong className="text-white">18 years of age or older</strong> and 
                I agree to view adult content. I understand that this material is intended for mature 
                audiences only.
              </span>
            </label>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              fullWidth
              onClick={onExit}
              disabled={loading}
            >
              Exit Site
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleConfirm}
              disabled={!agreed || loading}
            >
              {loading ? 'Verifying...' : 'Enter Site'}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            By entering this site, you are agreeing to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgeVerificationModal;