// components/TypographicCover.tsx
import React from 'react';

interface TypographicCoverProps {
  title: string;
  author?: string;
}

// Shading direction varies per title so a grid of cover-less books doesn't look copy-pasted
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

// A designed stand-in for books Open Library has no cover for: title and author set like a
// book jacket, in the theme's colors (primary + background text reads well in every theme).
const TypographicCover: React.FC<TypographicCoverProps> = ({ title, author }) => (
  <div className="relative w-full h-full bg-theme-primary text-theme-background overflow-hidden" aria-label={`${title} cover`} role="img">
    <div className={`absolute inset-0 ${shadeFor(title)}`} />
    <div className="absolute inset-3 border border-theme-background/40" />
    {/* Text stays near the top: on cards the lower half is under the title/year overlay */}
    <div className="relative max-h-[45%] overflow-hidden flex flex-col items-center text-center px-6 pt-8">
      <p className="font-serif font-bold leading-tight text-xl line-clamp-3">{title}</p>
      <div className="bg-theme-background/60 h-px w-12 my-4" />
      {author && <p className="font-serif italic opacity-90 line-clamp-2 text-sm">{author}</p>}
    </div>
  </div>
);

export default TypographicCover;
