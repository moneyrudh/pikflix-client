// components/MovieCardSkeleton.tsx
import React from 'react';

const MovieCardSkeleton: React.FC = () => {
  return (
    <div className="bg-theme-surface rounded-lg overflow-hidden shadow-md h-full">
      {/* Poster placeholder with correct aspect ratio */}
      <div className="relative aspect-[2/3] w-full bg-theme-text/10">
        {/* Gradient overlay similar to the actual movie card */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/10 to-transparent opacity-60"></div>
        
        {/* Text placeholder container - positioned at bottom with padding */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Title placeholder - wider bar with shimmer animation */}
          <div className="h-5 rounded w-3/4 mb-2 animate-shimmer"></div>
          
          {/* Year and rating row - using flex with justify-between */}
          <div className="flex justify-between items-center">
            {/* Year placeholder - shorter bar with shimmer animation */}
            <div className="h-3 rounded w-1/4 animate-shimmer"></div>
            
            {/* Rating placeholder - small square for the rating */}
            <div className="h-3 rounded w-8 animate-shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCardSkeleton;