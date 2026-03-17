// components/PageLayout.tsx
import React from 'react';
import { useTheme } from '@/lib/ThemeContext';
import ThemeSelector from './ThemeSelector';

interface PageLayoutProps {
  children: React.ReactNode;
  isDetailsPanelOpen: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, isDetailsPanelOpen }) => {
  return (
    <div className="min-h-screen bg-theme-background">
      {/* Full-width navbar - unchanged */}
      <header className="fixed top-0 z-50 w-full border-none border-theme-text/5 bg-transparent">
        <div className="w-full max-w-screen mx-auto px-8 lg:px-12 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center space-x-2 group">
            <span className="text-theme-primary font-bold text-2xl tracking-tighter group-hover:text-theme-accent transition-colors duration-300">
              pikflix
            </span>
          </a>
          
          <div className="flex items-center space-x-4">
            <ThemeSelector />
          </div>
        </div>
      </header>
      
      {/* This is the key change - instead of a fixed height container with overflow issues,
          we use a technique with an invisible copy to maintain document flow */}
      <div className="relative w-full pt-16 lg:pt-20">
        {/* Invisible duplicate that maintains proper document flow and height */}
        <div className="invisible">
          <div className="w-full flex justify-center">
            <div className="w-full lg:w-3/4 xl:w-1/2 px-4">
              {children}
            </div>
          </div>
        </div>
        
        {/* Visible content that animates */}
        <div className="absolute top-0 w-full">
          <div className="w-full flex justify-center">
            <main 
              className="w-full lg:w-3/4 xl:w-1/2 px-4 transition-transform duration-500 ease-in-out"
              style={{ 
                transform: isDetailsPanelOpen ? 'translateX(-50%)' : 'translateX(0)'
              }}
            >
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLayout;