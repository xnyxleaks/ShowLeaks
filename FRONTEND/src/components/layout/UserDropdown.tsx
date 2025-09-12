import React from 'react';
import { Link } from 'react-router-dom';
import { UserCircle, Calendar, Mail, Award, ShieldCheck } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  isPremium: boolean;
  isAdmin: boolean;
  expiredPremium: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserDropdownProps {
  user: User;
  logout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user }) => {
  return (
    <div className="absolute right-0 mt-2 w-72 bg-dark-300 border border-dark-400 rounded-lg shadow-lg py-2 z-50 transform origin-top-right transition-all duration-200 ease-in-out">
      <div className="px-4 py-2 border-b border-dark-400">
        <Link to="/account" className="flex items-center py-2 text-gray-200 hover:text-primary-400 transition-colors">
          <UserCircle size={18} className="mr-2 text-primary-500" />
          <span className="font-medium">Your Account</span>
        </Link>
      </div>
      
      <div className="px-4 py-3 space-y-3">
        <div className="flex items-start">
          <div className="w-8 flex-shrink-0 flex justify-center">
            <Mail size={16} className="text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-400 mb-1">Email</div>
            <div className="text-sm text-gray-200 break-all">{user.email}</div>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="w-8 flex-shrink-0 flex justify-center">
            <Award size={16} className={user.isPremium ? "text-yellow-500" : "text-gray-400"} />
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-400 mb-1">Status</div>
            <div className={`text-sm font-medium ${user.isPremium ? "text-yellow-500" : "text-gray-200"}`}>
              {user.isPremium ? "Premium" : "Free Account"}
            </div>
          </div>
        </div>
        
        {user.isAdmin && (
          <div className="flex items-start">
            <div className="w-8 flex-shrink-0 flex justify-center">
              <ShieldCheck size={16} className="text-green-500" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-400 mb-1">Role</div>
              <div className="text-sm font-medium text-green-500">Admin</div>
            </div>
          </div>
        )}
        
        <div className="flex items-start">
          <div className="w-8 flex-shrink-0 flex justify-center">
            <Calendar size={16} className="text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-400 mb-1">Joined On</div>
            <div className="text-sm text-gray-200">
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
        
        {user.isPremium && user.expiredPremium && (
          <div className="flex items-start">
            <div className="w-8 flex-shrink-0 flex justify-center">
              <Calendar size={16} className="text-yellow-500" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-400 mb-1">Premium Expires</div>
              <div className="text-sm text-yellow-500">
                {new Date(user.expiredPremium).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDropdown;