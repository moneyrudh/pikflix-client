// components/chat/ChatSidebar.tsx
import React from 'react';
import Link from 'next/link';
import { ChatSummary } from '@/types/chat';
import ThemeSelector from '../ThemeSelector';

interface ChatSidebarProps {
  chats: ChatSummary[];
  activeId: string | null;
  isGuest: boolean;
  isOpen: boolean; // phones: shown as a drawer
  onClose: () => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
}

const DAY = 24 * 60 * 60 * 1000;

function groupLabel(lastActive: string, now: number): string {
  const age = now - new Date(lastActive).getTime();
  if (age < DAY) return 'Today';
  if (age < 7 * DAY) return 'Previous 7 days';
  if (age < 30 * DAY) return 'Previous 30 days';
  return 'Older';
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ chats, activeId, isGuest, isOpen, onClose, onNewChat, onDelete }) => {
  const now = Date.now();
  const groups: { label: string; chats: ChatSummary[] }[] = [];
  for (const chat of chats) {
    const label = groupLabel(chat.last_active_at, now);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.chats.push(chat);
    else groups.push({ label, chats: [chat] });
  }

  return (
    <>
      {isOpen && <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-panel" onClick={onClose} aria-hidden="true" />}
      <nav
        aria-label="Chats"
        className={`fixed md:sticky top-0 left-0 z-50 md:z-auto h-[100dvh] w-[280px] shrink-0 flex flex-col bg-theme-background md:bg-theme-surface/20 border-r border-theme-text/10 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Same height and bottom border as the chat header, so the two read as one bar */}
        <div className="h-16 shrink-0 flex items-center justify-between pl-5 pr-2 border-b border-theme-text/5">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a full load resets the search page */}
          <a href="/" className="text-theme-primary font-bold text-2xl tracking-tighter hover:text-theme-accent transition-colors">pikflix</a>
          <button type="button" onClick={onClose} className="md:hidden w-11 h-11 flex items-center justify-center rounded-lg text-theme-text-muted hover:text-theme-text" aria-label="Close chats">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col gap-4 px-3 py-4">
          <button
            type="button"
            onClick={onNewChat}
            className="h-11 flex items-center gap-2.5 px-3.5 rounded-xl bg-theme-surface border border-theme-text/10 text-sm font-medium text-theme-text hover:border-theme-primary/40 transition-colors"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            New chat
          </button>

          <div className="flex-1 overflow-y-auto -mx-1 px-1 flex flex-col gap-0.5">
            {groups.map(group => (
              <div key={group.label} className="flex flex-col gap-0.5">
                <h2 className="px-2.5 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-theme-text-muted">{group.label}</h2>
                {group.chats.map(chat => (
                  <div key={chat.id} className={`group flex items-center rounded-lg animate-message-in ${chat.id === activeId ? 'bg-theme-surface' : 'hover:bg-theme-surface/60'}`}>
                    <Link
                      href={`/chat?id=${chat.id}`}
                      onClick={onClose}
                      aria-current={chat.id === activeId ? 'page' : undefined}
                      className={`flex-1 min-w-0 px-3 py-2.5 text-sm truncate ${chat.id === activeId ? 'text-theme-text' : 'text-theme-text/80'}`}
                    >
                      {chat.title}
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(chat.id)}
                      className="shrink-0 w-9 h-9 mr-1 flex items-center justify-center rounded-md text-theme-text-muted hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                      aria-label={`Delete chat: ${chat.title}`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {isGuest && (
            <p className="px-2.5 text-xs leading-relaxed text-theme-text-muted">
              You&apos;re chatting as a guest. Chats are kept for 30 days after you last use them.
            </p>
          )}
          {/* Phones only: on wider screens the theme picker sits in the header */}
          <div className="md:hidden px-1"><ThemeSelector /></div>
        </div>
      </nav>
    </>
  );
};

export default ChatSidebar;
