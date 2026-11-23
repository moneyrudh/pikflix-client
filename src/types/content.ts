// types/content.ts

export interface Genre {
	id: number;
	name: string;
}

export interface ProductionCompany {
	id: number;
	logo_path: string | null;
	name: string;
	origin_country: string;
}

export interface ProductionCountry {
	iso_3166_1: string;
	name: string;
}

export interface SpokenLanguage {
	english_name: string;
	iso_639_1: string;
	name: string;
}

export interface Collection {
	id: number;
	name: string;
	poster_path: string | null;
	backdrop_path: string | null;
}

export interface Network {
	id: number;
	logo_path: string | null;
	name: string;
	origin_country: string;
}

export interface Creator {
	id: number;
	credit_id: string | null;
	name: string;
	profile_path: string | null;
}

export interface Trailer {
	key: string; // YouTube video id
	name: string | null;
	official: boolean;
	language: string | null;
}

export interface Movie {
	id: number;
	imdb_id: string | null;
	title: string;
	original_title: string | null;
	original_language: string | null;
	overview: string | null;
	tagline: string | null;
	status: string | null;
	release_date: string | null;
	adult: boolean;
	budget: number;
	revenue: number;
	runtime: number | null;
	vote_average: number;
	vote_count: number;
	popularity: number;
	video: boolean;
	poster_path: string | null;
	backdrop_path: string | null;
	homepage: string | null;
	belongs_to_collection: Collection | null;
	genres: Genre[];
	production_companies: ProductionCompany[];
	production_countries: ProductionCountry[];
	spoken_languages: SpokenLanguage[];
	trailer: Trailer | null;
	reason?: string;
	content_type: 'movie';
}

export interface Season {
	air_date: string | null;
	episode_count: number | null;
	id: number;
	name: string | null;
	overview: string | null;
	poster_path: string | null;
	season_number: number | null;
	vote_average: number | null;
}

export interface EpisodeInfo {
	id: number;
	name: string | null;
	overview: string | null;
	vote_average: number | null;
	vote_count: number | null;
	air_date: string | null;
	episode_number: number | null;
	episode_type: string | null;
	production_code: string | null;
	runtime: number | null;
	season_number: number | null;
	show_id: number | null;
	still_path: string | null;
}

export interface Show {
	id: number;
	name: string;
	original_name: string | null;
	original_language: string | null;
	overview: string | null;
	tagline: string | null;
	status: string | null;
	first_air_date: string | null;
	last_air_date: string | null;
	number_of_seasons: number | null;
	number_of_episodes: number | null;
	episode_run_time: number[];
	adult: boolean;
	vote_average: number;
	vote_count: number;
	popularity: number;
	poster_path: string | null;
	backdrop_path: string | null;
	homepage: string | null;
	genres: Genre[];
	production_companies: ProductionCompany[];
	production_countries: ProductionCountry[];
	spoken_languages: SpokenLanguage[];
	networks: Network[];
	created_by: Creator[];
	origin_country: string[] | null;
	languages: string[] | null;
	seasons: Season[] | null;
	last_episode_to_air: EpisodeInfo | null;
	next_episode_to_air: EpisodeInfo | null;
	in_production: boolean | null;
	type: string | null;
	trailer: Trailer | null;
	reason?: string;
	content_type: 'show';
}

export const ContentType = {
	MOVIE: 'movie',
	SHOW: 'show',
	BOOK: 'book',
	PAPER: 'paper',
} as const;
export type ContentType = (typeof ContentType)[keyof typeof ContentType];

export const ContentTypeMode = {
	MOVIE: 'movie',
	SHOW: 'show',
	BOTH: 'both',
	BOOK: 'book',
	PAPER: 'paper',
} as const;
export type ContentTypeMode = (typeof ContentTypeMode)[keyof typeof ContentTypeMode];

export const MediaType = {
	MOVIE: 'movie',
	SHOW: 'show',
	BOOK: 'book',
	PAPER: 'paper',
} as const;
export type MediaType = (typeof MediaType)[keyof typeof MediaType];

// What each toggle mode asks the backend for (`media_types` in the request)
export const MODE_MEDIA_TYPES: Record<ContentTypeMode, MediaType[]> = {
	[ContentTypeMode.MOVIE]: [MediaType.MOVIE],
	[ContentTypeMode.SHOW]: [MediaType.SHOW],
	[ContentTypeMode.BOTH]: [MediaType.MOVIE, MediaType.SHOW],
	[ContentTypeMode.BOOK]: [MediaType.BOOK],
	[ContentTypeMode.PAPER]: [MediaType.PAPER],
};

export const UIState = {
	INITIAL: 'initial',
	ANIMATING: 'animating',
	SEARCHED: 'searched',
} as const;
export type UIState = (typeof UIState)[keyof typeof UIState];

export interface Author {
	name: string;
	id: string | null; // Open Library author key
}

// A book at the work level (all editions together); `id` is the Open Library work key, e.g. "OL893414W"
export interface Book {
	id: string;
	title: string;
	subtitle: string | null;
	authors: Author[];
	first_publish_year: number | null;
	description: string | null; // null until loaded from /api/books/[id]
	description_checked_at: string | null; // set once loaded, even when there's no description
	cover_id: number | null;
	isbns: string[];
	subjects: string[];
	page_count: number | null;
	edition_count: number | null;
	ia_ids: string[];
	ebook_access: string | null;
	reason?: string;
	content_type: 'book';
}

// A research paper; `id` is the Semantic Scholar paperId
export interface Paper {
	id: string;
	title: string;
	authors: Author[];
	year: number | null;
	publication_date: string | null;
	venue: string | null;
	abstract: string | null;
	tldr: string | null; // Semantic Scholar's machine-generated one-line summary
	doi: string | null;
	arxiv_id: string | null;
	citation_count: number | null;
	fields_of_study: string[];
	open_access_pdf: string | null;
	reason?: string;
	content_type: 'paper';
}

export type Content = Movie | Show | Book | Paper;

// Recommendation stream (NDJSON from /api/recommendations), one event per line.
// The backend also sends a legacy `content` event per result; it duplicates `item` and is ignored.
export type StreamEvent =
	| { type: 'init'; query: string; media_types: MediaType[] }
	| { type: 'item'; media_type: MediaType; reason: string | null; data: Omit<Movie, 'content_type'> | Omit<Show, 'content_type'> | Omit<Book, 'content_type'> | Omit<Paper, 'content_type'> }
	| { type: 'content' }
	| { type: 'done'; count: number; dropped: number }
	| { type: 'error'; message: string };

export interface RecommendationSummary {
	title: string;
	year: number | null;
	reason: string | null;
}

export interface ConversationTurn {
	query: string;
	items: Content[];
	recommendations: RecommendationSummary[];
}

export interface Provider {
	logo_path: string;
	provider_id: number;
	provider_name: string;
	display_priority: number;
}

export interface ProviderTypes {
	flatrate?: Provider[];
	rent?: Provider[];
	buy?: Provider[];
	ads?: Provider[];
}

export interface ProviderData {
	link: string;
	flatrate?: Provider[];
	rent?: Provider[];
	buy?: Provider[];
	ads?: Provider[];
}

export interface ProviderResponse {
	id: number;
	results: {
		[country: string]: ProviderData;
	};
}

// Helper to normalize content to card-friendly props
// Identifies an item across types: a movie and a show can share a TMDB id. Also the `?content=` URL value.
export function getContentKey(item: Content): string {
	return `${item.content_type}:${item.id}`;
}

export function getContentTitle(item: Content): string {
	return item.content_type === ContentType.SHOW ? item.name : item.title;
}

// Movies and shows (TMDB): posters, backdrops, trailers, watch providers
export function isWatchItem(item: Content): item is Movie | Show {
	return item.content_type === ContentType.MOVIE || item.content_type === ContentType.SHOW;
}

export function getContentDate(item: Content): string | null {
	if (item.content_type === ContentType.BOOK) return item.first_publish_year?.toString() ?? null;
	if (item.content_type === ContentType.PAPER) return item.publication_date ?? item.year?.toString() ?? null;
	return item.content_type === ContentType.SHOW ? item.first_air_date : item.release_date;
}

// Year from the date's own digits. `new Date("2000-01-01").getFullYear()` parses as UTC midnight,
// which is still 1999 in the Americas.
export function getContentYear(item: Content): number | null {
	const date = getContentDate(item);
	return date ? parseInt(date.substring(0, 4), 10) : null;
}

// Poster for movies/shows, cover for books
export function getContentImageUrl(item: Content): string | null {
	if (item.content_type === ContentType.PAPER) return null; // papers get a typographic cover
	if (item.content_type === ContentType.BOOK) {
		return item.cover_id ? `https://covers.openlibrary.org/b/id/${item.cover_id}-L.jpg` : null;
	}
	return item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null;
}

export function getContentBackdropUrl(item: Content): string | null {
	if (!isWatchItem(item) || !item.backdrop_path) return null;
	return `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`;
}

// Everyone, for the details panel; papers can have dozens of authors, so they're capped
export function getAuthorsLine(item: Book | Paper): string {
	const names = item.authors.map(author => author.name);
	if (item.content_type === ContentType.PAPER && names.length > 6) return `${names.slice(0, 6).join(', ')} et al.`;
	return names.join(', ');
}

// One line for a card: a book's first author (Open Library lists translators as authors too),
// a paper's first author's surname plus "et al."
export function getAuthorShort(item: Book | Paper): string | undefined {
	const first = item.authors[0]?.name;
	if (!first || item.content_type === ContentType.BOOK) return first;
	const surname = first.trim().split(/\s+/).pop();
	return item.authors.length > 1 ? `${surname} et al.` : first;
}
