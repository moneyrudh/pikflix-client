// src/app/page.tsx
"use client";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import SearchResults from '@/components/SearchResults';
import ContentDetailsPanel from '@/components/ContentDetailsPanel';
import Spinner from '@/components/Spinner';
import { Content, ContentType, ContentTypeMode, UIState, ConversationTurn, RecommendationSummary, getContentTitle, getContentDate } from '@/types/content';

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
	const [uiState, setUiState] = useState<UIState>(UIState.INITIAL);
	const [sessionHistory, setSessionHistory] = useState<ConversationTurn[]>([]);
	const [currentItems, setCurrentItems] = useState<Content[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [screenSize, setScreenSize] = useState('base');
	const [contentTypeMode, setContentTypeMode] = useState<ContentTypeMode>(ContentTypeMode.MOVIE);
	const [webSearchEnabled, setWebSearchEnabled] = useState(false);

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

	// State for details panel
	const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
	const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<Content | null>(null);

	const searchInputRef = useRef<HTMLTextAreaElement>(null);
	const submittedQueryRef = useRef<string>('');
	const searchBarAnimRef = useRef<HTMLDivElement>(null);
	const latestTurnRef = useRef<HTMLDivElement>(null);
	const router = useRouter();
	const searchParams = useSearchParams();

	// Content type cycling
	const cycleContentType = () => {
		setContentTypeMode(prev => {
			if (prev === ContentTypeMode.MOVIE) return ContentTypeMode.SHOW;
			if (prev === ContentTypeMode.SHOW) return ContentTypeMode.BOTH;
			return ContentTypeMode.MOVIE;
		});
	};

	const contentTypeIcon = contentTypeMode === ContentTypeMode.MOVIE ? '🎬' : contentTypeMode === ContentTypeMode.SHOW ? '📺' : '🍿';
	const contentTypeLabel = contentTypeMode === ContentTypeMode.MOVIE ? 'Movies' : contentTypeMode === ContentTypeMode.SHOW ? 'Shows' : 'Movies & Shows';

	// Check for query in URL params on initial load
	useEffect(() => {
		const queryParam = searchParams.get('query');
		if (queryParam && !hasSearched) {
			setSearchQuery(queryParam);
			setUiState(UIState.SEARCHED);
			setHasSearched(true);
			performSearch(queryParam);
		} else if (queryParam && hasSearched) {
			setUiState(UIState.SEARCHED);
		}
	}, [searchParams, hasSearched]);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (
				e.key === "/" &&
				document.activeElement?.tagName !== "INPUT" &&
				document.activeElement?.tagName !== "TEXTAREA"
			) {
				e.preventDefault();
				searchInputRef.current?.focus();
			}

			if (e.key === "Escape" && isDetailsPanelOpen) {
				closeDetailsPanel();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isDetailsPanelOpen]);

	// Find selected item when ID changes
	useEffect(() => {
		if (selectedItemId) {
			const allItems = [
				...sessionHistory.flatMap(turn => turn.items),
				...(currentItems || []),
			];
			const item = allItems.find(m => m.id === selectedItemId) || null;
			setSelectedItem(item);
		} else {
			setSelectedItem(null);
		}
	}, [selectedItemId, sessionHistory, currentItems]);

	// Check for item ID in URL on load
	useEffect(() => {
		if (firstLoadRef.current) {
			const contentIdParam = searchParams.get('content');
			if (contentIdParam && (sessionHistory.length > 0 || currentItems?.length)) {
				const contentId = parseInt(contentIdParam, 10);
				if (!isNaN(contentId)) {
					setSelectedItemId(contentId);
					setIsDetailsPanelOpen(true);
				}
			}
			firstLoadRef.current = false;
		}
	}, [searchParams, sessionHistory, currentItems]);

	// Screen size detection
	useEffect(() => {
		const checkScreenSize = () => {
			const width = window.innerWidth;
			const height = window.innerHeight;

			if (height < 724) {
				document.documentElement.classList.add('short-screen');
			} else {
				document.documentElement.classList.remove('short-screen');
			}
			if (width >= 1280) setScreenSize('xl');
			else if (width >= 1024) setScreenSize('lg');
			else if (width >= 768) setScreenSize('md');
			else if (width >= 640) setScreenSize('sm');
			else setScreenSize('base');
		};

		checkScreenSize();
		window.addEventListener('resize', checkScreenSize);
		return () => window.removeEventListener('resize', checkScreenSize);
	}, []);

	// Animation transition
	useEffect(() => {
		const el = searchBarAnimRef.current;
		if (uiState !== UIState.ANIMATING || !el) return;

		const onEnd = () => {
			const query = submittedQueryRef.current;
			setUiState(UIState.SEARCHED);
			setHasSearched(true);
			performSearch(query);
			router.push(`?query=${encodeURIComponent(query)}`, { scroll: false });
		};

		el.addEventListener('animationend', onEnd, { once: true });
		return () => el.removeEventListener('animationend', onEnd);
	}, [uiState]);

	// Scroll detection for glass header
	useEffect(() => {
		if (uiState !== UIState.SEARCHED) return;

		const handleScroll = () => {
			setSearchBarScrolled(window.scrollY > 20);
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, [uiState]);

	const getPlaceholderText = () => {
		switch (screenSize) {
			case 'xl':
				return contentTypeMode === ContentTypeMode.SHOW
					? "gripping limited series with unreliable narrators..."
					: "something with time travel and 90s nostalgia...";
			case 'lg':
				return contentTypeMode === ContentTypeMode.SHOW
					? "dark comedy shows like Succession"
					: "time travel movies with plot twists";
			case 'md':
				return contentTypeMode === ContentTypeMode.SHOW
					? "best sci-fi series ever"
					: "mind-bending sci-fi films";
			case 'sm':
			case 'base':
			default:
				return contentTypeMode === ContentTypeMode.SHOW
					? "thriller TV shows"
					: "obscure horror movies";
		}
	};

	const isNewItem = (item: Content, existing: Content[]) => {
		return !existing.some(e => e && e.id === item.id);
	};

	const handleItemClick = (itemId: number) => {
		setSelectedItemId(itemId);
		setIsDetailsPanelOpen(true);

		if (window.innerWidth < 768) {
			document.body.style.overflow = 'hidden';
		}
	};

	const closeDetailsPanel = () => {
		setIsDetailsPanelOpen(false);
		setSelectedItemId(null);

		const currentQuery = searchParams.get('query');
		if (currentQuery) {
			router.push(`?query=${encodeURIComponent(currentQuery)}`, { scroll: false });
		}

		document.body.style.overflow = '';
	};

	const buildApiHistory = (): { query: string; recommendations: RecommendationSummary[] }[] => {
		return sessionHistory.map(turn => ({
			query: turn.query,
			recommendations: turn.recommendations,
		}));
	};

	const performSearch = async (query: string) => {
		if (!query.trim()) return;

		try {
			setIsSearching(true);
			setError(null);
			setCurrentItems([]);
			setIsDetailsPanelOpen(false);
			setSelectedItemId(null);

			if (sessionHistory.length > 0) {
				setTimeout(() => {
					if (latestTurnRef.current) {
						const offset = 160;
						const y = latestTurnRef.current.getBoundingClientRect().top + window.scrollY - offset;
						smoothScrollTo(y, 1000);
					}
				}, 100);
			}

			const history = buildApiHistory();

			// Single request — backend handles "both" mode natively
			const response = await fetch('/api/recommendations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					query,
					content_type: contentTypeMode,
					web_search: webSearchEnabled,
					history: history.length > 0 ? history : undefined,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to fetch recommendations');
			}

			const reader = response.body!.getReader();
			const decoder = new TextDecoder();

			let buffer = '';
			let streamedItems: Content[] = [];

			while (true) {
				const { value, done } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n');
				buffer = lines.pop() || '';

				for (const line of lines) {
					if (line.trim()) {
						try {
							const data = JSON.parse(line.trim());
							data.recommendations.forEach((item: Content) => {
								if (isNewItem(item, streamedItems)) {
									streamedItems = [...streamedItems, item];
								}
							});
							setCurrentItems([...streamedItems]);
						} catch (e) {
							console.error('Error parsing JSON:', e);
						}
					}
				}
			}

			if (buffer.trim()) {
				try {
					const data = JSON.parse(buffer.trim());
					streamedItems = data.recommendations;
					setCurrentItems([...streamedItems]);
				} catch (e) {
					console.error('Error parsing final JSON:', e);
				}
			}

			// Commit to session history
			if (streamedItems.length > 0) {
				const completedTurn: ConversationTurn = {
					query,
					items: streamedItems,
					recommendations: streamedItems.map(item => ({
						title: getContentTitle(item),
						year: (() => {
							const d = getContentDate(item);
							return d ? parseInt(d.substring(0, 4)) : null;
						})(),
						reason: item.reason || null,
					})),
				};
				setSessionHistory(prev => [...prev, completedTurn]);
				setCurrentItems(null);
			}
		} catch (err) {
			console.error('Error:', err);
			setError(err instanceof Error ? err.message : 'An unexpected error occurred');
			setCurrentItems(null);
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
		if (searchInputRef.current) {
			searchInputRef.current.style.height = 'auto';
		}

		if (uiState === UIState.INITIAL) {
			setUiState(UIState.ANIMATING);
		} else if (uiState === UIState.SEARCHED) {
			router.push(`?query=${encodeURIComponent(query)}`, { scroll: false });
			performSearch(query);
		}
	};

	const getSearchBarPosition = () => {
		switch (uiState) {
		  case UIState.INITIAL:
			return 'absolute top-[45%] left-4 right-4';
		  case UIState.ANIMATING:
			return 'absolute left-4 right-4 transform-gpu transition-all duration-500 ease-in-out animate-to-top';
		  case UIState.SEARCHED:
			return 'hidden';
		  default:
			return 'absolute top-[45%] left-4 right-4';
		}
	};

	const getResultsStyle = () => {
		switch (uiState) {
		  case UIState.INITIAL:
			return 'absolute top-full w-full opacity-0 pointer-events-none';
		  case UIState.ANIMATING:
			return 'absolute top-full w-full opacity-0 transition-opacity duration-1000 ease-in-out pointer-events-none';
		  case UIState.SEARCHED:
			return 'w-full pt-32 opacity-100 transition-opacity duration-300 ease-in';
		  default:
			return 'absolute top-full w-full opacity-0 pointer-events-none';
		}
	};

	const searchForm = (
		<form onSubmit={handleSubmit} className="relative w-full group">
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
				className="w-full pt-4 pb-4 pl-4 pr-16 bg-theme-surface rounded-lg border border-theme-text/5 focus:border-theme-primary/30 shadow-[0_2px_15px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_15px_rgba(0,0,0,0.2)] focus:ring-2 focus:ring-theme-primary focus:outline-none focus:border-none text-theme-text transition-all duration-300 placeholder-theme-text-muted resize-none overflow-y-auto"
				disabled={isSearching || uiState === UIState.ANIMATING}
			/>
			<button
				type="submit"
				disabled={isSearching || uiState === UIState.ANIMATING}
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

	// Content type label shown below search bar
	const contentTypeLabelElement = (
		<div className="flex items-center justify-between mt-1.5 px-1">
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={cycleContentType}
					className="text-sm hover:scale-110 transition-transform duration-200"
					aria-label={`Switch content type. Current: ${contentTypeLabel}`}
					title={contentTypeLabel}
				>
					{contentTypeIcon}
				</button>
				<span className="text-theme-text-muted/30 text-xs">·</span>
				<button
					type="button"
					onClick={() => setWebSearchEnabled(prev => !prev)}
					className={`text-sm hover:scale-110 transition-all duration-200 ${webSearchEnabled ? 'opacity-100' : 'opacity-40'}`}
					aria-label={`Toggle web search. Current: ${webSearchEnabled ? 'On' : 'Off'}`}
					title={webSearchEnabled ? 'Web search enabled' : 'Web search disabled'}
				>
					🌐
				</button>
			</div>
			<span className="text-xs text-theme-text-muted/60 font-medium tracking-wide">
				{contentTypeLabel}{webSearchEnabled ? ' · Web' : ''}
			</span>
		</div>
	);

	return (
		<>
			{/* Glass overlay above search bar */}
			{uiState === UIState.SEARCHED && searchBarScrolled && (
				<div
					className="fixed top-0 left-0 right-0 h-[130px] z-40 backdrop-blur-md pointer-events-none"
					style={{
						maskImage: 'linear-gradient(to bottom, black 0%, black 40%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.2) 80%, transparent 100%)',
						WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 40%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.2) 80%, transparent 100%)',
					}}
				/>
			)}

			{uiState === UIState.SEARCHED && (
				<div className="fixed top-16 left-0 right-0 z-50 flex justify-center pb-3">
					<div
						className="w-full lg:w-3/4 xl:w-1/2 px-8 transition-transform duration-500 ease-in-out"
						style={{ transform: isDetailsPanelOpen ? 'translateX(-50%)' : 'translateX(0)' }}
					>
						{searchForm}
						{contentTypeLabelElement}
					</div>
				</div>
			)}

			<PageLayout isDetailsPanelOpen={isDetailsPanelOpen}>
				<div className="relative flex flex-col items-center w-full px-4 min-h-[90vh]">
					{/* Main title only shown before search */}
					{uiState === UIState.INITIAL && (
						<div className="absolute short:top-[15%] tall:top-[20%] left-0 right-0 space-y-2 animate-fade-in text-center">
							<h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
								<span className="gradient-text">Discover</span>
								<span className="block text-theme-text">Your Next Flix</span>
							</h1>
							<p className="text-theme-text-muted text-lg md:text-xl max-w-lg mx-auto mt-4 leading-relaxed">
								Describe what you&apos;re in the mood for and let AI find your perfect match
							</p>
						</div>
					)}

					{/* Feature tags - only shown before search */}
					{uiState === UIState.INITIAL && (
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
					{uiState === UIState.INITIAL && (
						<p className="absolute short:top-[65%] tall:top-[65%] left-0 right-0 text-theme-text-muted text-center text-sm max-w-md mx-auto opacity-80 animate-fade-in">
							Try being specific with genres, moods, themes, or even character traits to find exactly what you want.
						</p>
					)}

					{/* Search form with content type label */}
					<div ref={searchBarAnimRef} className={getSearchBarPosition()}>
						{searchForm}
						{contentTypeLabelElement}
					</div>

					{/* Error message */}
					{error && (
						<div className="absolute top-[15%] w-full mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 animate-fade-in">
							<p>{error}</p>
						</div>
					)}

					{/* Results section */}
					<div className={getResultsStyle()}>
						{(() => {
							const allTurns = sessionHistory.map(turn => ({
								query: turn.query,
								items: turn.items,
								loading: false,
							}));
							if (isSearching || (currentItems && currentItems.length > 0)) {
								allTurns.push({
									query: submittedQueryRef.current,
									items: currentItems || [],
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
										items={turn.items}
										isLoading={turn.loading}
										selectedItemId={selectedItemId}
										onItemClick={handleItemClick}
										showContentType={contentTypeMode === ContentTypeMode.BOTH}
									/>
								</div>
							));
						})()}

						{uiState === UIState.SEARCHED && (sessionHistory.length > 0 || (currentItems && currentItems.length > 0)) && (
						<div className="w-full text-center mt-6 mb-12 text-theme-text-muted text-xs">
							Data powered by <a
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

			{/* Details panel */}
			<ContentDetailsPanel
				item={selectedItem}
				isOpen={isDetailsPanelOpen}
				onClose={closeDetailsPanel}
			/>

			{/* Overlay backdrop for mobile */}
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
