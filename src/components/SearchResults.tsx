// components/SearchResults.tsx
import React from 'react';
import { Content, ContentType, getContentTitle, getContentDate } from '@/types/content';
import ContentCard from './ContentCard';
import ContentCardSkeleton from './ContentCardSkeleton';

interface SearchResultsProps {
    items: Content[] | null;
    isLoading: boolean;
    selectedItemId?: number | null;
    onItemClick: (itemId: number) => void;
    showContentType?: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ items, isLoading, selectedItemId, onItemClick, showContentType = false }) => {
    const loadedCount = items?.length || 0;
    const placeholdersNeeded = isLoading ? Math.max(0, 9 - loadedCount) : 0;

    if (isLoading && loadedCount === 0) {
        return (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-8 animate-fade-in mb-10">
                {Array.from({ length: 9 }).map((_, index) => (
                    <ContentCardSkeleton key={`skeleton-${index}`} />
                ))}
            </div>
        );
    }

    if (!items || items.length === 0) {
        return null;
    }

    return (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-8 animate-fade-in mb-10">
            {items.map((item) => (
                <ContentCard
                    key={item.id}
                    id={item.id}
                    title={getContentTitle(item)}
                    posterPath={item.poster_path}
                    releaseDate={getContentDate(item)}
                    voteAverage={item.vote_average}
                    contentType={showContentType ? item.content_type : undefined}
                    isSelected={item.id === selectedItemId}
                    onClick={onItemClick}
                />
            ))}

            {Array.from({ length: placeholdersNeeded }).map((_, index) => (
                <ContentCardSkeleton key={`remaining-skeleton-${index}`} />
            ))}
        </div>
    );
};

export default SearchResults;
