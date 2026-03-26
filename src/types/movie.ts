// types/movie.ts

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
	reason?: string;
	content_type: 'show';
}

export const ContentType = {
	MOVIE: 'movie',
	SHOW: 'show',
} as const;
export type ContentType = (typeof ContentType)[keyof typeof ContentType];

export const ContentTypeMode = {
	MOVIE: 'movie',
	SHOW: 'show',
	BOTH: 'both',
} as const;
export type ContentTypeMode = (typeof ContentTypeMode)[keyof typeof ContentTypeMode];

export const UIState = {
	INITIAL: 'initial',
	ANIMATING: 'animating',
	SEARCHED: 'searched',
} as const;
export type UIState = (typeof UIState)[keyof typeof UIState];

export type Content = Movie | Show;

export interface MovieRecommendationResponse {
	recommendations: Movie[];
	query: string;
}

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
export function getContentTitle(item: Content): string {
	return item.content_type === ContentType.SHOW ? item.name : item.title;
}

export function getContentDate(item: Content): string | null {
	return item.content_type === ContentType.SHOW ? item.first_air_date : item.release_date;
}
