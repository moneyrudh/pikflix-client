// lib/ThemeContext.tsx
'use client'

import React, { createContext, useState, useContext, useEffect } from 'react';

// Now we have three themes
export type ThemeName = 'light' | 'maroon' | 'dark';

interface ThemeContextType {
    theme: ThemeName;
    setTheme: (theme: ThemeName) => void;
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    setTheme: () => { }, 
});

// Hook for easy theme access in components
export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    // Get theme from localStorage or system preference
    const [theme, setThemeState] = useState<ThemeName>(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('pikflix-theme');
            // If no saved theme, check system preference
            if (!savedTheme) {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            return (savedTheme as ThemeName) || 'light';
        }
        return 'light';
    });

    // Persist theme changes to localStorage
    const setTheme = (newTheme: ThemeName) => {
        setThemeState(newTheme);
        if (typeof window !== 'undefined') {
            localStorage.setItem('pikflix-theme', newTheme);
        }
    };

    // Add a data attribute to the document for CSS variable switching
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};