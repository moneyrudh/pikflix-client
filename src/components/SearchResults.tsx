// components/SearchResults.tsx
import React from 'react';
import { Movie } from '@/types/movie';
import MovieCard from './MovieCard';
import MovieCardSkeleton from './MovieCardSkeleton';

interface SearchResultsProps {
  movies: Movie[] | null;
  isLoading: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ movies, isLoading }) => {
  // Render 9 skeleton cards when loading
  if (isLoading) {
    return (
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 animate-fade-in">
        {Array.from({ length: 9 }).map((_, index) => (
          <MovieCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  // Render no results message
  if (!movies || movies.length === 0) {
    return null;
  }

  // Render movie grid
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 animate-fade-in">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          id={movie.id}
          title={movie.title}
          posterPath={movie.poster_path}
          releaseDate={movie.release_date}
        />
      ))}
    </div>
  );
};

export default SearchResults;