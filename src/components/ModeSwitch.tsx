'use client';
// components/ModeSwitch.tsx
// Search / Chat: the app's two modes, as a segmented switch in both headers
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MODES = [
  {
    href: '/',
    label: 'Search',
    icon: <path d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />,
  },
  {
    href: '/chat',
    label: 'Chat',
    icon: <path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" />,
  },
];

const ModeSwitch: React.FC = () => {
  const pathname = usePathname();
  return (
    <nav aria-label="Mode" className="flex h-10 items-center rounded-full bg-theme-surface border border-theme-text/10 p-1 shadow-[inset_0_2px_6px_rgba(0,0,0,0.06)]">
      {MODES.map(mode => {
        const active = mode.href === '/' ? pathname === '/' : pathname.startsWith(mode.href);
        return (
          <Link
            key={mode.href}
            href={mode.href}
            aria-current={active ? 'page' : undefined}
            className={`flex h-full items-center gap-1.5 rounded-full px-2.5 sm:px-3 text-[13px] font-medium transition-colors duration-200 ${
              active
                ? 'bg-theme-primary/10 text-theme-primary'
                : 'text-theme-text-muted hover:text-theme-text'
            }`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {mode.icon}
            </svg>
            {/* Icons only on phones, where the header also holds the logo and theme picker */}
            <span className="sr-only sm:not-sr-only">{mode.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default ModeSwitch;
