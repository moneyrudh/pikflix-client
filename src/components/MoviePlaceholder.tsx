// components/MoviePlaceholder.tsx
import React from 'react';

interface MoviePlaceholderProps {
  title?: string;
}

const MoviePlaceholder: React.FC<MoviePlaceholderProps> = ({ title }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-theme-surface/50 p-4">
      <div className="text-center">
        <svg 
          className="w-12 h-12 mx-auto mb-4 text-theme-text-muted opacity-40" 
          fill="currentColor" 
          viewBox="0 0 20 20" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h-2v-2h2zm-2-2h2v-2h-2v2zm-4 4h2v-2h-2v2zm0-4h2v-2h-2v2zM7 9h2V7H7v2zm0 4h2v-2H7v2z" clipRule="evenodd"></path>
        </svg>
        <p className="text-theme-text-muted font-medium">
          {title || "No Poster Available"}
        </p>
      </div>
    </div>
  );
};

export default MoviePlaceholder;