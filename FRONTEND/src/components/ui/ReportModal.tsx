import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Button from './Button';
import { reportsApi } from '../../services/api';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId?: number;
  modelId?: number;
  title: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ 
  isOpen, 
  onClose, 
  contentId, 
  modelId, 
  title 
}) => {
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const reasons = [
    { value: 'broken_link', label: 'Broken Link', description: 'The link is not working or leads to an error page' },
    { value: 'child_content', label: 'Child Content', description: 'Content appears to involve minors' },
    { value: 'no_consent', label: 'No Consent', description: 'Content shared without consent of the person(s) involved' },
    { value: 'spam', label: 'Spam', description: 'Irrelevant or repetitive content' },
    { value: 'inappropriate', label: 'Inappropriate', description: 'Content violates community guidelines' },
    { value: 'other', label: 'Other', description: 'Other reason not listed above' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    setLoading(true);
    try {
      await reportsApi.create({
        contentId,
        modelId,
        reason: reason as any,
        description: description.trim() || undefined
      });
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setReason('');
        setDescription('');
      }, 2000);
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setReason('');
      setDescription('');
      setSuccess(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-200 w-full max-w-md rounded-xl shadow-xl animate-fade-in-up">
        <div className="flex justify-between items-center p-6 border-b border-dark-100">
          <div className="flex items-center">
            <AlertTriangle size={20} className="mr-2 text-red-500" />
            <h2 className="text-xl font-bold text-white">Report Content</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Report Submitted</h3>
            <p className="text-gray-300">Thank you for helping keep our community safe. We'll review your report shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-4">
              <p className="text-gray-300 text-sm mb-4">
                You're reporting: <span className="font-medium text-white">"{title}"</span>
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Reason for report *
              </label>
              <div className="space-y-2">
                {reasons.map(({ value, label, description }) => (
                  <label key={value} className="flex items-start cursor-pointer">
                    <input
                      type="radio"
                      name="reason"
                      value={value}
                      checked={reason === value}
                      onChange={(e) => setReason(e.target.value)}
                      className="mt-1 mr-3 text-primary-500 focus:ring-primary-500"
                      disabled={loading}
                    />
                    <div>
                      <div className="text-white font-medium">{label}</div>
                      <div className="text-gray-400 text-xs">{description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Additional details (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-dark-300 border border-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white resize-none"
                rows={3}
                placeholder="Provide any additional context..."
                disabled={loading}
              />
            </div>

            <div className="flex space-x-3">
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
                disabled={!reason || loading}
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportModal;