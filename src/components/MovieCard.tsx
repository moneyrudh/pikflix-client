// components/MovieCard.tsx
import React from 'react';
import Image from 'next/image';
import MoviePlaceholder from './MoviePlaceholder';

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
}

const MovieCard: React.FC<MovieCardProps> = ({ id, title, posterPath, releaseDate }) => {
  // Extract year from release date
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  
  // TMDB image URL
  const hasImage = posterPath !== null && posterPath !== '';
  const imageUrl = hasImage ? `https://image.tmdb.org/t/p/w500${posterPath}` : '';
  
  return (
    <div className="bg-theme-surface rounded-lg overflow-hidden shadow-md h-full transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
      <div className="relative aspect-[2/3] w-full">
        {hasImage ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <MoviePlaceholder title={title} />
        )}
      </div>
      <div className="p-4 flex flex-col justify-between">
        <h3 className="font-bold text-theme-text text-lg">{title}</h3>
        {year && <p className="text-theme-text-muted text-sm mt-1">{year}</p>}
      </div>
    </div>
  );
};

export default MovieCard;