// components/MovieCardSkeleton.tsx
import React from 'react';

const MovieCardSkeleton: React.FC = () => {
  return (
    <div className="bg-theme-surface rounded-lg overflow-hidden shadow-md h-full animate-pulse">
      {/* Poster placeholder */}
      <div className="relative aspect-[2/3] w-full bg-theme-text/10" />
      
      {/* Title placeholder */}
      <div className="p-4">
        <div className="h-4 bg-theme-text/10 rounded w-3/4 mb-2"></div>
        {/* Year placeholder */}
        <div className="h-3 bg-theme-text/10 rounded w-1/3"></div>
      </div>
    </div>
  );
};

export default MovieCardSkeleton;