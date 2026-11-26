'use client';
// components/ModeLink.tsx
// The way to the other mode: a chat icon on search (accent-tinted, an invitation) and a search icon on
// chat (quiet). Lives at the start of the theme picker's capsule, so the header's controls stay together.
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ModeLink: React.FC = () => {
  const onChat = usePathname().startsWith('/chat');
  const label = onChat ? 'Search' : 'Chat';
  return (
    <Link
      href={onChat ? '/' : '/chat'}
      aria-label={label}
      title={label}
      className={`mode-link flex h-8 w-8 items-center justify-center ${onChat ? 'text-theme-text-muted' : 'text-theme-primary'}`}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {onChat
          ? <path d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
          : <path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" />}
      </svg>
    </Link>
  );
};

export default ModeLink;
