// src/app/page.tsx
"use client";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import SearchResults from '@/components/SearchResults';
import MovieDetailsPanel from '@/components/MovieDetailsPanel';
import Spinner from '@/components/Spinner';
import { Movie, ConversationTurn, RecommendationSummary } from '@/types/movie';

export default function Page() {
	return (
		<Suspense fallback={<PageLayout isDetailsPanelOpen={false} children={undefined}></PageLayout>}>
			<Home />
		</Suspense>
	)
}

function Home() {
	const [searchQuery, setSearchQuery] = useState('');
	const [isSearching, setIsSearching] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const [uiState, setUiState] = useState<'initial' | 'animating' | 'searched'>('initial');
	const [sessionHistory, setSessionHistory] = useState<ConversationTurn[]>([]);
	const [currentMovies, setCurrentMovies] = useState<Movie[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [screenSize, setScreenSize] = useState('base');

	const firstLoadRef = useRef(true);
	const [searchBarScrolled, setSearchBarScrolled] = useState(false);

	const smoothScrollTo = (targetY: number, duration: number) => {
		const startY = window.scrollY;
		const diff = targetY - startY;
		const startTime = performance.now();

		const easeInOutCubic = (t: number) =>
			t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

		const step = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			window.scrollTo(0, startY + diff * easeInOutCubic(progress));
			if (progress < 1) requestAnimationFrame(step);
		};

		requestAnimationFrame(step);
	};

	// New state for movie details panel
	const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
	const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
	const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

	const searchInputRef = useRef<HTMLTextAreaElement>(null);
	const submittedQueryRef = useRef<string>('');
	const searchBarAnimRef = useRef<HTMLDivElement>(null);
	const latestTurnRef = useRef<HTMLDivElement>(null);
	const router = useRouter();
	const searchParams = useSearchParams();

	// Check for query in URL params on initial load
	useEffect(() => {
		const queryParam = searchParams.get('query');
		// Only perform search on first load, not on every URL change
		if (queryParam && !hasSearched) {
			setSearchQuery(queryParam);
			setUiState('searched');
			setHasSearched(true);
			performSearch(queryParam);
		} else if (queryParam && hasSearched) {
			// URL changed but already searched — keep input clear
			setUiState('searched');
		}
	}, [searchParams, hasSearched]);

	// Add event listener for the "/" key
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Only focus if "/" is pressed and the user isn't already typing in a form element
			if (
				e.key === "/" &&
				document.activeElement?.tagName !== "INPUT" &&
				document.activeElement?.tagName !== "TEXTAREA"
			) {
				e.preventDefault();
				searchInputRef.current?.focus();
			}

			// Close details panel on Escape key
			if (e.key === "Escape" && isDetailsPanelOpen) {
				closeDetailsPanel();
			}
		};

		// Add the event listener to the window
		window.addEventListener("keydown", handleKeyDown);

		// Clean up the event listener when the component unmounts
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isDetailsPanelOpen]);

	// Find selected movie when ID changes — search across all turns + current
	useEffect(() => {
		if (selectedMovieId) {
			const allMovies = [
				...sessionHistory.flatMap(turn => turn.movies),
				...(currentMovies || []),
			];
			const movie = allMovies.find(m => m.id === selectedMovieId) || null;
			setSelectedMovie(movie);
		} else {
			setSelectedMovie(null);
		}
	}, [selectedMovieId, sessionHistory, currentMovies]);

	// Check for movie ID in URL on load
	useEffect(() => {
		// Only run on first load, not on every URL change
		if (firstLoadRef.current) {
			const movieIdParam = searchParams.get('movie');
			if (movieIdParam && (sessionHistory.length > 0 || currentMovies?.length)) {
				const movieId = parseInt(movieIdParam, 10);
				if (!isNaN(movieId)) {
					setSelectedMovieId(movieId);
					setIsDetailsPanelOpen(true);
				}
			}
			firstLoadRef.current = false;
		}
	}, [searchParams, sessionHistory, currentMovies]);


	// Update the useEffect to detect different screen sizes
	useEffect(() => {
		// Function to check screen size and set appropriate value
		const checkScreenSize = () => {
			const width = window.innerWidth;
			const height = window.innerHeight;

			if (height < 724) {
				document.documentElement.classList.add('short-screen');
			} else {
				document.documentElement.classList.remove('short-screen');
			}
			if (width >= 1280) {
				setScreenSize('xl');
			} else if (width >= 1024) {
				setScreenSize('lg');
			} else if (width >= 768) {
				setScreenSize('md');
			} else if (width >= 640) {
				setScreenSize('sm');
			} else {
				setScreenSize('base');
			}
		};

		// Check on initial load
		checkScreenSize();

		// Set up event listener for window resize
		window.addEventListener('resize', checkScreenSize);

		// Clean up event listener
		return () => window.removeEventListener('resize', checkScreenSize);
	}, []);

	// Transition from animating → searched when the CSS animation completes
	useEffect(() => {
		const el = searchBarAnimRef.current;
		if (uiState !== 'animating' || !el) return;

		const onEnd = () => {
			const query = submittedQueryRef.current;
			setUiState('searched');
			setHasSearched(true);
			performSearch(query);
			router.push(`?query=${encodeURIComponent(query)}`, { scroll: false });
		};

		el.addEventListener('animationend', onEnd, { once: true });
		return () => el.removeEventListener('animationend', onEnd);
	}, [uiState]);

	// Detect when cards scroll behind the search bar
	useEffect(() => {
		if (uiState !== 'searched') return;

		const handleScroll = () => {
			// Search bar sits at ~top-16 (header) + its own height (~80px)
			// Cards start scrolling behind once the user scrolls at all past the results top
			setSearchBarScrolled(window.scrollY > 20);
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, [uiState]);

	// Function to get placeholder based on screen size
	const getPlaceholderText = () => {
		switch (screenSize) {
			case 'xl':
				return "something with time travel and 90s nostalgia...";
			case 'lg':
				return "time travel movies with plot twists";
			case 'md':
				return "mind-bending sci-fi films";
			case 'sm':
			case 'base':
			default:
				return "obscure horror movies";
		}
	};

	const isNewMovie = (movie: Movie, existingMovies: Movie[]) => {
		return !existingMovies.some(existing => existing && existing.id === movie.id);
	};

	// Handle movie card click
	const handleMovieClick = (movieId: number) => {
		setSelectedMovieId(movieId);
		setIsDetailsPanelOpen(true);

		// Add smooth body class to prevent background scrolling on mobile
		if (window.innerWidth < 768) {
			document.body.style.overflow = 'hidden';
		}
	};

	// Close details panel
	const closeDetailsPanel = () => {
		setIsDetailsPanelOpen(false);
		setSelectedMovieId(null);

		// Remove the movie ID from URL
		const currentQuery = searchParams.get('query');
		if (currentQuery) {
			router.push(`?query=${encodeURIComponent(currentQuery)}`, {
				scroll: false
			});
		}

		// Restore scrolling on mobile
		document.body.style.overflow = '';
	};

	// Build lightweight history for the API request
	const buildApiHistory = (): { query: string; recommendations: RecommendationSummary[] }[] => {
		return sessionHistory.map(turn => ({
			query: turn.query,
			recommendations: turn.recommendations,
		}));
	};

	// Separate the search logic from URL updates
	const performSearch = async (query: string) => {
		if (!query.trim()) return;

		try {
			setIsSearching(true);
			setError(null);
			setCurrentMovies([]); // Start with empty list for current turn

			// Close details panel when starting a new search
			setIsDetailsPanelOpen(false);
			setSelectedMovieId(null);

			// Auto-scroll to the new turn on follow-up searches
			// Offset by header (64px) + search bar (~80px) so the query label isn't hidden
			// Use a responsive offset — smaller screens need more space for the fixed header/bar
			if (sessionHistory.length > 0) {
				setTimeout(() => {
					if (latestTurnRef.current) {
						const w = window.innerWidth;
						const offset = 160;
						const y = latestTurnRef.current.getBoundingClientRect().top + window.scrollY - offset;
						smoothScrollTo(y, 1000);
					}
				}, 100);
			}

			const history = buildApiHistory();

			const response = await fetch('/api/movies', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ query, history: history.length > 0 ? history : undefined }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to fetch recommendations');
			}

			// Process the streaming response
			const reader = response.body!.getReader();
			const decoder = new TextDecoder();

			let buffer = '';
			let streamedMovies: Movie[] = [];

			while (true) {
				const { value, done } = await reader.read();

				if (done) break;

				buffer += decoder.decode(value, { stream: true });

				// Process complete lines
				const lines = buffer.split('\n');
				buffer = lines.pop() || ''; // Keep last incomplete line

				for (const line of lines) {
					if (line.trim()) {
						try {
							const data = JSON.parse(line.trim());
							// Update current movies as they come in
							data.recommendations.forEach((movie: Movie) => {
								if (isNewMovie(movie, streamedMovies)) {
									streamedMovies = [...streamedMovies, movie];
								}
							});
							setCurrentMovies([...streamedMovies]);
						} catch (e) {
							console.error('Error parsing JSON:', e);
						}
					}
				}
			}

			// Handle any remaining data in buffer
			if (buffer.trim()) {
				try {
					const data = JSON.parse(buffer.trim());
					streamedMovies = data.recommendations;
					setCurrentMovies(data.recommendations);
				} catch (e) {
					console.error('Error parsing final JSON:', e);
				}
			}

			// Once streaming is complete, commit this turn to session history
			if (streamedMovies.length > 0) {
				const completedTurn: ConversationTurn = {
					query,
					movies: streamedMovies,
					recommendations: streamedMovies.map(m => ({
						title: m.title,
						year: m.release_date ? parseInt(m.release_date.substring(0, 4)) : null,
						reason: m.reason || null,
					})),
				};
				setSessionHistory(prev => [...prev, completedTurn]);
				setCurrentMovies(null); // Clear current — it's now in history
			}
		} catch (err) {
			console.error('Error:', err);
			setError(err instanceof Error ? err.message : 'An unexpected error occurred');
			setCurrentMovies(null);
		} finally {
			setIsSearching(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!searchQuery.trim() || searchQuery === undefined) return;

		const query = searchQuery.trim();
		submittedQueryRef.current = query;
		setSearchQuery('');
		// Reset textarea height back to single line
		if (searchInputRef.current) {
			searchInputRef.current.style.height = 'auto';
		}

		if (uiState === 'initial') {
			// Start animation — animationend listener handles the transition
			setUiState('animating');
		} else if (uiState === 'searched') {
			// Already in top position, update URL directly
			router.push(`?query=${encodeURIComponent(query)}`, { scroll: false });
			performSearch(query);
		}
	};

	// Determine search bar positioning based on UI state
	const getSearchBarPosition = () => {
		switch (uiState) {
		  case 'initial':
			return 'absolute top-[45%] left-4 right-4';
		  case 'animating':
			return 'absolute left-4 right-4 transform-gpu transition-all duration-500 ease-in-out animate-to-top';
		  case 'searched':
			return 'hidden'; // Rendered outside PageLayout when searched
		  default:
			return 'absolute top-[45%] left-4 right-4';
		}
	  };
	  
	  // Update the getResultsStyle function
	const getResultsStyle = () => {
		switch (uiState) {
		  case 'initial':
			return 'absolute top-full w-full opacity-0 pointer-events-none';
		  case 'animating':
			return 'absolute top-full w-full opacity-0 transition-opacity duration-1000 ease-in-out pointer-events-none';
		  case 'searched':
			return 'w-full pt-32 opacity-100 transition-opacity duration-300 ease-in';
		  default:
			return 'absolute top-full w-full opacity-0 pointer-events-none';
		}
	};

	// Determine main page layout width based on details panel
	const getMainLayoutStyle = () => {
		return isDetailsPanelOpen ? 'flex justify-center' : 'flex justify-center';
	};

	const searchForm = (
		<form onSubmit={handleSubmit} className="relative w-full group">
			{/* <div className="absolute top-4 left-4 flex items-center pointer-events-none">
				<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-theme-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</div> */}
			<textarea
				ref={searchInputRef}
				rows={1}
				value={searchQuery}
				onChange={(e) => {
					setSearchQuery(e.target.value);
					requestAnimationFrame(() => {
						const el = e.target;
						el.style.height = 'auto';
						el.style.height = Math.min(el.scrollHeight, 104) + 'px';
						el.scrollTop = el.scrollHeight;
					});
				}}
				onKeyDown={(e) => {
					if (e.key === 'Enter' && !e.shiftKey) {
						e.preventDefault();
						handleSubmit(e);
					}
				}}
				placeholder={getPlaceholderText()}
				className="w-full pt-4 pb-4 pl-5 pr-16 bg-theme-surface rounded-lg border border-theme-text/5 focus:border-theme-primary/30 shadow-[0_2px_15px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_15px_rgba(0,0,0,0.2)] focus:ring-2 focus:ring-theme-primary focus:outline-none focus:border-none text-theme-text transition-all duration-300 placeholder-theme-text-muted resize-none overflow-y-auto"
				disabled={isSearching || uiState === 'animating'}
			/>
			<button
				type="submit"
				disabled={isSearching || uiState === 'animating'}
				className="absolute bottom-[14px] right-[8px] flex items-center justify-center w-10 h-10 rounded-lg bg-theme-primary text-white hover:bg-theme-accent transition-colors duration-300 disabled:opacity-70"
			>
				{isSearching ? (
					<Spinner size="sm" color="#FFFFFF" />
				) : (
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-theme-background" viewBox="0 0 20 20" fill="currentColor">
						<path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
					</svg>
				)}
			</button>

			{/* "/" key hint */}
			{(screenSize === 'lg' || screenSize === 'xl') && (
				<div className="absolute right-16 top-4 flex items-center text-xs text-theme-text-muted opacity-60 pointer-events-none group-focus-within:hidden">
					<kbd className="px-1.5 py-0.5 bg-theme-surface border border-theme-text/10 rounded text-theme-text-muted font-mono">/</kbd>
					<span className="ml-1">to focus</span>
				</div>
			)}
		</form>
	);

	return (
		<>
			{/* Fixed search bar - rendered outside PageLayout when in searched state */}
			{/* Glass overlay above search bar — blurs cards as they scroll behind */}
			{uiState === 'searched' && searchBarScrolled && (
				<div
					className="fixed top-0 left-0 right-0 h-[130px] z-40 backdrop-blur-md pointer-events-none"
					style={{
						maskImage: 'linear-gradient(to bottom, black 0%, black 40%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.2) 80%, transparent 100%)',
						WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 40%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.2) 80%, transparent 100%)',
					}}
				/>
			)}

			{uiState === 'searched' && (
				<div className="fixed top-16 left-0 right-0 z-50 flex justify-center pb-3">
					<div
						className="w-full lg:w-3/4 xl:w-1/2 px-8 transition-transform duration-500 ease-in-out"
						style={{ transform: isDetailsPanelOpen ? 'translateX(-50%)' : 'translateX(0)' }}
					>
						{searchForm}
					</div>
				</div>
			)}

			<PageLayout isDetailsPanelOpen={isDetailsPanelOpen}>
				{/* Container for positioning - always full height */}
				<div className="relative flex flex-col items-center w-full px-4 min-h-[90vh]">
					{/* Main title only shown before search */}
					{uiState === 'initial' && (
						<div className="absolute short:top-[15%] tall:top-[20%] left-0 right-0 space-y-2 animate-fade-in text-center">
							<h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
								<span className="gradient-text">Discover</span>
								<span className="block text-theme-text">Your Next Flix</span>
							</h1>
							<p className="text-theme-text-muted text-lg md:text-xl max-w-lg mx-auto mt-4 leading-relaxed">
								Describe what you're in the mood for and let AI find your perfect movie match
							</p>
						</div>
					)}

					{/* Feature tags - only shown before search */}
					{uiState === 'initial' && (
						<div className="absolute short:top-[60%] tall:top-[60%] left-0 right-0 flex flex-wrap justify-center gap-2 animate-fade-in">
							{["Natural Language", "AI Powered", "Personalized"].map((tag, i) => (
								<span
									key={i}
									className="px-3 py-1 text-xs font-medium rounded-full bg-theme-surface text-theme-text-muted border border-theme-text/5 hover:border-theme-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm"
								>
									{tag}
								</span>
							))}
						</div>
					)}

					{/* Bottom text - only shown before search */}
					{uiState === 'initial' && (
						<p className="absolute short:top-[65%] tall:top-[65%] left-0 right-0 text-theme-text-muted text-center text-sm max-w-md mx-auto opacity-80 animate-fade-in">
							Try being specific with genres, moods, themes, or even character traits to find exactly what you want.
						</p>
					)}

					{/* Search form - uses a function to determine position class */}
					<div ref={searchBarAnimRef} className={getSearchBarPosition()}>
						{searchForm}
					</div>

					{/* Error message */}
					{error && (
						<div className="absolute top-[15%] w-full mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 animate-fade-in">
							<p>{error}</p>
						</div>
					)}

					{/* Movie results section - only render when we're in searched state */}
					<div className={getResultsStyle()}>
						{/* All turns rendered as one unified list to avoid flicker */}
						{(() => {
							const allTurns = sessionHistory.map(turn => ({
								query: turn.query,
								movies: turn.movies,
								loading: false,
							}));
							if (isSearching || (currentMovies && currentMovies.length > 0)) {
								allTurns.push({
									query: submittedQueryRef.current,
									movies: currentMovies || [],
									loading: isSearching,
								});
							}
							return allTurns.map((turn, index) => (
								<div
									key={`turn-${index}`}
									ref={index === allTurns.length - 1 ? latestTurnRef : undefined}
									className={index === 0 ? 'mb-8 mt-4' : 'mb-8'}
								>
									<div className="flex items-center gap-2 pt-8 pb-2">
										<span className="text-sm text-theme-text-muted italic">
											&ldquo;{turn.query}&rdquo;
										</span>
									</div>
									<SearchResults
										movies={turn.movies}
										isLoading={turn.loading}
										selectedMovieId={selectedMovieId}
										onMovieClick={handleMovieClick}
									/>
								</div>
							));
						})()}

						{uiState === 'searched' && (sessionHistory.length > 0 || (currentMovies && currentMovies.length > 0)) && (
						<div className="w-full text-center mt-6 mb-12 text-theme-text-muted text-xs">
							Movie data powered by <a
							href="https://www.themoviedb.org"
							target="_blank"
							rel="noopener noreferrer"
							className="text-theme-primary hover:text-theme-accent transition-colors duration-300"
							>
							The Movie Database (TMDB)
							</a> and <a
							href="https://www.justwatch.com"
							target="_blank"
							rel="noopener noreferrer"
							className="text-theme-primary hover:text-theme-accent transition-colors duration-300"
							>
							JustWatch
							</a>
						</div>
						)}
					</div>
				</div>
			</PageLayout>

			{/* Movie details panel - render outside PageLayout for z-index stack */}
			<MovieDetailsPanel
				movie={selectedMovie}
				isOpen={isDetailsPanelOpen}
				onClose={closeDetailsPanel}
			/>

			{/* Overlay backdrop for mobile - only shown when panel is open */}
			{isDetailsPanelOpen && (
				<div
					className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-panel z-40"
					onClick={closeDetailsPanel}
					aria-hidden="true"
				/>
			)}
		</>
	);
}