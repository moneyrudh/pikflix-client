// components/chat/ChatBlocks.tsx
// Renderers for each block type of an agent reply (see ChatBlock), plus a streamed reply as a whole.
import React, { useState } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import {
  Content, ContentType, getAuthorShort, getContentImageUrl, getContentTitle, getContentYear, isWatchItem,
} from '@/types/content';
import { BlockSlot, ChatBlock, mediaContent } from '@/types/chat';
import TypographicCover from '../TypographicCover';
import Spinner from '../Spinner';
import ChatLink from './ChatLink';

type MediaBlock = Extract<ChatBlock, { type: 'media' }>;

const TYPE_LABEL: Record<ContentType, string> = {
  [ContentType.MOVIE]: 'Movie',
  [ContentType.SHOW]: 'Show',
  [ContentType.BOOK]: 'Book',
  [ContentType.PAPER]: 'Paper',
};

// Shown at the end of text still streaming. A character, not an element, so it sits right after the
// last word whatever markdown that word ends up in.
const CARET = ' ▍';

// Text is markdown from the model. No images or raw HTML: text a tool returned could otherwise
// smuggle in a tracking pixel or markup.
function TextBlock({ text, streaming = false }: { text: string; streaming?: boolean }) {
  return (
    <div className="chat-markdown text-[15px] leading-relaxed text-theme-text">
      <ReactMarkdown
        disallowedElements={['img']}
        unwrapDisallowed
        components={{
          a: ({ href, children }) => <ChatLink href={href}>{children}</ChatLink>,
        }}
      >
        {streaming ? text + CARET : text}
      </ReactMarkdown>
    </div>
  );
}

function metaLine(item: Content): string {
  const year = getContentYear(item);
  const parts: string[] = year ? [String(year)] : [];
  if (isWatchItem(item)) {
    if (item.vote_average) parts.push(`★ ${item.vote_average.toFixed(1)}`);
    if (item.content_type === ContentType.MOVIE && item.runtime) {
      parts.push(`${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m`);
    } else if (item.content_type === ContentType.SHOW && item.number_of_seasons) {
      parts.push(`${item.number_of_seasons} season${item.number_of_seasons === 1 ? '' : 's'}`);
    }
  } else {
    const author = getAuthorShort(item);
    if (author) parts.unshift(author);
  }
  return parts.join(' · ');
}

function MediaCard({ block, onOpen }: { block: MediaBlock; onOpen: (item: Content) => void }) {
  const item = mediaContent(block);
  const title = getContentTitle(item);
  const imageUrl = getContentImageUrl(item);
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="flex gap-3.5 p-3 text-left rounded-xl bg-theme-surface shadow-[0_2px_12px_var(--shadow-color)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_var(--shadow-color)] transition-all duration-300 animate-card-in focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
      aria-label={`View details for ${title}`}
    >
      <div className="relative w-[84px] aspect-[2/3] shrink-0 rounded-md overflow-hidden">
        {imageUrl ? (
          <Image src={imageUrl} alt="" fill className="object-cover" sizes="84px" />
        ) : (
          <TypographicCover layout="panel" title={title} author={isWatchItem(item) ? undefined : getAuthorShort(item)} />
        )}
      </div>
      <div className="flex flex-col gap-1 min-w-0 py-0.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-theme-primary">{TYPE_LABEL[item.content_type]}</span>
        <span className="font-semibold text-theme-text leading-snug line-clamp-2">{title}</span>
        <span className="text-xs text-theme-text-muted">{metaLine(item)}</span>
        {block.note && <span className="text-[13px] leading-snug text-theme-text/80 line-clamp-3 mt-0.5">{block.note}</span>}
      </div>
    </button>
  );
}

function CardSkeleton() {
  return (
    <div className="flex gap-3.5 p-3 rounded-xl bg-theme-surface/60" aria-hidden="true">
      <div className="w-[84px] aspect-[2/3] shrink-0 rounded-md bg-theme-text/10 animate-pulse" />
      <div className="flex-1 flex flex-col gap-2.5 pt-1">
        <div className="h-2.5 w-2/5 rounded bg-theme-text/10 animate-pulse" />
        <div className="h-3.5 w-3/4 rounded bg-theme-text/10 animate-pulse" />
        <div className="h-2.5 w-1/2 rounded bg-theme-text/10 animate-pulse" />
      </div>
    </div>
  );
}

// Click-to-play: nothing loads from YouTube until asked
function TrailerBlock({ block }: { block: Extract<ChatBlock, { type: 'trailer' }> }) {
  const [playing, setPlaying] = useState(false);
  const thumbnail = `https://i.ytimg.com/vi/${block.trailer.key}/hqdefault.jpg`;
  return (
    <figure className="rounded-2xl overflow-hidden bg-theme-surface shadow-[0_2px_12px_var(--shadow-color)] animate-card-in">
      <div className="relative aspect-video bg-black">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${block.trailer.key}?autoplay=1&rel=0`}
            title={`${block.title} trailer`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 w-full h-full" aria-label={`Play ${block.title} trailer`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- YouTube thumbnails aren't an allowed next/image host */}
            <img src={thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-95 transition-opacity" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-16 h-16 rounded-full bg-theme-primary text-theme-background shadow-xl group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 ml-1" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
            </span>
          </button>
        )}
      </div>
      <figcaption className="flex justify-between px-4 py-3 text-[13px]">
        <span className="font-medium text-theme-text">{block.title} · {block.trailer.name || 'Trailer'}</span>
        <span className="text-theme-text-muted">YouTube</span>
      </figcaption>
    </figure>
  );
}

function QuestionBlock({ block, onAnswer }: { block: Extract<ChatBlock, { type: 'question' }>; onAnswer?: (answer: string) => void }) {
  return (
    <div className="rounded-2xl bg-theme-surface p-4 flex flex-col gap-3 shadow-[0_2px_12px_var(--shadow-color)] animate-card-in">
      <p className="font-semibold text-theme-text">{block.question}</p>
      <div className="flex flex-wrap gap-2">
        {block.options.map(option => (
          <button
            key={option}
            type="button"
            disabled={!onAnswer}
            onClick={() => onAnswer?.(option)}
            className="min-h-[44px] px-4 rounded-full border border-theme-primary text-theme-primary text-sm font-medium hover:bg-theme-primary hover:text-theme-background transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

// Tool activity: live lines while the agent works, one collapsed line once it answers
export function StatusLines({ statuses, working }: { statuses: string[]; working: boolean }) {
  const [expanded, setExpanded] = useState(false);
  if (statuses.length === 0) return null;
  const check = (
    <svg className="w-4 h-4 shrink-0 text-theme-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
  );
  if (working || expanded) {
    return (
      <ul className="flex flex-col gap-1.5 text-[13px] text-theme-text-muted" aria-live="polite">
        {statuses.map((status, i) => (
          <li key={i} className="flex items-center gap-2">
            {working && i === statuses.length - 1 ? <Spinner size="sm" /> : check}
            <span className={working && i === statuses.length - 1 ? 'text-theme-text' : ''}>{status}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <button type="button" onClick={() => setExpanded(true)} className="self-start flex items-center gap-2 text-[13px] text-theme-text-muted hover:text-theme-text transition-colors text-left">
      {check}
      <span className="line-clamp-1">{statuses.join(' · ')}</span>
    </button>
  );
}

function isMediaSlot(slot: BlockSlot): boolean {
  return (slot.state === 'done' && slot.block.type === 'media') || (slot.state === 'streaming' && slot.blockType === 'media');
}

// A reply's blocks in order. Consecutive cards share a two-column grid.
export function ReplyBlocks({ slots, onOpen, onAnswer }: {
  slots: BlockSlot[];
  onOpen: (item: Content) => void;
  onAnswer?: (answer: string) => void;
}) {
  const groups: { media: boolean; slots: { slot: BlockSlot; index: number }[] }[] = [];
  slots.forEach((slot, index) => {
    if (slot.state === 'dropped') return;
    const media = isMediaSlot(slot);
    const last = groups[groups.length - 1];
    if (media && last?.media) last.slots.push({ slot, index });
    else groups.push({ media, slots: [{ slot, index }] });
  });

  const render = ({ slot, index }: { slot: BlockSlot; index: number }) => {
    if (slot.state === 'streaming') {
      if (slot.blockType === 'text') return <TextBlock key={index} text={slot.text} streaming />;
      return <CardSkeleton key={index} />;
    }
    if (slot.state !== 'done') return null;
    const block = slot.block;
    switch (block.type) {
      case 'text': return <TextBlock key={index} text={block.text} />;
      case 'media': return <MediaCard key={index} block={block} onOpen={onOpen} />;
      case 'trailer': return <TrailerBlock key={index} block={block} />;
      case 'question': return <QuestionBlock key={index} block={block} onAnswer={onAnswer} />;
      default: return null; // a block type this client doesn't know yet
    }
  };

  return (
    <>
      {groups.map((group, i) => group.media ? (
        <div key={`g${i}`} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">{group.slots.map(render)}</div>
      ) : (
        group.slots.map(render)
      ))}
    </>
  );
}
