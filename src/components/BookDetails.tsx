// components/BookDetails.tsx
import React, { useEffect, useState } from 'react';
import { Book } from '@/types/content';

interface BookDetailsProps {
  book: Book;
}

// Book-specific body of the details panel. The description isn't part of search results, so it's
// loaded from /api/books/[id] the first time the book is opened (the backend caches it after that).
const BookDetails: React.FC<BookDetailsProps> = ({ book }) => {
  const [description, setDescription] = useState<string | null>(book.description);
  const [isLoading, setIsLoading] = useState<boolean>(!book.description_checked_at);
  const [loadFailed, setLoadFailed] = useState<boolean>(false);

  useEffect(() => {
    setDescription(book.description);
    setLoadFailed(false);
    if (book.description_checked_at) {
      setIsLoading(false);
      return;
    }
    const controller = new AbortController();
    setIsLoading(true);
    fetch(`/api/books/${book.id}`, { signal: controller.signal })
      .then(response => (response.ok ? response.json() : null))
      .then((loaded: Book | null) => {
        setDescription(loaded?.description ?? null);
        // Not checked means Open Library couldn't be reached, not that there's no description
        setLoadFailed(!loaded?.description_checked_at);
      })
      .catch(err => {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error loading book:', err);
          setLoadFailed(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [book.id, book.description, book.description_checked_at]);

  const stats = [
    { label: 'Pages', value: book.page_count?.toLocaleString() },
    { label: 'Editions', value: book.edition_count?.toLocaleString() },
    { label: 'First published', value: book.first_publish_year?.toString() },
  ];

  return (
    <>
      {/* Key stats row */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl font-bold text-theme-text">{stat.value ?? 'N/A'}</div>
            <div className="text-xs text-theme-text-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-theme-text">About this book</h2>
        {isLoading ? (
          <div className="space-y-2 animate-pulse" aria-label="Loading description">
            <div className="h-4 bg-theme-text/10 rounded w-full" />
            <div className="h-4 bg-theme-text/10 rounded w-11/12" />
            <div className="h-4 bg-theme-text/10 rounded w-4/5" />
          </div>
        ) : (
          <p className="text-theme-text leading-relaxed whitespace-pre-line">
            {description || (loadFailed ? "Couldn't load the description right now. Try opening the book again." : 'No description available.')}
          </p>
        )}
      </div>

      {/* Subjects */}
      {book.subjects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2 text-theme-text">Subjects</h2>
          <div className="flex flex-wrap gap-2">
            {book.subjects.map(subject => (
              <span
                key={subject}
                className="px-3 py-1 bg-theme-text-muted text-theme-background font-bold rounded-full text-sm shadow-sm border border-theme-text-muted"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* External links */}
      <div className="mt-8 flex space-x-4">
        <a
          href={`https://openlibrary.org/works/${book.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 hover:bg-theme-primary hover:text-theme-background text-theme-primary rounded-lg transition-colors duration-300 inline-flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          View on Open Library
        </a>
      </div>
    </>
  );
};

export default BookDetails;
