import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, MapPin, Calendar } from 'lucide-react';
import type { Model } from '../../types';
import { linkvertise } from '../Linkvertise/Linkvertise';
import { useAuthStore } from '../../store/authStore';

interface ModelCardProps {
  model: Model;
}

const ModelCard: React.FC<ModelCardProps> = ({ model }) => {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.isPremium && !user?.isAdmin) {
      linkvertise("1329936", { whitelist: ["mega.nz"] });
    }
  }, [user]);

  const formatViews = (views: number) => {
    return new Intl.NumberFormat('en-US', { 
      notation: 'compact',
      maximumFractionDigits: 1 
    }).format(views);
  };

  const getEthnicityLabel = (ethnicity?: string) => {
    const labels = {
      arab: 'Arab',
      asian: 'Asian',
      ebony: 'Ebony',
      indian: 'Indian',
      latina: 'Latina',
      white: 'White'
    };
    return ethnicity ? labels[ethnicity as keyof typeof labels] : '';
  };
//
  return (
    <Link
      to={`/model/${model.slug}`} 
      className="group block overflow-hidden bg-dark-200 rounded-lg shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img 
          src={model.photoUrl} 
          alt={model.name} 
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-dark-300/90"></div>
        
        {/* Ethnicity Badge */}
        {model.ethnicity && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-primary-500/80 text-white text-xs font-medium rounded-full">
              {getEthnicityLabel(model.ethnicity)}
            </span>
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-semibold text-lg text-white group-hover:text-primary-400 transition-colors mb-2">
            {model.name}
          </h3>
          
          <div className="space-y-1 mb-3">
            {model.age && (
              <div className="flex items-center text-xs text-gray-300">
                <Calendar size={12} className="mr-1 text-primary-500" />
                <span>{model.age} years old</span>
              </div>
            )}
            
            {model.birthPlace && (
              <div className="flex items-center text-xs text-gray-300">
                <MapPin size={12} className="mr-1 text-primary-500" />
                <span>{model.birthPlace}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-300">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Eye size={14} className="mr-1 text-primary-500" />
                <span>{formatViews(model.views)}</span>
              </div>
              
              {model.tags && model.tags.length > 0 && (
                <div className="flex items-center">
                  <span className="text-xs bg-dark-300/50 px-2 py-1 rounded">
                    {model.tags.length} tag{model.tags.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
            
            <div className="text-xs text-gray-400">
              {new Date(model.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ModelCard;
