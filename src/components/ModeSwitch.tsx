'use client';
// components/ModeSwitch.tsx
// Search / Chat: the app's two modes. Built like the theme picker: a recessed track with a glossy knob
// that slides to the active mode, including across the page change (each page renders its own switch,
// so it remembers the last mode and slides from there).
import React, { useEffect, useState } from 'react';
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

const STORAGE_KEY = 'pikflix-mode';

function readLastMode(): number | null {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    return value === null ? null : Number(value);
  } catch {
    return null;
  }
}

const ModeSwitch: React.FC = () => {
  const pathname = usePathname();
  const active = pathname.startsWith('/chat') ? 1 : 0;
  // Start where the knob was on the previous page, then slide to this page's mode
  const [knob, setKnob] = useState(active);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const last = readLastMode();
    try {
      sessionStorage.setItem(STORAGE_KEY, String(active));
    } catch {
      // storage unavailable: the knob just starts in place
    }
    if (last === null || last === active || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setKnob(active);
      requestAnimationFrame(() => setAnimate(true));
      return;
    }
    setKnob(last);
    const frame = requestAnimationFrame(() => {
      setAnimate(true);
      requestAnimationFrame(() => setKnob(active));
    });
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return (
    <nav aria-label="Mode" className="relative h-10 rounded-full bg-theme-surface border border-theme-text/10 overflow-hidden shadow-[inset_0_2px_6px_rgba(0,0,0,0.1)]">
      {/* The theme picker's cylinder shading */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/5 rounded-full pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/20 rounded-full pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-black/10 rounded-full pointer-events-none" />

      <div className="relative grid h-full grid-cols-2 p-[3px]">
        {/* The knob: half the track, moved a full knob-width per mode */}
        <div
          aria-hidden="true"
          className={`absolute top-[3px] bottom-[3px] left-[3px] w-[calc(50%-3px)] rounded-full ${animate ? 'transition-transform duration-300 ease-[cubic-bezier(0.3,1.4,0.5,1)]' : ''}`}
          style={{
            transform: `translateX(${knob * 100}%)`,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.2)',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
          }}
        />
        {MODES.map((mode, index) => (
          <Link
            key={mode.href}
            href={mode.href}
            aria-current={index === active ? 'page' : undefined}
            className={`relative z-10 flex items-center justify-center gap-1.5 rounded-full px-2.5 sm:px-3.5 text-[13px] font-semibold transition-colors duration-300 ${
              index === knob ? 'text-theme-primary' : 'text-theme-text-muted hover:text-theme-text'
            }`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {mode.icon}
            </svg>
            {/* Icons only on phones, where the header also holds the logo and theme picker */}
            <span className="sr-only sm:not-sr-only">{mode.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default ModeSwitch;
