import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flame, Menu, X, User, Crown, ChevronDown, LogOut, UserCircle, Globe, CreditCard, Shield, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import AuthModal from '../auth/AuthModal';
import Button from '../ui/Button';
import UserDropdown from './UserDropdown';
import LanguageSelector from './LanguageSelector';
import NotificationDropdown from './NotificationDropdown';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
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
              
              {user?.isAdmin && (
                <NavLink to="/admin" active={location.pathname.startsWith('/admin')}>
                  <Shield size={16} className="mr-1 inline" />
                  Admin
                </NavLink>
              )}
              
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
                  {/* Notifications */}
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 text-gray-200 hover:text-primary-400 transition-colors"
                    >
                      <Bell size={20} />
                      {unreadNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadNotifications > 9 ? '9+' : unreadNotifications}
                        </span>
                      )}
                    </button>
                    
                    {showNotifications && (
                      <NotificationDropdown 
                        onClose={() => setShowNotifications(false)} 
                      />
                    )}
                  </div>

                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={toggleUserDropdown}
                      className="flex items-center text-gray-200 hover:text-primary-400 transition-colors"
                    >
                      {user.profilePhoto ? (
                        <img
                          src={user.profilePhoto}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover mr-2"
                        />
                      ) : (
                        <User size={16} className="text-gray-400 mr-2" />
                      )}
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
                  
                  {user.isPremium && (
                    <Link
                      to="/billing"
                      className="flex items-center text-gray-200 hover:text-primary-400 transition-colors"
                    >
                      <CreditCard size={16} className="mr-2" />
                      <span>Billing</span>
                    </Link>
                  )}
                  
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
            <div className="flex flex-col space-y-2 bg-dark-400/50 rounded-lg p-4 backdrop-blur-sm">
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
              
              {user?.isAdmin && (
                <MobileNavLink to="/admin" active={location.pathname.startsWith('/admin')}>
                  <Shield size={16} className="mr-2 inline text-green-500" />
                  Admin Panel
                </MobileNavLink>
              )}
              
              <div className="px-3 py-2 border-t border-dark-300 mt-2 pt-3">
                <button
                  onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                  className="w-full flex items-center justify-between text-gray-200 hover:text-primary-400 transition-colors"
                >
                  <div className="flex items-center">
                    <Globe size={16} className="text-primary-500 mr-2" />
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
                <div className="border-t border-dark-300 pt-3 mt-2">
                  <div className="px-3 py-2">
                    <button
                      onClick={toggleUserDropdown}
                      className="w-full flex items-center justify-between text-gray-200 hover:text-primary-400 transition-colors"
                    >
                      <div className="flex items-center">
                        <User size={16} className="text-primary-500 mr-2" />
                        <span className="font-medium">{user.name}</span>
                        {user.isPremium && (
                          <Crown size={14} className="ml-2 text-yellow-500" />
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
                      <div className="mt-3 pl-4 pr-2 py-3 bg-dark-500/50 rounded-lg border border-dark-300">
                        <div className="flex items-center py-2 text-gray-200 mb-2">
                          <UserCircle size={16} className="mr-2" />
                          <span className="font-medium">Account Info</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Email:</span>
                            <span className="text-gray-200 text-xs">{user.email}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Status:</span>
                            <div className="flex items-center">
                              {user.isPremium ? (
                                <>
                                  <Crown size={12} className="text-yellow-500 mr-1" />
                                  <span className="text-yellow-500 text-xs font-medium">Premium</span>
                                </>
                              ) : (
                                <span className="text-gray-400 text-xs">Free</span>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Verified:</span>
                            <span className={`text-xs ${user.isVerified ? 'text-green-500' : 'text-red-500'}`}>
                              {user.isVerified ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Joined:</span>
                            <span className="text-gray-200 text-xs">{new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {user.isPremium && (
                    <Link
                      to="/billing"
                      className="flex items-center px-3 py-2 text-gray-200 hover:text-primary-400 hover:bg-dark-300/50 rounded-lg transition-all duration-200 mb-2"
                    >
                      <CreditCard size={16} className="mr-2 text-primary-500" />
                      <span>Billing</span>
                    </Link>
                  )}
                  
                  <button
                    onClick={logout}
                    className="w-full flex items-center px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all duration-200 font-medium"
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
    className={`flex items-center py-2.5 px-3 rounded-lg transition-all duration-200 font-medium ${
      active 
        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' 
        : 'text-gray-200 hover:bg-dark-300/50 hover:text-primary-400'
    }`}
  >
    {children}
  </Link>
);

export default Header;