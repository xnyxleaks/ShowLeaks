import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flame, Menu, X, User, Crown, ChevronDown, LogOut, UserCircle, Globe } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import AuthModal from '../auth/AuthModal';
import Button from '../ui/Button';
import UserDropdown from './UserDropdown';
import LanguageSelector from './LanguageSelector';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { fetchUser } = useAuthStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-dark-300/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight">
                <span className="text-primary-500">Extreme</span>
                <span className="text-white">Leaks</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <NavLink to="/" active={location.pathname === '/'}>
                Home
              </NavLink>
              <NavLink to="/models" active={location.pathname === '/models'}>
                Models
              </NavLink>
              <NavLink to="/premium" active={location.pathname === '/premium'}>
                Premium
              </NavLink>
              <NavLink to="/dmca" active={location.pathname === '/dmca'}>
                DMCA
              </NavLink>
              
              <div className="relative">
                <button
                  onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                  className="flex items-center text-gray-200 hover:text-primary-400 transition-colors"
                >
                  <Globe size={16} className="mr-1" />
                  <ChevronDown 
                    size={14} 
                    className={`transition-transform duration-200 ${
                      showLanguageSelector ? 'transform rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {showLanguageSelector && (
                  <LanguageSelector onClose={() => setShowLanguageSelector(false)} />
                )}
              </div>

              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={toggleUserDropdown}
                      className="flex items-center text-gray-200 hover:text-primary-400 transition-colors"
                    >
                      <User size={16} className="text-gray-400 mr-2" />
                      <span className="font-medium">{user.name}</span>
                      {user.isPremium && (
                        <div className="ml-2 flex items-center text-yellow-500">
                          <Crown size={16} className="mr-1" />
                          <span className="text-sm font-medium">Premium</span>
                        </div>
                      )}
                      <ChevronDown 
                        size={16} 
                        className={`ml-2 text-gray-400 transition-transform duration-200 ${
                          showUserDropdown ? 'transform rotate-180' : ''
                        }`} 
                      />
                    </button>
                    
                    {showUserDropdown && (
                      <UserDropdown user={user} logout={logout} />
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={logout}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                >
                  <User size={16} className="mr-2" />
                  Sign In
                </Button>
              )}
            </div>

            <button 
              className="md:hidden text-gray-200 hover:text-primary-500 transition"
              onClick={toggleMenu}
              aria-label={isOpen ? "Close Menu" : "Open Menu"}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div 
            className={`md:hidden transition-all duration-300 overflow-hidden ${
              isOpen ? 'max-h-96 opacity-100 py-4' : 'max-h-0 opacity-0 py-0'
            }`}
          >
            <div className="flex flex-col space-y-4">
              <MobileNavLink to="/" active={location.pathname === '/'}>
                Home
              </MobileNavLink>
              <MobileNavLink to="/models" active={location.pathname === '/models'}>
                Models
              </MobileNavLink>
              <MobileNavLink to="/premium" active={location.pathname === '/premium'}>
                Premium
              </MobileNavLink>
              <MobileNavLink to="/dmca" active={location.pathname === '/dmca'}>
                DMCA
              </MobileNavLink>
              
              <div className="px-4 py-2">
                <button
                  onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                  className="w-full flex items-center justify-between text-gray-200 hover:text-primary-400"
                >
                  <div className="flex items-center">
                    <Globe size={16} className="text-gray-400 mr-2" />
                    <span className="font-medium">Language</span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-400 transition-transform duration-200 ${
                      showLanguageSelector ? 'transform rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {showLanguageSelector && (
                  <div className="mt-2">
                    <LanguageSelector onClose={() => setShowLanguageSelector(false)} />
                  </div>
                )}
              </div>
              
              {user ? (
                <>
                  <div className="px-4 py-2">
                    <button
                      onClick={toggleUserDropdown}
                      className="w-full flex items-center justify-between text-gray-200 hover:text-primary-400"
                    >
                      <div className="flex items-center">
                        <User size={16} className="text-gray-400 mr-2" />
                        <span className="font-medium">{user.name}</span>
                        {user.isPremium && (
                          <div className="ml-2 flex items-center text-yellow-500">
                            <Crown size={16} className="mr-1" />
                            <span className="text-sm font-medium">Premium</span>
                          </div>
                        )}
                      </div>
                      <ChevronDown 
                        size={16} 
                        className={`text-gray-400 transition-transform duration-200 ${
                          showUserDropdown ? 'transform rotate-180' : ''
                        }`} 
                      />
                    </button>
                    
                    {showUserDropdown && (
                      <div className="mt-2 pl-6 pr-2 py-2 bg-dark-400 rounded-lg">
                        <Link to='/' className="flex items-center py-2 text-gray-200 hover:text-primary-400">
                          <UserCircle size={16} className="mr-2" />
                          <span>Your Account</span>
                        </Link>
                        <div className="px-2 py-3 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400 text-sm">ID:</span>
                            <span className="text-gray-200 text-sm">{user.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 text-sm">Email:</span>
                            <span className="text-gray-200 text-sm">{user.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 text-sm">Status:</span>
                            <span className="text-gray-200 text-sm">{user.isPremium ? 'Premium' : 'Free'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 text-sm">Created:</span>
                            <span className="text-gray-200 text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-primary-500 hover:bg-dark-400 rounded-lg transition-colors text-left flex items-center"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 text-primary-500 hover:bg-dark-400 rounded-lg transition-colors text-left flex items-center"
                >
                  <User size={16} className="mr-2" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, active, children }) => (
  <Link
    to={to}
    className={`font-medium transition-colors duration-200 ${
      active 
        ? 'text-primary-500' 
        : 'text-gray-200 hover:text-primary-400'
    }`}
  >
    {children}
  </Link>
);

const MobileNavLink: React.FC<NavLinkProps> = ({ to, active, children }) => (
  <Link
    to={to}
    className={`block py-2 px-4 rounded-lg transition-colors duration-200 ${
      active 
        ? 'bg-dark-400 text-primary-500 font-medium' 
        : 'text-gray-200 hover:bg-dark-400 hover:text-primary-400'
    }`}
  >
    {children}
  </Link>
);

export default Header;