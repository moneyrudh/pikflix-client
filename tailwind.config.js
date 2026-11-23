// tailwind.config.js
function themeColor(variable) {
  return ({ opacityValue }) =>
    opacityValue === undefined || opacityValue === '1'
      ? `var(${variable})`
      : `color-mix(in srgb, var(${variable}) calc(${opacityValue} * 100%), transparent)`;
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Theme colors come from CSS variables (globals.css). Opacity modifiers (`border-theme-text/10`)
      // mix the variable with transparent; a plain 'var(...)' value would make Tailwind drop those classes.
      colors: {
        theme: {
          primary: themeColor('--color-primary'),
          secondary: themeColor('--color-secondary'),
          accent: themeColor('--color-accent'),
          background: themeColor('--color-background'),
          surface: themeColor('--color-surface'),
          text: themeColor('--color-text'),
          'text-muted': themeColor('--color-text-muted'),
        },
      },
      backgroundImage: {
        'theme-pattern': 'var(--pattern-background)',
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
      },
      screens: {
        // Add these height-based breakpoints
        'tall': {'raw': '(min-height: 724px)'},
        'short': {'raw': '(max-height: 723px)'},
      }
    },
  },
  plugins: [],
}