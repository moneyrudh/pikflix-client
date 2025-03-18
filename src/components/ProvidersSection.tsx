// components/ProvidersSection.tsx
import React, { JSX, useState } from 'react';
import Image from 'next/image';
import { ProviderData, Provider } from '@/types/movie';

interface ProvidersSectionProps {
  providerData: ProviderData | null;
  isLoading: boolean;
}

// Provider type display names for UI
const PROVIDER_TYPE_NAMES: Record<string, string> = {
  flatrate: 'Stream',
  rent: 'Rent',
  buy: 'Buy',
  ads: 'Free with ads'
};

// Provider type icons (using simple SVG)
const PROVIDER_TYPE_ICONS: Record<string, JSX.Element> = {
  flatrate: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
  ),
  rent: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
    </svg>
  ),
  buy: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
    </svg>
  ),
  ads: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
      <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
    </svg>
  )
};

export const ProvidersSkeletonSection: React.FC = () => (
  <div className="mb-6">
    <h2 className="text-lg font-semibold mb-2 text-theme-text">Watch Providers</h2>
    <div className="space-y-4">
      {/* Provider types skeleton */}
      {[1, 2].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-20 rounded bg-theme-text/10 animate-shimmer"></div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="w-10 h-10 rounded-md bg-theme-text/10 animate-shimmer"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ProviderLogo: React.FC<{ provider: Provider }> = ({ provider }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    
    // Handle tooltip visibility
    const handleMouseEnter = () => setShowTooltip(true);
    const handleMouseLeave = () => setShowTooltip(false);
    const handleClick = () => setShowTooltip(!showTooltip);
    
    return (
      <div className="relative">
        {/* Tooltip bubble that appears above the image */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-10">
            <div className="relative">
              {/* Bubble content */}
              <div className="bg-theme-surface-dark text-theme-text bg-theme-background px-3 py-1.5 rounded-lg text-sm shadow-md border border-theme-background whitespace-nowrap font-bold">
                {provider.provider_name}
              </div>
              {/* Downward pointing triangle */}
              <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 6L0 0H10L5 6Z" fill="currentColor" className="text-theme-background drop-shadow-sm shadow" />
                </svg>
              </div>
            </div>
          </div>
        )}
        
        {/* Provider logo with hover/click detection */}
        <div 
          className="relative w-10 h-10 rounded-md overflow-hidden transition-transform duration-200 hover:-translate-y-1"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          <Image
            src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
            alt={provider.provider_name}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
      </div>
    );
  };

const ProvidersSection: React.FC<ProvidersSectionProps> = ({ providerData, isLoading }) => {
  if (isLoading) {
    return <ProvidersSkeletonSection />;
  }

  if (!providerData) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2 text-theme-text">Watch Providers</h2>
        <p className="text-theme-text-muted">No provider information available for your region.</p>
      </div>
    );
  }

  // Get list of provider types that actually have data
  const availableProviderTypes = Object.keys(PROVIDER_TYPE_NAMES).filter(
    type => providerData[type as keyof ProviderData] && 
           Array.isArray(providerData[type as keyof ProviderData]) && 
           (providerData[type as keyof ProviderData] as Provider[]).length > 0
  );

  if (availableProviderTypes.length === 0) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2 text-theme-text">Watch Providers</h2>
        <p className="text-theme-text-muted">No streaming providers available in your region.</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2 text-theme-text">Watch Providers</h2>
      
      <div className="space-y-4">
        {availableProviderTypes.map(type => {
          const providers = providerData[type as keyof ProviderData] as Provider[];
          
          return (
            <div key={type} className="space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-theme-text-muted">
                  {PROVIDER_TYPE_ICONS[type]}
                </span>
                <span className="text-theme-text-muted font-medium text-sm">
                  {PROVIDER_TYPE_NAMES[type]}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {providers.map(provider => (
                  <ProviderLogo key={provider.provider_id} provider={provider} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {providerData.link && (
        <div className="mt-4">
          <a 
            href={providerData.link} 
            target="_blank"
            rel="noopener noreferrer"
            className="text-theme-primary hover:text-theme-accent text-sm flex items-center gap-1 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View more options on TMDB
          </a>
        </div>
      )}
    </div>
  );
};

export default ProvidersSection;