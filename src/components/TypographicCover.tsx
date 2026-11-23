// components/TypographicCover.tsx
import React from 'react';

interface TypographicCoverProps {
  title: string;
  author?: string;
  kicker?: string; // small heading above the title, e.g. a paper's venue
  // card: text kept in the top part, since the card's overlay covers the bottom.
  // panel: text may use the whole cover, and shrinks on small screens where the panel's cover is small.
  layout?: 'card' | 'panel';
}

// Shading direction varies per title so a grid of cover-less items doesn't look copy-pasted
const SHADES = [
  'bg-gradient-to-br from-white/15 to-black/25',
  'bg-gradient-to-tr from-black/25 to-white/10',
  'bg-gradient-to-bl from-white/10 to-black/30',
  'bg-gradient-to-tl from-black/20 to-white/15',
];

function shadeFor(title: string): string {
  let hash = 0;
  for (const ch of title) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return SHADES[hash % SHADES.length];
}

// A designed stand-in for items without cover art (books Open Library has no cover for, and all
// papers): title and author set like a book jacket, in the theme's colors (primary + background
// text reads well in every theme).
const TypographicCover: React.FC<TypographicCoverProps> = ({ title, author, kicker, layout = 'card' }) => {
  const panel = layout === 'panel';
  return (
    <div className="relative w-full h-full bg-theme-primary text-theme-background overflow-hidden" aria-label={`${title} cover`} role="img">
      <div className={`absolute inset-0 ${shadeFor(title)}`} />
      <div className={`absolute border border-theme-background/40 ${panel ? 'inset-1.5 md:inset-3' : 'inset-3'}`} />
      <div className={`relative flex flex-col items-center text-center overflow-hidden ${
        panel ? 'h-full px-3 pt-4 md:px-6 md:pt-8' : 'max-h-[45%] px-6 pt-8'
      }`}>
        {kicker && (
          <p className={`font-semibold uppercase tracking-[0.2em] opacity-80 line-clamp-1 ${panel ? 'text-[7px] mb-1.5 md:text-[10px] md:mb-3' : 'text-[10px] mb-3'}`}>
            {kicker}
          </p>
        )}
        <p className={`font-serif font-bold leading-tight ${panel ? 'text-xs line-clamp-5 md:text-xl md:line-clamp-6' : 'text-xl line-clamp-3'}`}>
          {title}
        </p>
        <div className={`bg-theme-background/60 h-px ${panel ? 'w-6 my-2 md:w-12 md:my-4' : 'w-12 my-4'}`} />
        {author && <p className={`font-serif italic opacity-90 line-clamp-2 ${panel ? 'text-[9px] md:text-sm' : 'text-sm'}`}>{author}</p>}
      </div>
    </div>
  );
};

export default TypographicCover;
