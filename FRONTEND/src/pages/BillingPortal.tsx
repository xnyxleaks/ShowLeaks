import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AlertModal from '../components/ui/AlertModal';
import SupportModal from '../components/ui/SupportModal';
import { useAlert } from '../hooks/useAlert';
import { 
  CreditCard, 
  ArrowLeft, 
  ExternalLink, 
  Crown, 
  Calendar, 
  DollarSign, 
  Circle as XCircle, 
  MessageCircle, 
  Circle as HelpCircle 
} from 'lucide-react';
import Button from '../components/ui/Button';
import axios from 'axios';

const BillingPortal: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const { alert, showError, showSuccess, hideAlert } = useAlert();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  const handleOpenBillingPortal = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/billing/portal`,
        { email: user.email },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      window.open(response.data.url, '_blank');
    } catch (error) {
      console.error('Error opening billing portal:', error);
      showError('Portal Error', 'Error opening billing portal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <main className="pt-20 min-h-screen bg-dark-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center">
            <CreditCard className="w-8 h-8 text-primary-500 mr-3" />
            <h1 className="text-3xl font-bold text-white">Billing & Subscription</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Current Plan */}
          <div className="bg-dark-200 rounded-xl p-6 mb-8 border border-dark-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Current Plan</h2>
              {user.isPremium && (
                <div className="flex items-center px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg border border-yellow-500/30">
                  <Crown size={18} className="mr-2" />
                  <span className="font-medium">Premium Active</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-dark-300/50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <DollarSign size={18} className="text-primary-500 mr-2" />
                  <span className="text-gray-400 text-sm">Plan Status</span>
                </div>
                <p className="text-white font-semibold">{user.isPremium ? 'Premium' : 'Free'}</p>
              </div>

              <div className="bg-dark-300/50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Calendar size={18} className="text-primary-500 mr-2" />
                  <span className="text-gray-400 text-sm">Member Since</span>
                </div>
                <p className="text-white font-semibold">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>

              {user.isPremium && user.expiredPremium && (
                <div className="bg-dark-300/50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Calendar size={18} className="text-primary-500 mr-2" />
                    <span className="text-gray-400 text-sm">Expires</span>
                  </div>
                  <p className="text-white font-semibold">
                    {new Date(user.expiredPremium).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Billing Portal */}
          <div className="bg-dark-200 rounded-xl p-6 border border-dark-100">
            <h2 className="text-2xl font-bold text-white mb-4">Manage Subscription</h2>
            <p className="text-gray-300 mb-6">
              Access your Stripe billing portal to manage your subscription, update payment methods, view invoices, and download receipts.
            </p>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
              <h3 className="text-blue-400 font-medium mb-2">What you can do in the billing portal:</h3>
              <ul className="text-blue-300 text-sm space-y-1">
                <li>• Update your payment method</li>
                <li>• View and download invoices</li>
                <li>• Update billing information</li>
                <li>• Cancel or modify your subscription</li>
                <li>• View payment history</li>
              </ul>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleOpenBillingPortal}
              disabled={loading}
              className="flex items-center"
            >
              {loading ? (
                'Opening Portal...'
              ) : (
                <>
                  <ExternalLink size={18} className="mr-2" />
                  Open Billing Portal
                </>
              )}
            </Button>

            <p className="text-gray-500 text-sm mt-4">
              You will be redirected to Stripe&apos;s secure billing portal in a new tab.
            </p>
          </div>

          {/* Support */}
          <div className="bg-dark-200 rounded-xl p-6 mt-8 border border-dark-100">
            <h2 className="text-xl font-bold text-white mb-4">Need Help?</h2>
            <p className="text-gray-300 mb-4">
              If you have any questions about your subscription or billing, please contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline"
                onClick={() => setShowSupportModal(true)}
              >
                <MessageCircle size={16} className="mr-2" />
                Contact Support
              </Button>
              <Button 
                variant="ghost"
                onClick={() => setShowSupportModal(true)}
              >
                <HelpCircle size={16} className="mr-2" />
                View FAQ
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={alert.isOpen}
        onClose={hideAlert}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
      />

      <SupportModal 
        isOpen={showSupportModal} 
        onClose={() => setShowSupportModal(false)} 
      />
    </main>
  );
};

export default BillingPortal;
