// components/PageLayout.tsx
import React from 'react';
import { useTheme } from '@/lib/ThemeContext';
import ThemeSelector from './ThemeSelector';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-theme-background transition-all duration-300">
      <header className="sticky top-0 z-50 border-none border-theme-text/5 glass-effect bg-theme-background shadow-sm">
        <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
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
      
      <main className="flex justify-center">
        {children}
      </main>
    </div>
  );
};

export default PageLayout;