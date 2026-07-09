import { type FilterQuery,Types } from 'mongoose';

import { MovieErrors } from '../errors/movie.errors.js';
import { AppError } from '../middleware/error.middleware.js';
import {
  type IMovie,
  type IMovieCastMember,
  Movie,
  type MovieDocument,
  type MovieStatus,
} from '../models/movie.model.js';
import type {
  MovieActorContext,
  MovieDetailResponse,
  MovieListItemResponse,
  PaginatedMoviesResponse,
  SearchMoviesResponse,
  SoftDeleteMovieResponse,
} from '../types/movie.types.js';
import { buildPaginationMeta, getSkip } from '../utils/pagination.js';
import { generateUniqueSlug } from '../utils/slug.util.js';
import type {
  CreateMovieInput,
  MovieListQuery,
  MovieSortField,
  MovieSortOrder,
  SearchMoviesQuery,
  UpdateMovieInput,
} from '../validators/movie.validator.js';

const STATUS_TRANSITIONS: Record<MovieStatus, readonly MovieStatus[]> = {
  DRAFT: ['PUBLISHED', 'ARCHIVED'],
  PUBLISHED: ['DRAFT', 'ARCHIVED'],
  ARCHIVED: ['DRAFT'],
};

const LIST_PROJECTION = {
  title: 1,
  slug: 1,
  status: 1,
  duration: 1,
  category: 1,
  ageRating: 1,
  releaseDate: 1,
  thumbnailUrl: 1,
  posterUrl: 1,
  isFeatured: 1,
  isTrending: 1,
  isPremium: 1,
  publishedAt: 1,
  createdAt: 1,
} as const;

type MovieListDocument = Pick<
  IMovie,
  | 'title'
  | 'slug'
  | 'status'
  | 'duration'
  | 'category'
  | 'ageRating'
  | 'releaseDate'
  | 'thumbnailUrl'
  | 'posterUrl'
  | 'isFeatured'
  | 'isTrending'
  | 'isPremium'
  | 'publishedAt'
  | 'createdAt'
> & {
  _id: Types.ObjectId;
};

interface MovieFilterInput {
  status?: MovieStatus[];
  category?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  isPremium?: boolean;
  search?: string;
}

const isDuplicateKeyError = (error: unknown): boolean => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: number }).code === 11000
  );
};

const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const toIsoString = (value: Date | null | undefined): string | null => {
  return value ? value.toISOString() : null;
};

const normalizeCast = (
  cast: NonNullable<CreateMovieInput['cast']>  ,
): IMovieCastMember[] => {
  return cast.map((member) => ({
    name: member.name,
    character: member.character,
    order: member.order,
    imageUrl: member.imageUrl ?? null,
  }));
};

const slugExistsAmongActive = async (slug: string, excludeMovieId?: string): Promise<boolean> => {
  const filter: FilterQuery<IMovie> = {
    slug,
    deletedAt: null,
  };

  if (excludeMovieId) {
    filter._id = { $ne: new Types.ObjectId(excludeMovieId) };
  }

  const existing = await Movie.exists(filter);
  return existing !== null;
};

const resolveUniqueSlug = async (title: string, excludeMovieId?: string): Promise<string> => {
  return generateUniqueSlug(title, (slug) => slugExistsAmongActive(slug, excludeMovieId));
};

const assertValidStatusTransition = (current: MovieStatus, next: MovieStatus): void => {
  if (current === next) {
    return;
  }

  const allowedTargets = STATUS_TRANSITIONS[current];

  if (!allowedTargets.includes(next)) {
    throw MovieErrors.invalidStatusTransition(current, next);
  }
};

const assertPublishRequirements = (posterUrl: string | null, videoUrl: string | null): void => {
  if (!posterUrl || !videoUrl) {
    throw MovieErrors.publishRequirements();
  }
};

const buildSearchCondition = (searchTerm: string): FilterQuery<IMovie> => {
  const pattern = escapeRegex(searchTerm.trim());

  return {
    $or: [
      { title: { $regex: pattern, $options: 'i' } },
      { shortDescription: { $regex: pattern, $options: 'i' } },
      { description: { $regex: pattern, $options: 'i' } },
      { tags: { $regex: pattern, $options: 'i' } },
      { director: { $regex: pattern, $options: 'i' } },
      { 'cast.name': { $regex: pattern, $options: 'i' } },
    ],
  };
};

const buildMovieFilter = (filters: MovieFilterInput): FilterQuery<IMovie> => {
  const baseFilter: FilterQuery<IMovie> = {
    deletedAt: null,
  };

  if (filters.status && filters.status.length > 0) {
    baseFilter.status = { $in: filters.status };
  }

  if (filters.category) {
    baseFilter.category = new Types.ObjectId(filters.category);
  }

  if (filters.isFeatured !== undefined) {
    baseFilter.isFeatured = filters.isFeatured;
  }

  if (filters.isTrending !== undefined) {
    baseFilter.isTrending = filters.isTrending;
  }

  if (filters.isPremium !== undefined) {
    baseFilter.isPremium = filters.isPremium;
  }

  if (!filters.search) {
    return baseFilter;
  }

  return {
    $and: [baseFilter, buildSearchCondition(filters.search)],
  };
};

const buildSort = (sortBy: MovieSortField, sortOrder: MovieSortOrder): Record<string, 1 | -1> => {
  return {
    [sortBy]: sortOrder === 'asc' ? 1 : -1,
    _id: 1,
  };
};

const toMovieListItemResponse = (movie: MovieListDocument): MovieListItemResponse => {
  return {
    id: movie._id.toString(),
    title: movie.title,
    slug: movie.slug,
    status: movie.status,
    duration: movie.duration,
    category: movie.category.toString(),
    ageRating: movie.ageRating,
    releaseDate: toIsoString(movie.releaseDate),
    thumbnailUrl: movie.thumbnailUrl,
    posterUrl: movie.posterUrl,
    isFeatured: movie.isFeatured,
    isTrending: movie.isTrending,
    isPremium: movie.isPremium,
    publishedAt: toIsoString(movie.publishedAt),
    createdAt: movie.createdAt.toISOString(),
  };
};

const toMovieDetailResponse = (movie: MovieDocument): MovieDetailResponse => {
  return {
    ...toMovieListItemResponse(movie),
    description: movie.description,
    shortDescription: movie.shortDescription,
    genres: movie.genres,
    languages: movie.languages,
    country: movie.country,
    cast: movie.cast.map((member) => ({
      name: member.name,
      character: member.character,
      order: member.order,
      imageUrl: member.imageUrl,
    })),
    director: movie.director,
    producer: movie.producer,
    bannerUrl: movie.bannerUrl,
    trailerUrl: movie.trailerUrl,
    videoUrl: movie.videoUrl,
    subtitleUrls: movie.subtitleUrls.map((subtitle) => ({
      language: subtitle.language,
      url: subtitle.url,
    })),
    tags: movie.tags,
    seoTitle: movie.seoTitle,
    seoDescription: movie.seoDescription,
    createdBy: movie.createdBy.toString(),
    updatedBy: movie.updatedBy ? movie.updatedBy.toString() : null,
    updatedAt: movie.updatedAt.toISOString(),
  };
};

const findActiveMovieById = async (movieId: string): Promise<MovieDocument> => {
  const movie = await Movie.findOne({
    _id: new Types.ObjectId(movieId),
    deletedAt: null,
  });

  if (!movie) {
    throw MovieErrors.notFound();
  }

  return movie;
};

const queryMovies = async (
  filter: FilterQuery<IMovie>,
  sortBy: MovieSortField,
  sortOrder: MovieSortOrder,
  page: number,
  limit: number,
): Promise<PaginatedMoviesResponse> => {
  const skip = getSkip(page, limit);
  const sort = buildSort(sortBy, sortOrder);

  const [movies, totalItems] = await Promise.all([
    Movie.find(filter)
      .select(LIST_PROJECTION)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean<MovieListDocument[]>(),
    Movie.countDocuments(filter),
  ]);

  return {
    items: movies.map(toMovieListItemResponse),
    pagination: buildPaginationMeta(page, limit, totalItems),
  };
};

const applyStatusSideEffects = (
  movie: MovieDocument,
  nextStatus: MovieStatus,
  posterUrl: string | null,
  videoUrl: string | null,
): void => {
  if (movie.status !== nextStatus) {
    assertValidStatusTransition(movie.status, nextStatus);
  }

  if (nextStatus === 'PUBLISHED') {
    assertPublishRequirements(posterUrl, videoUrl);
  }

  if (nextStatus === 'PUBLISHED' && movie.status !== 'PUBLISHED') {
    movie.publishedAt = movie.publishedAt ?? new Date();
  }

  if (nextStatus === 'DRAFT' && movie.status === 'PUBLISHED') {
    movie.publishedAt = null;
  }

  movie.status = nextStatus;
};

const handlePersistenceError = (error: unknown, slug?: string): never => {
  if (error instanceof AppError) {
    throw error;
  }

  if (isDuplicateKeyError(error)) {
    throw MovieErrors.duplicateSlug(slug ?? 'unknown');
  }

  throw error;
};

/**
 * Create a new movie in DRAFT status with a server-generated unique slug.
 */
export const createMovie = async (
  input: CreateMovieInput,
  actor: MovieActorContext,
): Promise<MovieDetailResponse> => {
  const slug = await resolveUniqueSlug(input.title);

  try {
    const movie = await Movie.create({
      title: input.title,
      slug,
      description: input.description ?? '',
      shortDescription: input.shortDescription ?? '',
      category: new Types.ObjectId(input.category),
      genres: input.genres ?? [],
      languages: input.languages ?? ['en'],
      duration: input.duration,
      ageRating: input.ageRating ?? null,
      country: input.country ?? null,
      cast: input.cast ? normalizeCast(input.cast) : [],
      director: input.director ?? null,
      producer: input.producer ?? null,
      thumbnailUrl: input.thumbnailUrl ?? null,
      posterUrl: input.posterUrl ?? null,
      bannerUrl: input.bannerUrl ?? null,
      trailerUrl: input.trailerUrl ?? null,
      videoUrl: input.videoUrl ?? null,
      subtitleUrls: input.subtitleUrls ?? [],
      status: input.status ?? 'DRAFT',
      isFeatured: input.isFeatured ?? false,
      isTrending: input.isTrending ?? false,
      isPremium: input.isPremium ?? false,
      tags: input.tags ?? [],
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      createdBy: new Types.ObjectId(actor.userId),
      updatedBy: null,
      publishedAt: null,
      deletedAt: null,
    });

    return toMovieDetailResponse(movie);
  } catch (error) {
    return handlePersistenceError(error, slug);
  }
};

/**
 * Partially update an active movie.
 */
export const updateMovie = async (
  movieId: string,
  input: UpdateMovieInput,
  actor: MovieActorContext,
): Promise<MovieDetailResponse> => {
  const movie = await findActiveMovieById(movieId);

  const nextPosterUrl = input.posterUrl !== undefined ? input.posterUrl : movie.posterUrl;
  const nextVideoUrl = input.videoUrl !== undefined ? input.videoUrl : movie.videoUrl;

  if (input.title !== undefined) {
    const titleChanged = input.title !== movie.title;
    movie.title = input.title;

    if (titleChanged) {
      movie.slug = await resolveUniqueSlug(input.title, movieId);
    }
  }

  if (input.description !== undefined) {
    movie.description = input.description;
  }

  if (input.shortDescription !== undefined) {
    movie.shortDescription = input.shortDescription;
  }

  if (input.category !== undefined) {
    movie.category = new Types.ObjectId(input.category);
  }

  if (input.genres !== undefined) {
    movie.genres = input.genres;
  }

  if (input.languages !== undefined) {
    movie.languages = input.languages;
  }

  if (input.duration !== undefined) {
    movie.duration = input.duration;
  }

  if (input.ageRating !== undefined) {
    movie.ageRating = input.ageRating;
  }

  if (input.country !== undefined) {
    movie.country = input.country;
  }

  if (input.cast !== undefined) {
    movie.cast = normalizeCast(input.cast);
  }

  if (input.director !== undefined) {
    movie.director = input.director;
  }

  if (input.producer !== undefined) {
    movie.producer = input.producer;
  }

  if (input.thumbnailUrl !== undefined) {
    movie.thumbnailUrl = input.thumbnailUrl;
  }

  if (input.posterUrl !== undefined) {
    movie.posterUrl = input.posterUrl;
  }

  if (input.bannerUrl !== undefined) {
    movie.bannerUrl = input.bannerUrl;
  }

  if (input.trailerUrl !== undefined) {
    movie.trailerUrl = input.trailerUrl;
  }

  if (input.videoUrl !== undefined) {
    movie.videoUrl = input.videoUrl;
  }

  if (input.subtitleUrls !== undefined) {
    movie.subtitleUrls = input.subtitleUrls;
  }

  if (input.isFeatured !== undefined) {
    movie.isFeatured = input.isFeatured;
  }

  if (input.isTrending !== undefined) {
    movie.isTrending = input.isTrending;
  }

  if (input.isPremium !== undefined) {
    movie.isPremium = input.isPremium;
  }

  if (input.tags !== undefined) {
    movie.tags = input.tags;
  }

  if (input.seoTitle !== undefined) {
    movie.seoTitle = input.seoTitle;
  }

  if (input.seoDescription !== undefined) {
    movie.seoDescription = input.seoDescription;
  }

  if (input.status !== undefined) {
    applyStatusSideEffects(movie, input.status, nextPosterUrl, nextVideoUrl);
  } else if (movie.status === 'PUBLISHED') {
    assertPublishRequirements(nextPosterUrl, nextVideoUrl);
  }

  movie.updatedBy = new Types.ObjectId(actor.userId);

  try {
    await movie.save();
    return toMovieDetailResponse(movie);
  } catch (error) {
    return handlePersistenceError(error, movie.slug);
  }
};

/**
 * Retrieve a single active movie by ID.
 */
export const getMovieById = async (movieId: string): Promise<MovieDetailResponse> => {
  const movie = await findActiveMovieById(movieId);
  return toMovieDetailResponse(movie);
};

/**
 * List movies with pagination, sorting, filtering, and optional text search.
 */
export const listMovies = async (query: MovieListQuery): Promise<PaginatedMoviesResponse> => {
  const filter = buildMovieFilter({
    status: query.status,
    category: query.category,
    isFeatured: query.isFeatured,
    isTrending: query.isTrending,
    isPremium: query.isPremium,
    search: query.search,
  });

  return queryMovies(filter, query.sortBy, query.sortOrder, query.page, query.limit);
};

/**
 * Search movies with a required query string plus optional filters.
 */
export const searchMovies = async (query: SearchMoviesQuery): Promise<SearchMoviesResponse> => {
  const filter = buildMovieFilter({
    status: query.status,
    category: query.category,
    isFeatured: query.isFeatured,
    isTrending: query.isTrending,
    isPremium: query.isPremium,
    search: query.search,
  });

  const result = await queryMovies(filter, 'createdAt', 'desc', query.page, query.limit);

  return {
    items: result.items,
    query: query.search,
    pagination: result.pagination,
  };
};

/**
 * Soft-delete a movie by setting deletedAt.
 */
export const softDeleteMovie = async (
  movieId: string,
  actor: MovieActorContext,
): Promise<SoftDeleteMovieResponse> => {
  const movie = await findActiveMovieById(movieId);
  const deletedAt = new Date();

  movie.deletedAt = deletedAt;
  movie.updatedBy = new Types.ObjectId(actor.userId);

  try {
    await movie.save();
  } catch (error) {
    return handlePersistenceError(error, movie.slug);
  }

  return {
    id: movie._id.toString(),
    deletedAt: deletedAt.toISOString(),
  };
};
