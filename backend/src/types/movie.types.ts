import type { IMovieCastMember, IMovieSubtitle, MovieStatus } from '../models/movie.model.js';
import type { PaginationMeta } from '../utils/pagination.js';

export interface MovieActorContext {
  userId: string;
}

export interface MovieCastMemberResponse {
  name: string;
  character: string;
  order: number;
  imageUrl: string | null;
}

export interface MovieSubtitleResponse {
  language: string;
  url: string;
}

export interface MovieListItemResponse {
  id: string;
  title: string;
  slug: string;
  status: MovieStatus;
  duration: number;
  category: string;
  ageRating: string | null;
  releaseDate: string | null;
  thumbnailUrl: string | null;
  posterUrl: string | null;
  isFeatured: boolean;
  isTrending: boolean;
  isPremium: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export interface MovieDetailResponse extends MovieListItemResponse {
  description: string;
  shortDescription: string;
  genres: string[];
  languages: string[];
  country: string | null;
  cast: MovieCastMemberResponse[];
  director: string | null;
  producer: string | null;
  bannerUrl: string | null;
  trailerUrl: string | null;
  videoUrl: string | null;
  subtitleUrls: MovieSubtitleResponse[];
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  createdBy: string;
  updatedBy: string | null;
  updatedAt: string;
}

export interface PaginatedMoviesResponse {
  items: MovieListItemResponse[];
  pagination: PaginationMeta;
}

export interface SearchMoviesResponse {
  items: MovieListItemResponse[];
  query: string;
  pagination: PaginationMeta;
}

export interface SoftDeleteMovieResponse {
  id: string;
  deletedAt: string;
}

export type { IMovieCastMember, IMovieSubtitle };
