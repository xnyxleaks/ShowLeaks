import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="pt-20 min-h-screen bg-dark-300 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-dark-200 rounded-2xl p-8 text-center shadow-xl">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Payment Cancelled
          </h1>
          
          <p className="text-gray-300 mb-8">
            Your payment was cancelled. If you experienced any issues or have questions, please don't hesitate to contact our support team.
          </p>
          
          <div className="space-y-4">
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate('/premium')}
            >
              Try Again
            </Button>
            
            <Button
              variant="outline"
              fullWidth
              onClick={() => navigate('/')}
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentCancel;