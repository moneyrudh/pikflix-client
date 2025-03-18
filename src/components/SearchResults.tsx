// components/SearchResults.tsx
import React from 'react';
import { Movie } from '@/types/movie';
import MovieCard from './MovieCard';
import MovieCardSkeleton from './MovieCardSkeleton';

interface SearchResultsProps {
    movies: Movie[] | null;
    isLoading: boolean;
    onMovieClick: (movieId: number) => void;
}

// Update SearchResults to show partial results
const SearchResults: React.FC<SearchResultsProps> = ({ movies, isLoading, onMovieClick }) => {
    // Calculate how many placeholders we need
    const loadedCount = movies?.length || 0;
    const placeholdersNeeded = isLoading ? Math.max(0, 9 - loadedCount) : 0;

    // Show full skeleton grid when loading with no movies yet
    if (isLoading && loadedCount === 0) {
        return (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 animate-fade-in">
                {Array.from({ length: 9 }).map((_, index) => (
                    <MovieCardSkeleton key={`skeleton-${index}`} />
                ))}
            </div>
        );
    }

    // If no movies and not loading, return null
    if (!movies || movies.length === 0) {
        return null;
    }

    // Render loaded movies + placeholders for ones still loading
    return (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 animate-fade-in mb-10">
            {/* Show movies we have so far */}
            {movies.map((movie) => (
                <MovieCard
                    key={movie.id}
                    id={movie.id}
                    title={movie.title}
                    posterPath={movie.poster_path}
                    releaseDate={movie.release_date}
                    voteAverage={movie.vote_average}
                    onClick={onMovieClick}
                />
            ))}

            {/* Show placeholders for movies still loading */}
            {Array.from({ length: placeholdersNeeded }).map((_, index) => (
                <MovieCardSkeleton key={`remaining-skeleton-${index}`} />
            ))}
        </div>
    );
};

export default SearchResults;