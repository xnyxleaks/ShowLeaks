import { useState } from 'react';

interface AlertState {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}

export const useAlert = () => {
  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showAlert = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    options?: {
      confirmText?: string;
      cancelText?: string;
      onConfirm?: () => void;
      showCancel?: boolean;
    }
  ) => {
    setAlert({
      isOpen: true,
      type,
      title,
      message,
      ...options
    });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  };

  const showSuccess = (title: string, message: string, onConfirm?: () => void) => {
    showAlert('success', title, message, { onConfirm });
  };

  const showError = (title: string, message: string, onConfirm?: () => void) => {
    showAlert('error', title, message, { onConfirm });
  };

  const showWarning = (title: string, message: string, options?: { onConfirm?: () => void; showCancel?: boolean }) => {
    showAlert('warning', title, message, options);
  };

  const showInfo = (title: string, message: string, onConfirm?: () => void) => {
    showAlert('info', title, message, { onConfirm });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  ) => {
    showAlert('warning', title, message, {
      onConfirm,
      showCancel: true,
      confirmText,
      cancelText
    });
  };

  return {
    alert,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  };
};