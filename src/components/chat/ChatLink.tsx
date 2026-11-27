// components/chat/ChatLink.tsx
// Links inside agent replies. The model writes them, and its sources (catalogue descriptions, abstracts)
// are third-party text, so a reply could carry a link nobody vetted. Links to the sites PikFlix gets its
// data from open directly; any other site gets a confirmation that names where it goes.
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const TRUSTED_HOSTS = [
  'themoviedb.org',
  'imdb.com',
  'youtube.com',
  'youtu.be',
  'openlibrary.org',
  'archive.org',
  'semanticscholar.org',
  'doi.org',
  'arxiv.org',
  'wikipedia.org',
  'justwatch.com',
];

function isTrusted(host: string): boolean {
  return TRUSTED_HOSTS.some(trusted => host === trusted || host.endsWith(`.${trusted}`));
}

// Only web links; anything else (mailto:, javascript:, relative paths) isn't a link here
function parseWebUrl(href: string | undefined): URL | null {
  if (!href) return null;
  try {
    const url = new URL(href);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
}

const linkClass = 'text-theme-primary underline underline-offset-2 hover:text-theme-accent';

function ConfirmDialog({ url, onClose }: { url: URL; onClose: () => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [onClose]);

  // url.hostname is the browser's own form: a look-alike domain shows up as its raw xn-- spelling
  const host = url.hostname.replace(/^www\./, '');

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-panel animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-title"
        className="relative w-full max-w-sm rounded-xl bg-theme-surface border border-theme-text/10 p-5 shadow-[0_12px_40px_var(--shadow-color)] animate-message-in"
      >
        <h2 id="leave-title" className="text-[15px] font-semibold text-theme-text">
          This link goes to <span className="text-theme-primary break-all">{host}</span>
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-theme-text-muted break-all">{url.href}</p>
        <p className="mt-3 text-[13px] leading-relaxed text-theme-text-muted">
          It&apos;s outside the sites PikFlix gets its data from. Only continue if you trust it.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-lg text-sm font-medium text-theme-text hover:bg-theme-text/5 transition-colors"
          >
            Cancel
          </button>
          <a
            href={url.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={onClose}
            className="h-10 px-4 inline-flex items-center rounded-lg bg-theme-primary text-sm font-medium text-theme-background hover:bg-theme-accent transition-colors"
          >
            Continue
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
}

const ChatLink: React.FC<{ href?: string; children?: React.ReactNode }> = ({ href, children }) => {
  const [confirming, setConfirming] = useState(false);
  const url = parseWebUrl(href);
  if (!url) return <>{children}</>;

  if (isTrusted(url.hostname)) {
    return <a href={url.href} target="_blank" rel="noopener noreferrer nofollow" className={linkClass}>{children}</a>;
  }

  return (
    <>
      <a
        href={url.href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className={linkClass}
        onClick={e => {
          e.preventDefault();
          setConfirming(true);
        }}
      >
        {children}
      </a>
      {confirming && <ConfirmDialog url={url} onClose={() => setConfirming(false)} />}
    </>
  );
};

export default ChatLink;
