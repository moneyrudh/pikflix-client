// components/ThemeSelector.tsx
import React from 'react';
import { useTheme } from '@/lib/ThemeContext';
import { useEffect } from 'react';

const ThemeSelector: React.FC = () => {
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        // Force a repaint to ensure the slider position updates
        const slider = document.querySelector('.theme-slider');
        if (slider) {
            // Trigger layout recalculation
            window.getComputedStyle(slider).getPropertyValue('left');
        }
    }, [theme]);
    
    // Calculate proper slider position to align with SVGs
    const getSliderPosition = () => {
        switch(theme) {
            case 'light': return 'calc(20px)';  // Aligned with first SVG
            case 'maroon': return 'calc(50%)';  // Center
            case 'dark': return 'calc(100% - 20px)';  // Aligned with last SVG
            default: return 'calc(16px)';
        }
    };

    return (
        <div className="relative">
            <div className="w-[130px] h-10 rounded-full bg-theme-surface border border-theme-text/10 relative overflow-hidden shadow-[inset_0_2px_6px_rgba(0,0,0,0.1)]">
                {/* Create cylindrical 3D effect with gradients */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/5 rounded-full pointer-events-none"></div>
                <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20 rounded-full pointer-events-none"></div>
                <div className="absolute inset-x-0 bottom-0 h-[1px] bg-black/10 rounded-full pointer-events-none"></div>
                
                {/* Circular indicator that moves between positions */}
                <div 
                    className="absolute top-[3px] h-8 w-8 rounded-full transition-all duration-300 ease-out transform -translate-x-1/2 theme-slider"
                    style={{ 
                        left: getSliderPosition(),
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.2)',
                        borderTop: '1px solid rgba(255,255,255,0.15)',
                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                    }}
                />
                
                {/* Theme buttons container - positioned for extreme ends and center */}
                <div className="relative h-full flex justify-between items-center">
                    {/* Light theme - at left edge */}
                    <button 
                        onClick={() => setTheme('light')} 
                        className={`z-10 flex justify-center items-center h-full pl-[10px] pr-2 ${theme === 'light' ? 'text-theme-primary' : 'text-theme-text-muted hover:text-theme-text'}`}
                        aria-label="Light theme"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                        </svg>
                    </button>
                    
                    {/* Maroon theme - in center */}
                    <button 
                        onClick={() => setTheme('maroon')} 
                        className={`z-10 flex justify-center items-center h-full px-2 ${theme === 'maroon' ? 'text-theme-primary' : 'text-theme-text-muted hover:text-theme-text'}`}
                        aria-label="Maroon theme"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                        </svg>
                    </button>
                    
                    {/* Dark theme - at right edge */}
                    <button 
                        onClick={() => setTheme('dark')} 
                        className={`z-10 flex justify-center items-center h-full pl-2 pr-[10px] ${theme === 'dark' ? 'text-theme-primary' : 'text-theme-text-muted hover:text-theme-text'}`}
                        aria-label="Dark theme"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThemeSelector;