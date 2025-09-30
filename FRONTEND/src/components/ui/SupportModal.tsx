import React, { useState } from 'react';
import { X, Mail, MessageCircle, Send, Clock, ExternalLink } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import Button from './Button';
import AlertModal from './AlertModal';
import { useAlert } from '../../hooks/useAlert';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'contact' | 'faq'>('contact');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const { alert, showSuccess, showError, hideAlert } = useAlert();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      showError('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    
    // Simulate sending email (you would implement actual email sending here)
    try {
      // TODO: Implement actual email sending to contact@showleaks.com
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccess(
        'Message Sent!', 
        'Thank you for contacting us! Our team will respond within 48 hours.',
        () => {
          onClose();
          resetForm();
        }
      );
    } catch (error) {
      showError('Send Failed', 'Failed to send your message. Please try again or contact us directly at contact@showleaks.com');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const faqItems = [
    {
      question: 'How do I upgrade to Premium?',
      answer: 'Click on the "Premium" button in the navigation menu and follow the secure Stripe checkout process. Your premium access will be activated immediately after payment.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and debit cards through our secure Stripe payment processor.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes! You can cancel your subscription at any time through your billing portal. You\'ll retain premium access until the end of your current billing period.'
    },
    {
      question: 'Is my payment information secure?',
      answer: 'Absolutely! We use Stripe, a PCI-compliant payment processor trusted by millions of businesses worldwide. We never store your payment information on our servers.'
    },
    {
      question: 'Will my subscription auto-renew?',
      answer: 'Yes, your subscription will automatically renew monthly unless you cancel it. You can manage your subscription settings in the billing portal.'
    },
    {
      question: 'Can I get a refund?',
      answer: 'Due to the nature of digital content, we generally do not offer refunds once a purchase is confirmed. Exception: in cases of duplicate payments or double charges, the corresponding refund will be issued. If you experience technical issues that prevent access to the purchased content, please contact our support team for analysis and resolution.'
    },
    {
      question: 'Why was my payment declined?',
      answer: 'Payment declines can happen for various reasons: insufficient funds, expired card, or bank restrictions. Please check with your bank or try a different payment method.'
    },
    {
      question: 'How do I update my payment method?',
      answer: 'You can update your payment method through the billing portal accessible from your account settings or billing page.'
    }
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-dark-200 to-dark-100 w-full max-w-4xl rounded-2xl shadow-2xl border border-dark-100/50 animate-fade-in-up max-h-[99vh] overflow-hidden">
          {/* Header */}
          <div className="relative p-6 border-b border-dark-100">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MessageCircle size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Support Center</h2>
              <p className="text-gray-400">Get help with your account and payments</p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center mt-6">
              <div className="bg-dark-300/50 rounded-xl p-1 flex">
                <button
                  onClick={() => setActiveTab('contact')}
                  className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'contact'
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Contact Support
                </button>
                <button
                  onClick={() => setActiveTab('faq')}
                  className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'faq'
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  FAQ
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {activeTab === 'contact' ? (
              <div className="max-w-2xl mx-auto">
                {/* Contact Methods */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-dark-300/30 rounded-xl p-4 text-center">
                    <Mail className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <h3 className="text-white font-medium mb-1">Email Support</h3>
                    <p className="text-gray-400 text-sm mb-2">Direct email contact</p>
                    <a 
                      href="mailto:contact@showleaks.com"
                      className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                    >
                      contact@showleaks.com
                    </a>
                  </div>

                  <div className="bg-dark-300/30 rounded-xl p-4 text-center">
                    <FaDiscord className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                    <h3 className="text-white font-medium mb-1">Discord Support</h3>
                    <p className="text-gray-400 text-sm mb-2">Join our community</p>
                    <button 
                      className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                      onClick={() => {
                        // TODO: Add Discord link when available
                        showError('Coming Soon', 'Discord support will be available soon!');
                      }}
                    >
                      Join Discord
                    </button>
                  </div>

                  <div className="bg-dark-300/30 rounded-xl p-4 text-center">
                    <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <h3 className="text-white font-medium mb-1">Response Time</h3>
                    <p className="text-gray-400 text-sm mb-2">We typically respond</p>
                    <span className="text-green-400 text-sm font-medium">Within 48 hours</span>
                  </div>
                </div>

                {/* Contact Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-dark-300/50 border border-dark-100/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-white placeholder-gray-500"
                        placeholder="Enter your name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-dark-300/50 border border-dark-100/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-white placeholder-gray-500"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Subject *
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-300/50 border border-dark-100/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="payment-issue">Payment Issue</option>
                      <option value="account-problem">Account Problem</option>
                      <option value="technical-support">Technical Support</option>
                      <option value="content-report">Content Report</option>
                      <option value="billing-question">Billing Question</option>
                      <option value="feature-request">Feature Request</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-300/50 border border-dark-100/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-white placeholder-gray-500 resize-none"
                      rows={6}
                      placeholder="Describe your issue or question in detail..."
                      maxLength={1000}
                      required
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        {formData.message.length}/1000 characters
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-start">
                      <Clock size={20} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-300">
                        <p className="font-medium mb-1">Response Time</p>
                        <p>
                          Our support team typically responds within 48 hours. For urgent payment issues, 
                          please email us directly at contact@showleaks.com
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    size="lg"
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    {loading ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send size={18} className="mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                <div className="mb-6 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Frequently Asked Questions</h3>
                  <p className="text-gray-400">Find answers to common questions about payments and premium features</p>
                </div>

                <div className="space-y-4">
                  {faqItems.map((item, index) => (
                    <FAQItem key={index} question={item.question} answer={item.answer} />
                  ))}
                </div>

                <div className="mt-8 bg-primary-500/10 border border-primary-500/20 rounded-xl p-6 text-center">
                  <h4 className="text-primary-300 font-bold mb-2">Still need help?</h4>
                  <p className="text-gray-300 mb-4">
                    Can't find what you're looking for? Our support team is here to help!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="primary"
                      onClick={() => setActiveTab('contact')}
                    >
                      <MessageCircle size={16} className="mr-2" />
                      Contact Support
                    </Button>
                    <a
                      href="mailto:contact@showleaks.com"
                      className="inline-flex items-center justify-center px-4 py-2 bg-dark-300 hover:bg-dark-200 text-gray-300 rounded-lg transition-colors"
                    >
                      <Mail size={16} className="mr-2" />
                      Email Directly
                    </a>
                  </div>
                </div>
              </div>
            )}
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
        onConfirm={alert.onConfirm}
        showCancel={alert.showCancel}
      />
    </>
  );
};

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-dark-300/30 rounded-xl border border-dark-100/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-dark-300/50 transition-colors rounded-xl"
      >
        <h4 className="text-white font-medium">{question}</h4>
        <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-gray-300 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};

export default SupportModal;