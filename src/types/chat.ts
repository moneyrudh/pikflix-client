// types/chat.ts
import { Book, Content, MediaType, Movie, Paper, Show, Trailer } from './content';

// Blocks of an agent reply, as the backend renders them (app/agent/blocks.py)
export type MediaItemData = Omit<Movie, 'content_type'> | Omit<Show, 'content_type'> | Omit<Book, 'content_type'> | Omit<Paper, 'content_type'>;

export type ChatBlock =
	| { type: 'text'; text: string }
	| { type: 'media'; media_type: MediaType; ref: string; item: MediaItemData; note: string | null }
	| { type: 'trailer'; ref: string; title: string; trailer: Trailer }
	| { type: 'question'; question: string; options: string[] };

// One slot of a reply while it streams: a block in progress, finished, or dropped
export type BlockSlot =
	| { state: 'streaming'; blockType: string; text: string }
	| { state: 'done'; block: ChatBlock }
	| { state: 'dropped' };

// Agent stream (NDJSON from /api/chat), one event per line (app/agent/events.py)
export type ChatEvent =
	| { type: 'session'; session_id: string; title: string }
	| { type: 'status'; text: string }
	| { type: 'block_start'; index: number; block_type: string }
	| { type: 'text_delta'; index: number; text: string }
	| { type: 'block_end'; index: number; block: ChatBlock }
	| { type: 'block_drop'; index: number }
	| { type: 'done' }
	| { type: 'error'; message: string };

export type ChatTurn =
	| { role: 'user'; text: string }
	| { role: 'assistant'; slots: BlockSlot[]; statuses: string[]; streaming: boolean; error: string | null };

export interface ChatSummary {
	id: string;
	title: string;
	last_active_at: string;
}

// GET /api/chats/[id]
export interface StoredChat {
	id: string;
	title: string;
	turns: ({ role: 'user'; text: string } | { role: 'assistant'; blocks: ChatBlock[] })[];
}

export function mediaContent(block: Extract<ChatBlock, { type: 'media' }>): Content {
	return { ...block.item, content_type: block.media_type } as Content;
}
