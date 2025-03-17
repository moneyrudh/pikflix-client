// src/app/page.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import SearchResults from '@/components/SearchResults';
import Spinner from '@/components/Spinner';
import { Movie } from '@/types/movie';

export default function Home() {
	const [searchQuery, setSearchQuery] = useState('');
	const [isSearching, setIsSearching] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const [movies, setMovies] = useState<Movie[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const router = useRouter();
	const searchParams = useSearchParams();

	// Check for query in URL params on initial load
	useEffect(() => {
		const queryParam = searchParams.get('query');
		if (queryParam) {
			setSearchQuery(queryParam);
			handleSearch(queryParam);
		}
	}, [searchParams]);

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
		};

		// Add the event listener to the window
		window.addEventListener("keydown", handleKeyDown);
		
		// Clean up the event listener when the component unmounts
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	// Handle the search submission
	const handleSearch = async (query: string = searchQuery) => {
		if (!query.trim()) return;

		try {
			setIsSearching(true);
			setHasSearched(true);
			setError(null);
			
			// Update URL with query param without refreshing the page
			router.push(`?query=${encodeURIComponent(query)}`);

			const response = await fetch('/api/movies', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ query }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to fetch movie recommendations');
			}

			const data = await response.json();
			setMovies(data.recommendations);
		} catch (err) {
			console.error('Error fetching movie recommendations:', err);
			setError(err instanceof Error ? err.message : 'An unexpected error occurred');
			setMovies(null);
		} finally {
			setIsSearching(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		handleSearch();
	};

	return (
		<PageLayout>
			<div className="flex flex-col items-center justify-start min-h-[90vh] w-full md:w-1/2 px-4 py-10 transition-all duration-500">
				{/* Main title only shown before search */}
				{!hasSearched && (
					<div className="space-y-2 animate-fade-in mb-8 text-center">
						<h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
							<span className="gradient-text">Discover</span>
							<span className="block text-theme-text">Your Next Flix</span>
						</h1>
						<p className="text-theme-text-muted text-lg md:text-xl max-w-lg mx-auto mt-4 leading-relaxed">
							Describe what you're in the mood for and let AI find your perfect movie match
						</p>
					</div>
				)}

				{/* Search form - transitions up when search is performed */}
				<div className={`w-full transition-all duration-500 ease-in-out ${hasSearched ? 'mb-4' : 'mt-8 mb-8'}`}>
					<form onSubmit={handleSubmit} className="relative w-full">
						<div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-theme-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
						<input
							ref={searchInputRef}
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="something with time travel and 90s nostalgia..."
							className="w-full py-4 pl-12 pr-16 bg-theme-surface rounded-xl border border-theme-text/5 focus:border-theme-primary/30 shadow-[0_2px_15px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_15px_rgba(0,0,0,0.2)] focus:ring-2 focus:ring-theme-primary focus:outline-none focus:border-none text-theme-text transition-all duration-300 placeholder-theme-text-muted"
							disabled={isSearching}
						/>
						<button 
							type="submit"
							disabled={isSearching}
							className="absolute inset-y-0 right-3 my-auto flex items-center justify-center w-10 h-10 rounded-lg bg-theme-primary text-white hover:bg-theme-accent transition-colors duration-300 disabled:opacity-70"
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
						<div className="absolute right-16 top-1/2 -translate-y-1/2 flex items-center text-xs text-theme-text-muted opacity-60 pointer-events-none">
							<kbd className="px-1.5 py-0.5 bg-theme-surface border border-theme-text/10 rounded text-theme-text-muted font-mono">/</kbd>
							<span className="ml-1">to focus</span>
						</div>
					</form>
				</div>

				{/* Feature tags - only shown before search */}
				{!hasSearched && (
					<div className="flex flex-wrap justify-center gap-2 mt-4 animate-fade-in">
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

				{/* Error message */}
				{error && (
					<div className="w-full mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 animate-fade-in">
						<p>{error}</p>
					</div>
				)}

				{/* Movie results section */}
				{(hasSearched || isSearching) && (
					<SearchResults movies={movies} isLoading={isSearching} />
				)}

				{/* Bottom text - only shown before search */}
				{!hasSearched && (
					<p className="text-theme-text-muted text-center text-sm mt-10 max-w-md mx-auto opacity-80 animate-fade-in">
						Try being specific with genres, moods, themes, or even character traits to find exactly what you want.
					</p>
				)}
			</div>
		</PageLayout>
	);
}