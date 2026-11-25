// lib/ThemeContext.tsx
'use client'

import React, { createContext, useState, useContext, useEffect } from 'react';

// Now we have three themes
export type ThemeName = 'light' | 'maroon' | 'dark';

interface ThemeContextType {
    theme: ThemeName;
    setTheme: (theme: ThemeName) => void;
    ready: boolean; // false until the saved theme is read (the server can't know it)
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    setTheme: () => { },
    ready: false,
});

// Hook for easy theme access in components
export const useTheme = () => useContext(ThemeContext);

const STORAGE_KEY = 'pikflix-theme';

// Runs in <head> before the page paints (see layout.tsx), so the saved theme shows from the first frame
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem('${STORAGE_KEY}');if(t!=='light'&&t!=='maroon'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    // Starts as 'light' on the server and the client alike, so hydration matches; the saved theme
    // is picked up right after mount from the attribute the init script already set
    const [theme, setThemeState] = useState<ThemeName>('light');
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const current = document.documentElement.getAttribute('data-theme');
        if (current === 'light' || current === 'maroon' || current === 'dark') setThemeState(current);
        setReady(true);
    }, []);

    const setTheme = (newTheme: ThemeName) => {
        setThemeState(newTheme);
        try {
            localStorage.setItem(STORAGE_KEY, newTheme);
        } catch {
            // storage unavailable (private mode): the choice lasts for this page only
        }
    };

    // Add a data attribute to the document for CSS variable switching
    useEffect(() => {
        if (ready) document.documentElement.setAttribute('data-theme', theme);
    }, [theme, ready]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, ready }}>
            {children}
        </ThemeContext.Provider>
    );
};
