import React from 'react';
import { Flame, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SupportModal from '../ui/SupportModal';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [showSupportModal, setShowSupportModal] = React.useState(false);

  return (
    <>
      <footer className="bg-dark-400 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-6 md:mb-0">
            <span className="text-lg font-bold tracking-tight">
              <span className="text-primary-500">Show</span>
              <span className="text-white">Leaks</span>
              <button 
                onClick={() => setShowSupportModal(true)}
                className="text-gray-400 hover:text-primary-500 transition-colors flex items-center"
              >
                <MessageCircle size={16} className="mr-1" />
                Contact Support
              </button>
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
            <Link to="/" className="text-gray-400 hover:text-primary-500 transition-colors">
              Home
            </Link>
            <Link to="/premium" className="text-gray-400 hover:text-primary-500 transition-colors">
              Premium
            </Link>
            <Link to="/dmca" className="text-gray-400 hover:text-primary-500 transition-colors">
              DMCA
            </Link>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-800">
          <p className="text-gray-500 text-center text-sm">
          &copy; {currentYear} ShowLeaks. Some rights reserved. Content intended for adults 18+.
          </p>
        </div>
      </div>
      </footer>

      <SupportModal 
        isOpen={showSupportModal} 
        onClose={() => setShowSupportModal(false)} 
      />
    </>
  )
}
export default Footer;