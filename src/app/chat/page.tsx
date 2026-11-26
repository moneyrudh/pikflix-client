'use client';
// app/chat/page.tsx
// The agent chat. `?id=` opens a stored chat; `?q=` starts a new one with that message ("Continue in chat").
import React, { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ContentDetailsPanel from '@/components/ContentDetailsPanel';
import ModeSwitch from '@/components/ModeSwitch';
import ThemeSelector from '@/components/ThemeSelector';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatComposer from '@/components/chat/ChatComposer';
import { ReplyBlocks, StatusLines } from '@/components/chat/ChatBlocks';
import { Content } from '@/types/content';
import { BlockSlot, ChatEvent, ChatSummary, ChatTurn, StoredChat } from '@/types/chat';
import { accessToken, currentAccessToken, isGuest as checkGuest } from '@/lib/supabase';

const STARTERS = [
	'The book behind a movie, and who wrote it',
	'A show I watched years ago about a lighthouse keeper…',
	'Slow-burn thrillers like Prisoners, with trailers',
];

type AssistantTurn = Extract<ChatTurn, { role: 'assistant' }>;

export default function ChatPage() {
	return (
		<Suspense fallback={<div className="min-h-[100dvh] bg-theme-background" />}>
			<Chat />
		</Suspense>
	);
}

async function authorizedFetch(path: string, init: RequestInit = {}, signIn = false): Promise<Response | null> {
	const token = signIn ? await accessToken() : await currentAccessToken();
	if (!token) return null;
	return fetch(path, { ...init, headers: { ...init.headers, Authorization: `Bearer ${token}` } });
}

function Chat() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const chatId = searchParams.get('id');

	const [chats, setChats] = useState<ChatSummary[]>([]);
	const [title, setTitle] = useState<string | null>(null);
	const [turns, setTurns] = useState<ChatTurn[]>([]);
	const [busy, setBusy] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [guest, setGuest] = useState(true);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<Content | null>(null);

	const abortRef = useRef<AbortController | null>(null);
	const streamingIdRef = useRef<string | null>(null); // the chat this tab is streaming into: don't reload it
	const scrollRef = useRef<HTMLDivElement>(null);
	const stickToBottomRef = useRef(true);
	const startedFromQueryRef = useRef(false);
	const [showJump, setShowJump] = useState(false); // scrolled away from the latest message
	const composerRef = useRef<HTMLDivElement>(null);
	const composerTopRef = useRef<number | null>(null); // where the centered input was, to slide it down from
	const generationRef = useRef(0); // bumped when the open chat changes: a reply still finishing must not touch the new one

	const refreshChats = useCallback(async () => {
		const response = await authorizedFetch('/api/chats').catch(() => null);
		if (response?.ok) setChats(await response.json());
		setGuest(await checkGuest());
	}, []);

	useEffect(() => { refreshChats(); }, [refreshChats]);

	// Open the chat in the URL (unless it's the one this tab just created and is streaming into)
	useEffect(() => {
		if (!chatId) {
			if (!streamingIdRef.current) {
				setTurns([]);
				setTitle(null);
			}
			return;
		}
		if (chatId === streamingIdRef.current) return;
		generationRef.current++;
		abortRef.current?.abort();
		setLoadError(null);
		setTurns([]);
		let cancelled = false;
		(async () => {
			const response = await authorizedFetch(`/api/chats/${chatId}`).catch(() => null);
			if (cancelled) return;
			if (!response?.ok) {
				setLoadError(response?.status === 404 || !response ? "This chat doesn't exist or isn't yours." : "Couldn't load this chat.");
				return;
			}
			const chat: StoredChat = await response.json();
			if (cancelled) return;
			setTitle(chat.title);
			setTurns(chat.turns.map(turn => turn.role === 'user' ? turn : {
				role: 'assistant', statuses: [], streaming: false, error: null,
				slots: turn.blocks.map(block => ({ state: 'done', block }) as BlockSlot),
			}));
			stickToBottomRef.current = true;
		})();
		return () => { cancelled = true; };
	}, [chatId]);

	// Follow the reply as it streams, unless the reader scrolled up
	useEffect(() => {
		const el = scrollRef.current;
		if (el && stickToBottomRef.current) el.scrollTop = el.scrollHeight;
	}, [turns]);

	const updateReply = (update: (turn: AssistantTurn) => AssistantTurn) => {
		setTurns(prev => {
			const last = prev[prev.length - 1];
			if (!last || last.role !== 'assistant') return prev;
			return [...prev.slice(0, -1), update(last)];
		});
	};

	const setSlot = (index: number, slot: (current: BlockSlot | undefined) => BlockSlot) => {
		updateReply(turn => {
			const slots = [...turn.slots];
			slots[index] = slot(slots[index]);
			return { ...turn, slots };
		});
	};

	const handleEvent = (event: ChatEvent) => {
		switch (event.type) {
			case 'session':
				if (!chatId) {
					streamingIdRef.current = event.session_id;
					setTitle(event.title);
					router.replace(`/chat?id=${event.session_id}`, { scroll: false });
				}
				break;
			case 'status':
				updateReply(turn => ({ ...turn, statuses: [...turn.statuses, event.text] }));
				break;
			case 'block_start':
				setSlot(event.index, () => ({ state: 'streaming', blockType: event.block_type, text: '' }));
				break;
			case 'text_delta':
				setSlot(event.index, current => current?.state === 'streaming' ? { ...current, text: current.text + event.text } : current ?? { state: 'streaming', blockType: 'text', text: event.text });
				break;
			case 'block_end':
				setSlot(event.index, () => ({ state: 'done', block: event.block }));
				break;
			case 'block_drop':
				setSlot(event.index, () => ({ state: 'dropped' }));
				break;
			case 'error':
				updateReply(turn => ({ ...turn, error: event.message }));
				break;
		}
	};

	const send = async (message: string) => {
		if (busy) return;
		setBusy(true);
		setLoadError(null);
		stickToBottomRef.current = true;
		streamingIdRef.current = chatId;
		if (turns.length === 0) composerTopRef.current = composerRef.current?.getBoundingClientRect().top ?? null;
		setTurns(prev => [...prev, { role: 'user', text: message }, { role: 'assistant', slots: [], statuses: [], streaming: true, error: null }]);

		const controller = new AbortController();
		abortRef.current = controller;
		const generation = ++generationRef.current;
		const current = () => generation === generationRef.current;
		let finished = false;
		try {
			const response = await authorizedFetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message, session_id: chatId ?? undefined }),
				signal: controller.signal,
			}, true);
			if (!response?.ok) {
				const data = await response?.json().catch(() => ({}));
				throw new Error(data?.error || 'Something went wrong. Please try again.');
			}

			const reader = response.body!.getReader();
			const decoder = new TextDecoder();
			let buffer = '';
			const handleLine = (line: string) => {
				if (!line.trim()) return;
				try {
					const event = JSON.parse(line) as ChatEvent;
					if (event.type === 'done' || event.type === 'error') finished = true;
					if (current()) handleEvent(event);
				} catch (e) {
					console.error('Error parsing chat stream line:', e);
				}
			};
			while (true) {
				const { value, done } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n');
				buffer = lines.pop() || '';
				lines.forEach(handleLine);
			}
			handleLine(buffer);
			if (!finished) throw new Error('The connection dropped before the answer finished. Please try again.');
		} catch (err) {
			if (!current()) {
				// the user moved to another chat; this reply's turn is gone
			} else if (controller.signal.aborted) {
				updateReply(turn => ({ ...turn, error: turn.slots.length ? null : 'Stopped.' }));
			} else {
				updateReply(turn => ({ ...turn, error: err instanceof Error ? err.message : 'Something went wrong. Please try again.' }));
			}
		} finally {
			// Blocks still streaming when the reply ended (stopped or cut off) can't finish now
			if (current()) updateReply(turn => ({
				...turn,
				streaming: false,
				slots: turn.slots.map(slot => slot.state === 'streaming' && slot.blockType !== 'text' ? { state: 'dropped' } : slot),
			}));
			abortRef.current = null;
			setBusy(false);
			refreshChats();
		}
	};

	// "Continue in chat" from the search page: start a chat with the search as its first message
	useEffect(() => {
		const query = searchParams.get('q');
		if (query && !chatId && !startedFromQueryRef.current) {
			startedFromQueryRef.current = true;
			send(query);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- runs once, for the URL the page opened with
	}, []);

	const newChat = () => {
		generationRef.current++;
		abortRef.current?.abort();
		streamingIdRef.current = null;
		setTurns([]);
		setTitle(null);
		setSidebarOpen(false);
		router.push('/chat');
	};

	const deleteChat = async (id: string) => {
		if (!window.confirm('Delete this chat?')) return;
		const response = await authorizedFetch(`/api/chats/${id}`, { method: 'DELETE' }).catch(() => null);
		if (!response?.ok) return;
		setChats(prev => prev.filter(chat => chat.id !== id));
		if (id === chatId) newChat();
	};

	const openItem = (item: Content) => {
		setSelectedItem(item);
		if (window.innerWidth < 768) document.body.style.overflow = 'hidden';
	};
	const closeItem = useCallback(() => {
		setSelectedItem(null);
		document.body.style.overflow = '';
	}, []);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') closeItem(); };
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [closeItem]);

	const isEmpty = turns.length === 0 && !chatId && !loadError;

	// The first message moves the input from the middle of the empty page to the bottom: slide it there
	useLayoutEffect(() => {
		const from = composerTopRef.current;
		composerTopRef.current = null;
		const el = composerRef.current;
		if (isEmpty || from === null || !el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const delta = from - el.getBoundingClientRect().top;
		if (Math.abs(delta) > 4) {
			el.animate([{ transform: `translateY(${delta}px)` }, { transform: 'none' }], { duration: 450, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' });
		}
	}, [isEmpty]);

	// The tab shows the open chat's title
	useEffect(() => {
		const previous = document.title;
		document.title = title ? `${title} · pikflix` : 'Chat · pikflix';
		return () => { document.title = previous; };
	}, [title]);

	const jumpToLatest = () => {
		const el = scrollRef.current;
		if (!el) return;
		stickToBottomRef.current = true;
		setShowJump(false);
		el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
	};

	const lastIndex = turns.length - 1;

	const composer = (
		<div ref={composerRef}>
			<ChatComposer
				busy={busy}
				placeholder={turns.length ? 'Ask a follow-up…' : 'Describe what you want…'}
				onSend={send}
				onStop={() => abortRef.current?.abort()}
			/>
		</div>
	);

	return (
		<div className="flex min-h-[100dvh] bg-theme-background text-theme-text">
			<ChatSidebar
				chats={chats}
				activeId={chatId}
				isGuest={guest}
				isOpen={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
				onNewChat={newChat}
				onDelete={deleteChat}
			/>

			<div className={`flex-1 min-w-0 h-[100dvh] flex flex-col transition-[padding] duration-300 ${selectedItem ? 'xl:pr-[50%]' : ''}`}>
				<header className="h-16 shrink-0 flex items-center justify-between gap-3 pl-3 pr-6 md:px-6 border-b border-theme-text/5">
					<div className="flex items-center gap-1 min-w-0">
						<button type="button" onClick={() => setSidebarOpen(true)} className="md:hidden w-11 h-11 shrink-0 flex items-center justify-center rounded-lg text-theme-text" aria-label="Open chats">
							<svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10" /></svg>
						</button>
						{/* An empty chat has no title yet; the sidebar's "New chat" already says where you are */}
						{title && <h1 className="text-[15px] font-medium truncate animate-fade-in">{title}</h1>}
					</div>
					<div className="flex items-center gap-3 shrink-0">
						<ModeSwitch />
						<div className="hidden md:block"><ThemeSelector /></div>
					</div>
				</header>

				{isEmpty ? (
					// Empty chat: greeting, input and starters together in the middle
					<div className="flex-1 overflow-y-auto flex flex-col justify-center">
						<div className="mx-auto w-full max-w-3xl px-4 md:px-6 py-10 flex flex-col gap-8 animate-fade-in">
							<div className="flex flex-col gap-2">
								<h2 className="text-3xl font-bold tracking-tight">What are you in the <span className="gradient-text">mood</span> for?</h2>
								<p className="text-theme-text-muted leading-relaxed max-w-lg">
									Movies, shows, books and papers. Ask for picks, track down something half-remembered, or follow a thread from one to the next.
								</p>
							</div>
							{composer}
							<div className="flex flex-col sm:flex-row gap-2 -mt-4">
								{STARTERS.map(starter => (
									<button key={starter} type="button" onClick={() => send(starter)} className="flex-1 min-h-[52px] text-left px-4 py-3 rounded-xl bg-theme-surface/60 border border-theme-text/10 text-sm text-theme-text/80 hover:text-theme-text hover:border-theme-primary/40 transition-colors">
										{starter}
									</button>
								))}
							</div>
							{guest && <p className="-mt-4 text-xs text-theme-text-muted">Guest chats are kept for 30 days.</p>}
						</div>
					</div>
				) : (
					<>
						<div className="relative flex-1 min-h-0">
							<div
								ref={scrollRef}
								onScroll={e => {
									const el = e.currentTarget;
									const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
									stickToBottomRef.current = atBottom;
									setShowJump(!atBottom);
								}}
								className="h-full overflow-y-auto scroll-fade"
							>
								<div className="mx-auto w-full max-w-3xl px-4 md:px-6 pt-8 pb-10 flex flex-col gap-5">
									{loadError && <p role="alert" className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500">{loadError}</p>}

									{turns.map((turn, i) => turn.role === 'user' ? (
										<div key={i} className={`self-end max-w-[85%] md:max-w-[78%] px-4 py-3 rounded-[18px] rounded-br-[4px] bg-theme-surface text-[15px] leading-normal whitespace-pre-wrap break-words animate-message-in ${i > 0 ? 'mt-4' : ''}`}>
											{turn.text}
										</div>
									) : (
										<div key={i} className="flex flex-col gap-4">
											<StatusLines statuses={turn.statuses} working={turn.streaming && turn.slots.length === 0} />
											{turn.streaming && turn.statuses.length === 0 && turn.slots.length === 0 && (
												<p className="text-[13px] text-shimmer animate-fade-in" aria-live="polite">Thinking…</p>
											)}
											<ReplyBlocks
												slots={turn.slots}
												onOpen={openItem}
												onAnswer={i === lastIndex && !busy ? send : undefined}
											/>
											{turn.error && <p role="alert" className="text-sm text-red-500">{turn.error}</p>}
										</div>
									))}
								</div>
							</div>

							{showJump && (
								<button
									type="button"
									onClick={jumpToLatest}
									className="absolute bottom-3 left-1/2 -translate-x-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-theme-surface border border-theme-text/10 text-theme-text-muted hover:text-theme-text shadow-[0_4px_14px_var(--shadow-color)] animate-fade-in"
									aria-label="Jump to latest message"
								>
									<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
								</button>
							)}
						</div>

						<div className="mx-auto w-full max-w-3xl px-4 md:px-6 pt-2 pb-4 md:pb-6">
							{composer}
						</div>
					</>
				)}
			</div>

			<ContentDetailsPanel item={selectedItem} isOpen={selectedItem !== null} onClose={closeItem} />
			{selectedItem && <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-panel z-40" onClick={closeItem} aria-hidden="true" />}
		</div>
	);
}
