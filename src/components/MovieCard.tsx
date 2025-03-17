// components/MovieCard.tsx
import React from 'react';
import Image from 'next/image';
import MoviePlaceholder from './MoviePlaceholder';
import { Movie } from '@/types/movie';

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  onClick: (movieId: number) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ id, title, posterPath, releaseDate, onClick }) => {
  // Extract year from release date
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  
  // TMDB image URL
  const hasImage = posterPath !== null && posterPath !== '';
  const imageUrl = hasImage ? `https://image.tmdb.org/t/p/w500${posterPath}` : '';
  
  const handleClick = () => {
    onClick(id);
  };
  
  return (
    <div 
      className="bg-theme-surface rounded-lg overflow-hidden shadow-md h-full transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 group cursor-pointer"
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
              {year && (
                <p className="text-gray-200 text-xs font-medium tracking-wider opacity-80">
                  {year}
                </p>
              )}
            </div>
          </>
        ) : (
          <MoviePlaceholder title={title} />
        )}
      </div>
    </div>
  );
};

export default MovieCard;