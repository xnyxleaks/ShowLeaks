import React from 'react';
import { X, Mail, Lock } from 'lucide-react';
import Button from './Button';

interface ContentLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifyEmail: () => void;
}

const ContentLimitModal: React.FC<ContentLimitModalProps> = ({ 
  isOpen, 
  onClose, 
  onVerifyEmail 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-200 w-full max-w-md rounded-xl shadow-xl animate-fade-in-up">
        <div className="p-6 text-center border-b border-dark-100">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Content Limit Reached</h2>
          <p className="text-gray-300">
            You've reached the limit of 3 content views for unverified accounts.
          </p>
        </div>

        <div className="p-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Mail size={20} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">Verify your email to continue</p>
                <p>
                  Check your inbox and click the verification link to unlock unlimited content access.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="primary"
              fullWidth
              onClick={onVerifyEmail}
            >
              <Mail size={16} className="mr-2" />
              Resend Verification Email
            </Button>
            
            <Button
              variant="outline"
              fullWidth
              onClick={onClose}
            >
              Close
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            After verification, you'll have unlimited access to all content and can purchase premium.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContentLimitModal;