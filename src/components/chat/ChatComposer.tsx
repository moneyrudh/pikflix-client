// components/chat/ChatComposer.tsx
import React, { useRef, useState } from 'react';

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

  const resize = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 180) + 'px';
  };

  const submit = () => {
    const message = text.trim();
    if (!message || busy) return;
    onSend(message);
    setText('');
    requestAnimationFrame(resize);
  };

  return (
    <form
      onSubmit={e => { e.preventDefault(); submit(); }}
      className="flex items-end gap-2.5 rounded-[20px] bg-theme-surface border border-theme-text/10 py-2 pr-2 pl-4 shadow-[0_8px_24px_var(--shadow-color)] focus-within:border-theme-primary/40 transition-colors"
    >
      <label htmlFor="chat-input" className="sr-only">Message PikFlix</label>
      <textarea
        id="chat-input"
        ref={inputRef}
        rows={1}
        value={text}
        maxLength={MAX_CHARS}
        autoFocus
        onChange={e => { setText(e.target.value); resize(); }}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        className="flex-1 resize-none bg-transparent py-2.5 text-[15px] leading-normal text-theme-text placeholder-theme-text-muted focus:outline-none"
      />
      {busy ? (
        <button type="button" onClick={onStop} className="w-11 h-11 shrink-0 flex items-center justify-center rounded-[14px] bg-theme-primary text-theme-background" aria-label="Stop generating">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="2" /></svg>
        </button>
      ) : (
        <button type="submit" disabled={!text.trim()} className="w-11 h-11 shrink-0 flex items-center justify-center rounded-[14px] bg-theme-primary text-theme-background hover:bg-theme-accent transition-colors disabled:opacity-40" aria-label="Send">
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
        </button>
      )}
    </form>
  );
};

export default ChatComposer;
