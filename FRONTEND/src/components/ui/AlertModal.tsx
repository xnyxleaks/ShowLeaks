import React from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import Button from './Button';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  showCancel = false
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={32} className="text-green-500" />;
      case 'error':
        return <XCircle size={32} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle size={32} className="text-yellow-500" />;
      case 'info':
        return <Info size={32} className="text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'from-green-500/10 to-green-600/10 border-green-500/20';
      case 'error':
        return 'from-red-500/10 to-red-600/10 border-red-500/20';
      case 'warning':
        return 'from-yellow-500/10 to-yellow-600/10 border-yellow-500/20';
      case 'info':
        return 'from-blue-500/10 to-blue-600/10 border-blue-500/20';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-dark-200 to-dark-100 w-full max-w-md rounded-2xl shadow-2xl border border-dark-100/50 animate-fade-in-up">
        <div className="relative p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="text-center">
            <div className={`w-16 h-16 bg-gradient-to-br ${getBackgroundColor()} rounded-2xl flex items-center justify-center mx-auto mb-4 border`}>
              {getIcon()}
            </div>
            <h2 className="text-xl font-bold text-white mb-3">{title}</h2>
            <p className="text-gray-300 leading-relaxed mb-6">{message}</p>
            
            <div className={`flex gap-3 ${showCancel ? 'justify-between' : 'justify-center'}`}>
              {showCancel && (
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  {cancelText}
                </Button>
              )}
              <Button
                variant={type === 'error' ? 'danger' : 'primary'}
                onClick={handleConfirm}
                className={showCancel ? 'flex-1' : 'px-8'}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;