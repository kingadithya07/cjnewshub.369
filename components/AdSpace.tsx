

import React, { useMemo } from 'react';
import { AdSize } from '../types';
import { useNews } from '../context/NewsContext';

interface AdSpaceProps {
  size: AdSize;
  className?: string;
  label?: string;
}

export const AdSpace: React.FC<AdSpaceProps> = ({ size, className = '', label = 'Advertisement' }) => {
  const { advertisements, trackAdClick, currentUser, adSettings } = useNews();
  const [width, height] = size.split('x');

  // Logic to hide ads
  // 1. Global switch is OFF
  // 2. User is Premium
  const shouldShowAds = useMemo(() => {
      if (!adSettings.enableAdsGlobally) return false;
      if (currentUser?.subscriptionPlan === 'premium') return false;
      return true;
  }, [adSettings, currentUser]);

  // Filter ads for this specific size that are active and within date range
  const activeAds = useMemo(() => {
      if (!shouldShowAds) return [];
      const now = new Date().toISOString().split('T')[0];
      return advertisements.filter(ad => 
          ad.size === size && 
          ad.status === 'active' &&
          ad.startDate <= now &&
          ad.endDate >= now
      );
  }, [advertisements, size, shouldShowAds]);

  // Select a random ad from the available pool for this size
  const currentAd = useMemo(() => {
      if (activeAds.length === 0) return null;
      const randomIndex = Math.floor(Math.random() * activeAds.length);
      return activeAds[randomIndex];
  }, [activeAds]);

  if (!shouldShowAds) return null;

  return (
    <div className={`flex flex-col items-center justify-center my-4 ${className}`}>
        <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 self-end w-full text-right pr-2">
            {label}
        </span>
      
      {currentAd ? (
          <a 
            href={currentAd.targetUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => trackAdClick(currentAd.id)}
            className="block relative group overflow-hidden"
            style={{ width: '100%', maxWidth: `${width}px`, height: `${height}px` }}
            title={`Advertisement by ${currentAd.advertiserName}`}
          >
              <img 
                src={currentAd.imageUrl} 
                alt={currentAd.advertiserName} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none"></div>
          </a>
      ) : (
          <div 
            className="bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm font-sans relative overflow-hidden group"
            style={{ width: '100%', maxWidth: `${width}px`, height: `${height}px`, minHeight: `${height}px` }}
          >
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50 group-hover:bg-white/10 transition-colors">
                <span className="font-semibold tracking-wider text-xs">{size} PLACEHOLDER</span>
            </div>
            {/* Decorative pattern for aesthetics */}
            <div className="absolute inset-0 opacity-10" 
                 style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
            </div>
          </div>
      )}
    </div>
  );
};