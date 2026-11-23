'use client';
// app/chat/page.tsx
// The agent chat. `?id=` opens a stored chat; `?q=` starts a new one with that message ("Continue in chat").
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ContentDetailsPanel from '@/components/ContentDetailsPanel';
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

	const lastIndex = turns.length - 1;

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
				<header className="flex items-center justify-between gap-3 px-3 md:px-8 py-3 border-b border-theme-text/5">
					<div className="flex items-center gap-1 min-w-0">
						<button type="button" onClick={() => setSidebarOpen(true)} className="md:hidden w-11 h-11 shrink-0 flex items-center justify-center rounded-lg text-theme-text" aria-label="Open chats">
							<svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10" /></svg>
						</button>
						<h1 className="text-[15px] font-medium truncate">{title ?? 'New chat'}</h1>
					</div>
					<div className="flex items-center gap-3 shrink-0">
						<Link href="/" className="text-sm text-theme-text-muted hover:text-theme-text px-2 py-3">Search</Link>
					</div>
				</header>

				<div
					ref={scrollRef}
					onScroll={e => {
						const el = e.currentTarget;
						stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
					}}
					className="flex-1 overflow-y-auto"
				>
					<div className="mx-auto w-full max-w-3xl px-4 md:px-6 pt-8 pb-10 flex flex-col gap-5">
						{loadError && <p role="alert" className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500">{loadError}</p>}

						{turns.length === 0 && !loadError && !chatId && (
							<div className="flex flex-col gap-6 pt-[12vh] animate-fade-in">
								<div className="flex flex-col gap-2">
									<h2 className="text-3xl font-bold tracking-tight">What are you in the mood for?</h2>
									<p className="text-theme-text-muted leading-relaxed max-w-lg">
										Movies, shows, books and papers. Ask for picks, track down something half-remembered, or follow a thread from one to the next.
									</p>
								</div>
								<div className="flex flex-col sm:flex-row gap-2">
									{STARTERS.map(starter => (
										<button key={starter} type="button" onClick={() => send(starter)} className="flex-1 min-h-[52px] text-left px-4 py-3 rounded-xl bg-theme-surface border border-theme-text/10 text-sm hover:border-theme-primary/40 transition-colors">
											{starter}
										</button>
									))}
								</div>
							</div>
						)}

						{turns.map((turn, i) => turn.role === 'user' ? (
							<div key={i} className={`self-end max-w-[85%] md:max-w-[78%] px-4 py-3 rounded-[18px] rounded-br-[4px] bg-theme-surface text-[15px] leading-normal whitespace-pre-wrap break-words ${i > 0 ? 'mt-4' : ''}`}>
								{turn.text}
							</div>
						) : (
							<div key={i} className="flex flex-col gap-4">
								<StatusLines statuses={turn.statuses} working={turn.streaming && turn.slots.length === 0} />
								{turn.streaming && turn.statuses.length === 0 && turn.slots.length === 0 && (
									<div className="flex gap-1.5 py-2" aria-label="Thinking">
										{[0, 150, 300].map(delay => (
											<span key={delay} className="w-2 h-2 rounded-full bg-theme-text-muted animate-pulse" style={{ animationDelay: `${delay}ms` }} />
										))}
									</div>
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

				<div className="mx-auto w-full max-w-3xl px-4 md:px-6 pb-4 md:pb-6">
					<ChatComposer
						busy={busy}
						placeholder={turns.length ? 'Ask a follow-up…' : 'Describe what you want…'}
						onSend={send}
						onStop={() => abortRef.current?.abort()}
					/>
					{guest && turns.length === 0 && (
						<p className="mt-2.5 text-center text-xs text-theme-text-muted">Guest chats are kept for 30 days.</p>
					)}
				</div>
			</div>

			<ContentDetailsPanel item={selectedItem} isOpen={selectedItem !== null} onClose={closeItem} />
			{selectedItem && <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-panel z-40" onClick={closeItem} aria-hidden="true" />}
		</div>
	);
}
