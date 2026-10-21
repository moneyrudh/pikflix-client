// components/SearchResults.tsx
import React, { useRef } from 'react';
import { Content, ContentType, getContentKey, getContentTitle, getContentDate } from '@/types/content';
import ContentCard from './ContentCard';
import ContentCardSkeleton from './ContentCardSkeleton';

interface SearchResultsProps {
    items: Content[] | null;
    isLoading: boolean;
    selectedItemKey?: string | null;
    onItemClick: (itemKey: string) => void;
    showContentType?: boolean;
}

// Minimum gap between card entrances. Picks resolve concurrently, so several often arrive in
// the same frame; spacing them out makes them flow in instead of popping in together.
const CARD_STAGGER_MS = 90;

const SearchResults: React.FC<SearchResultsProps> = ({ items, isLoading, selectedItemKey, onItemClick, showContentType = false }) => {
    // Each card's entrance delay is fixed the first time it renders, by booking the next free
    // slot on a timeline. Stored per item key so re-renders never change (or replay) it.
    const entranceRef = useRef<{ delays: Map<string, number>; lastSlot: number }>({ delays: new Map(), lastSlot: 0 });

    const getEntranceDelay = (key: string): number => {
        const entrance = entranceRef.current;
        let delay = entrance.delays.get(key);
        if (delay === undefined) {
            const now = performance.now();
            const slot = Math.max(now, entrance.lastSlot + CARD_STAGGER_MS);
            entrance.lastSlot = slot;
            delay = slot - now;
            entrance.delays.set(key, delay);
        }
        return delay;
    };

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
            {items.map((item) => {
                const itemKey = getContentKey(item);
                return (
                <div
                    key={itemKey}
                    className="animate-card-in"
                    style={{ animationDelay: `${getEntranceDelay(itemKey)}ms` }}
                >
                    <ContentCard
                        id={item.id}
                        title={getContentTitle(item)}
                        posterPath={item.poster_path}
                        releaseDate={getContentDate(item)}
                        voteAverage={item.vote_average}
                        hasTrailer={!!item.trailer}
                        reason={item.reason}
                        contentType={showContentType ? item.content_type : undefined}
                        isSelected={itemKey === selectedItemKey}
                        onClick={() => onItemClick(itemKey)}
                    />
                </div>
                );
            })}

            {Array.from({ length: placeholdersNeeded }).map((_, index) => (
                <ContentCardSkeleton key={`remaining-skeleton-${index}`} />
            ))}
        </div>
    );
};

export default SearchResults;
