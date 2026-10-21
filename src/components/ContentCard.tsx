// components/ContentCard.tsx
import React from 'react';
import Image from 'next/image';
import ContentPlaceholder from './ContentPlaceholder';
import { ContentType } from '@/types/content';

interface ContentCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage?: number;
  contentType?: ContentType;
  hasTrailer?: boolean;
  reason?: string;
  isSelected?: boolean;
  onClick: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({
  id,
  title,
  posterPath,
  releaseDate,
  voteAverage,
  contentType,
  hasTrailer = false,
  reason,
  isSelected = false,
  onClick
}) => {
  // Extract year from release date
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  
  // Format rating to one decimal place if available
  const rating = voteAverage ? voteAverage.toFixed(1) : null;
  
  // TMDB image URL
  const hasImage = posterPath !== null && posterPath !== '';
  const imageUrl = hasImage ? `https://image.tmdb.org/t/p/w500${posterPath}` : '';
  
  const handleClick = () => {
    onClick();
  };
  
  return (
    <div 
      className={`bg-theme-surface rounded-lg overflow-hidden shadow-md h-full transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 group cursor-pointer ${
        isSelected
          ? 'ring-2 ring-theme-primary -translate-y-1 scale-[1.03] shadow-xl shadow-theme-primary/20'
          : ''
      }`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="relative aspect-[2/3] w-full">
        {/* Trailer available - plays from the details panel */}
        {hasTrailer && (
          <span className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium tracking-wider uppercase">
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.841z" />
            </svg>
            Trailer
          </span>
        )}

        {hasImage ? (
          <>
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Gradient overlay - subtle by default, stronger on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
            
            {/* Text container - positioned at bottom with padding */}
            <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-0 group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="font-bold text-white text-lg tracking-tight mb-1 drop-shadow-sm">{title}</h3>
              
              {/* Year and rating row with flex layout */}
              <div className="flex justify-between items-center">
                <span className="text-gray-200 text-xs font-medium tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {year}{contentType && <> · {contentType === ContentType.SHOW ? 'Show' : 'Movie'}</>}
                </span>
                
                {rating && (
                  <span className="text-gray-200 text-xs font-medium bg-black/40 px-2 py-0.5 rounded-md flex items-center">
                    <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    {rating}
                  </span>
                )}
              </div>

              {/* Why Claude picked it: expands on hover (grid rows animate 0fr -> 1fr) */}
              {reason && (
                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out">
                  <div className="overflow-hidden">
                    <p className="pt-2 text-gray-100 text-xs leading-snug line-clamp-3 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      {reason}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <ContentPlaceholder title={title} />
        )}
      </div>
    </div>
  );
};

export default ContentCard;