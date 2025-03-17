// src/app/page.tsx
"use client";

import React from 'react';
import PageLayout from '@/components/PageLayout';
import { useRef, useEffect } from 'react';

export default function Home() {
	const searchInputRef = useRef<HTMLInputElement>(null);

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

	
	return (
		<PageLayout>
			<div className="flex flex-col items-center justify-center min-h-[90vh] px-4 w-1/2">
				<div className="w-full max-w-2xl mx-auto space-y-8 text-center">
					{/* Main title with gradient effect */}
					<div className="space-y-2">
						<h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
							<span className="gradient-text">Discover</span>
							<span className="block text-theme-text">Your Next Film</span>
						</h1>
						<p className="text-theme-text-muted text-lg md:text-xl max-w-lg mx-auto mt-4 leading-relaxed">
							Describe what you're in the mood for and let AI find your perfect movie match
						</p>
					</div>

					{/* Search input with animation */}
					<div className="relative w-full mt-12 transition-all duration-300 transform hover:scale-[1.01]">
						<div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-theme-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
						<input
							ref={searchInputRef}
							type="text"
							placeholder="something with time travel and 90s nostalgia..."
							className="w-full py-4 pl-12 pr-16 bg-theme-surface rounded-xl border border-theme-text/5 focus:border-theme-primary/30 shadow-[0_2px_15px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_15px_rgba(0,0,0,0.2)] focus:ring-2 focus:ring-theme-primary focus:outline-none focus:border-none text-theme-text transition-all duration-300 placeholder-theme-text-muted"
						/>
						<button className="absolute inset-y-0 right-3 my-auto flex items-center justify-center w-10 h-10 rounded-lg bg-theme-primary text-white hover:bg-theme-accent transition-colors duration-300">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-theme-background" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
							</svg>
						</button>

						<div className="absolute right-16 top-1/2 -translate-y-1/2 flex items-center text-sm text-theme-text-muted opacity-60 pointer-events-none">
							<span className="text-theme-primary font-bold"><kbd className="px-1.5 py-0.5 bg-theme-surface border border-theme-text/10 rounded text-theme-primary font-mono">/</kbd> to focus</span>
						</div>
					</div>

					{/* Feature tags with subtle animation */}
					<div className="flex flex-wrap justify-center gap-2 mt-6">
						{["Natural Language", "AI Powered", "Personalized"].map((tag, i) => (
							<span
								key={i}
								className="px-3 py-1 text-xs font-medium rounded-full bg-theme-surface text-theme-text-muted border border-theme-text/5 hover:border-theme-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm"
							>
								{tag}
							</span>
						))}
					</div>

					{/* Bottom text with subtle styling */}
					<p className="text-theme-text-muted text-sm mt-10 max-w-md mx-auto opacity-80">
						Try being specific with genres, moods, themes, or even character traits to find exactly what you want.
					</p>
				</div>
			</div>
		</PageLayout>
	);
}