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
  }
  
  export interface MovieRecommendationResponse {
    recommendations: Movie[];
    query: string;
  }