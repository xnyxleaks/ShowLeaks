import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="pt-20 min-h-screen bg-dark-300 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-dark-200 rounded-2xl p-8 text-center shadow-xl">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-gray-300 mb-8">
            Thank you for upgrading to Premium! Your account has been successfully upgraded, and you now have access to all premium features.
          </p>
          
          <div className="space-y-4">
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate('/')}
            >
              Return to Home
            </Button>
            
            <Button
              variant="outline"
              fullWidth
              onClick={() => navigate('/premium')}
            >
              View Premium Benefits
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentSuccess;