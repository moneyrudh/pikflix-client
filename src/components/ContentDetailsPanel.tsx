// components/ContentDetailsPanel.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Content, ContentType, Movie, Show, ProviderData, ProviderResponse, getContentTitle, getContentDate } from '@/types/content';
import ProvidersSection, { ProvidersSkeletonSection } from './ProvidersSection';

interface ContentDetailsPanelProps {
  item: Content | null;
  isOpen: boolean;
  onClose: () => void;
}

const ContentDetailsPanel: React.FC<ContentDetailsPanelProps> = ({ item, isOpen, onClose }) => {
  const [providers, setProviders] = useState<ProviderData | null>(null);
  const [isLoadingProviders, setIsLoadingProviders] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const region = "US";

  const fetchProviders = useCallback(async (contentId: number, contentType: string) => {
    setProviders(null);
    setError(null);
    setIsLoadingProviders(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/providers/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content_id: contentId, content_type: contentType, region }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }

      const data: ProviderResponse = await response.json();
      const regionData = data.results[region] || null;
      setProviders(regionData);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error fetching providers:', err);
        setError(err.message);
      }
    } finally {
      setIsLoadingProviders(false);
    }
  }, [region]);

  useEffect(() => {
    if (item && isOpen) {
      fetchProviders(item.id, item.content_type);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (!isOpen) {
        setProviders(null);
        setIsLoadingProviders(false);
        setError(null);
      }
    };
  }, [item, isOpen, fetchProviders]);

  if (!item) return null;

  const isShow = item.content_type === ContentType.SHOW;
  const title = getContentTitle(item);
  const dateStr = getContentDate(item);

  const formatCurrency = (amount: number) => {
    if (!amount || amount === 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const formatRuntime = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const hasBackdrop = item.backdrop_path !== null && item.backdrop_path !== '';

  // Show-specific helpers
  const show = isShow ? (item as Show) : null;
  const movie = !isShow ? (item as Movie) : null;

  return (
    <div
      className={`fixed top-0 bottom-0 right-0 bg-theme-surface shadow-2xl overflow-y-auto transition-all duration-300 ease-in-out z-50 xl:w-1/2 w-full details-panel ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm transition-all duration-300"
        aria-label="Close details"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Hero section with backdrop */}
      <div className="relative w-full">
        <div className="relative w-full aspect-video">
          {hasBackdrop ? (
            <Image
              src={`https://image.tmdb.org/t/p/w1280${item.backdrop_path}`}
              alt={`${title} backdrop`}
              className="object-cover"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-theme-primary/20 to-theme-surface"></div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-theme-surface via-theme-surface/80 to-transparent"></div>

          <div className="absolute bottom-0 left-8 transform translate-y-1/2 w-28 h-40 md:w-32 md:h-48 shadow-xl rounded-lg overflow-hidden border-2 border-theme-surface">
            {item.poster_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                alt={`${title} poster`}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 112px, 128px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-theme-text/10">
                <span className="text-theme-text-muted">No poster</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-8 pt-24 pb-8">
          {/* Title and year */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-theme-text">{title}</h1>
            {dateStr && (
              <p className="text-theme-text-muted text-xl">
                {new Date(dateStr).getFullYear()}
              </p>
            )}
          </div>

          {/* Key stats row */}
          <div className="mb-8 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-theme-none mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-theme-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-theme-text">{item.vote_average?.toFixed(1) || 'N/A'}</div>
              <div className="text-xs text-theme-text-muted">{item.vote_count} votes</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-theme-none mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-theme-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              {isShow ? (
                <>
                  <div className="text-lg font-bold text-theme-text">{show!.number_of_seasons ?? 'N/A'}</div>
                  <div className="text-xs text-theme-text-muted">Seasons</div>
                </>
              ) : (
                <>
                  <div className="text-lg font-bold text-theme-text">{formatRuntime(movie!.runtime)}</div>
                  <div className="text-xs text-theme-text-muted">Runtime</div>
                </>
              )}
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-theme-none mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-theme-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l.828.828A.997.997 0 0115 4h1a1 1 0 110 2h-1.586l-.207-.207a2 2 0 00-2.828 0L11 6.172V8a1 1 0 11-2 0V5a1 1 0 01.293-.707l.828-.828A1 1 0 0112 3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-lg font-bold text-theme-text">
                {item.genres?.length ? item.genres[0].name : 'N/A'}
              </div>
              <div className="text-xs text-theme-text-muted">Primary Genre</div>
            </div>
          </div>

          {/* Tagline */}
          {item.tagline && (
            <div className="mb-6 italic text-theme-text-muted text-lg border-l-4 border-theme-primary/30 pl-4 py-1">
              &ldquo;{item.tagline}&rdquo;
            </div>
          )}

          {/* In Production badge for shows */}
          {isShow && show!.in_production && (
            <div className="mb-6">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium border border-green-500/30">
                Currently In Production
              </span>
            </div>
          )}

          {/* Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-theme-text">Overview</h2>
            <p className="text-theme-text leading-relaxed">{item.overview || 'No overview available.'}</p>
          </div>

          {/* Details section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div>
              {/* Date info */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2 text-theme-text">
                  {isShow ? 'Airing Info' : 'Release Info'}
                </h2>
                <div className="space-y-1">
                  {isShow ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-theme-text-muted">First Aired:</span>
                        <span className="text-theme-text font-medium">{formatDate(show!.first_air_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-text-muted">Last Aired:</span>
                        <span className="text-theme-text font-medium">{formatDate(show!.last_air_date)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-theme-text-muted">Release Date:</span>
                      <span className="text-theme-text font-medium">{formatDate(movie!.release_date)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-theme-text-muted">Status:</span>
                    <span className="text-theme-text font-medium">{item.status || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Show-specific: Episodes */}
              {isShow && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2 text-theme-text">Episodes</h2>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-theme-text-muted">Seasons:</span>
                      <span className="text-theme-text font-medium">{show!.number_of_seasons ?? 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-text-muted">Total Episodes:</span>
                      <span className="text-theme-text font-medium">{show!.number_of_episodes ?? 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Genres */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2 text-theme-text">Genres</h2>
                <div className="flex flex-wrap gap-2">
                  {item.genres?.length > 0 ? (
                    item.genres.map(genre => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-theme-text-muted text-theme-background font-bold rounded-full text-sm shadow-sm border border-theme-text-muted hover:-translate-y-1 transition-transform duration-200"
                      >
                        {genre.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-theme-text-muted">No genres listed</span>
                  )}
                </div>
              </div>

              {/* Providers */}
              {isLoadingProviders ? (
                <ProvidersSkeletonSection />
              ) : (
                <ProvidersSection
                  providerData={providers}
                  isLoading={false}
                />
              )}

              {/* Production Countries */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2 text-theme-text">Production Countries</h2>
                <div className="space-y-1">
                  {item.production_countries?.length > 0 ? (
                    item.production_countries.map(country => (
                      <div key={country.iso_3166_1} className="text-theme-text">
                        {country.name}
                      </div>
                    ))
                  ) : (
                    <span className="text-theme-text-muted">No countries listed</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div>
              {/* Movie: Financial info / Show: Networks & Creators */}
              {isShow ? (
                <>
                  {/* Networks */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2 text-theme-text">Networks</h2>
                    <div className="space-y-1">
                      {show!.networks?.length > 0 ? (
                        show!.networks.map(network => (
                          <div key={network.id} className="text-theme-text">
                            {network.name}
                          </div>
                        ))
                      ) : (
                        <span className="text-theme-text-muted">No networks listed</span>
                      )}
                    </div>
                  </div>

                  {/* Created By */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2 text-theme-text">Created By</h2>
                    <div className="space-y-1">
                      {show!.created_by?.length > 0 ? (
                        show!.created_by.map(creator => (
                          <div key={creator.id} className="text-theme-text">
                            {creator.name}
                          </div>
                        ))
                      ) : (
                        <span className="text-theme-text-muted">No creators listed</span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2 text-theme-text">Financial</h2>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-theme-text-muted">Budget:</span>
                      <span className="text-theme-text font-medium">{formatCurrency(movie!.budget)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-text-muted">Revenue:</span>
                      <span className="text-theme-text font-medium">{formatCurrency(movie!.revenue)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Production Companies */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2 text-theme-text">Production Companies</h2>
                <div className="space-y-1">
                  {item.production_companies?.length > 0 ? (
                    item.production_companies.map(company => (
                      <div key={company.id} className="text-theme-text">
                        {company.name}
                      </div>
                    ))
                  ) : (
                    <span className="text-theme-text-muted">No companies listed</span>
                  )}
                </div>
              </div>

              {/* Languages */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2 text-theme-text">Spoken Languages</h2>
                <div className="space-y-1">
                  {item.spoken_languages?.length > 0 ? (
                    item.spoken_languages.map(language => (
                      <div key={language.iso_639_1} className="text-theme-text">
                        {language.english_name}
                      </div>
                    ))
                  ) : (
                    <span className="text-theme-text-muted">No languages listed</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* External links */}
          <div className="mt-8 flex space-x-4">
            {item.homepage && (
              <a
                href={item.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 hover:bg-theme-primary hover:text-theme-background text-theme-primary rounded-lg transition-colors duration-300 inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Official Website
              </a>
            )}
            {!isShow && movie!.imdb_id && (
              <a
                href={`https://www.imdb.com/title/${movie!.imdb_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#F5C518]/0 hover:bg-[#F5C518]/30 text-[#f8c50d] font-bold rounded-lg transition-colors duration-300 inline-flex items-center"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.31 9.588v4.824h-1.59V9.589h1.59zM12.38 6v8.413h-1.59V6h1.59zm-3.42 0a.836.836 0 00-.759.506.913.913 0 00-.068.345v7.524c0 .121.023.24.068.346a.832.832 0 00.76.505h3.42V16H5V6h3.96z"/>
                </svg>
                View on IMDb
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDetailsPanel;
