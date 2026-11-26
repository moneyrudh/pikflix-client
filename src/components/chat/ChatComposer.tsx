// components/chat/ChatComposer.tsx
// Styled like the search bar on the home page (same box, border, focus ring and send button)
import React, { useEffect, useRef, useState } from 'react';

interface ChatComposerProps {
  busy: boolean; // a reply is streaming: the button stops it
  placeholder: string;
  onSend: (text: string) => void;
  onStop: () => void;
}

const MAX_CHARS = 2000; // the backend's limit

const ChatComposer: React.FC<ChatComposerProps> = ({ busy, placeholder, onSend, onStop }) => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // "/" focuses the input, as on the search page
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const resize = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    // height is border-box but scrollHeight excludes borders: add them back
    const border = el.offsetHeight - el.clientHeight;
    el.style.height = Math.min(el.scrollHeight, 180) + border + 'px';
  };

  const submit = () => {
    const message = text.trim();
    if (!message || busy) return;
    onSend(message);
    setText('');
    requestAnimationFrame(resize);
  };

  return (
    <form onSubmit={e => { e.preventDefault(); submit(); }} className="relative w-full group">
      <label htmlFor="chat-input" className="sr-only">Message PikFlix</label>
      <textarea
        id="chat-input"
        ref={inputRef}
        rows={1}
        value={text}
        maxLength={MAX_CHARS}
        autoFocus
        onChange={e => { setText(e.target.value); requestAnimationFrame(resize); }}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        className="block w-full py-4 pl-4 pr-16 bg-theme-surface rounded-lg border border-theme-text/5 shadow-[0_2px_15px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-theme-primary focus:outline-none focus:border-transparent text-theme-text placeholder-theme-text-muted resize-none overflow-y-auto transition-all duration-300"
      />

      {/* "/" hint while the input is empty and unfocused, on wide screens */}
      {!text && (
        <div className="hidden lg:flex absolute right-16 top-[18px] items-center text-xs text-theme-primary pointer-events-none group-focus-within:hidden">
          <kbd className="px-1.5 py-0.5 bg-theme-primary border border-theme-primary rounded text-theme-background font-mono font-bold">/</kbd>
          <span className="ml-1 font-bold">to focus</span>
        </div>
      )}

      {busy ? (
        <button type="button" onClick={onStop} className="absolute bottom-[9px] right-[8px] w-10 h-10 flex items-center justify-center rounded-lg bg-theme-primary text-theme-background hover:bg-theme-accent transition-colors duration-300" aria-label="Stop generating">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="2" /></svg>
        </button>
      ) : (
        <button type="submit" disabled={!text.trim()} className="group/send absolute bottom-[9px] right-[8px] w-10 h-10 flex items-center justify-center rounded-lg bg-theme-primary text-theme-background hover:bg-theme-accent transition-colors duration-300 disabled:opacity-70" aria-label="Send">
          <svg className="h-5 w-5 transition-transform duration-200 group-hover/send:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </form>
  );
};

export default ChatComposer;
