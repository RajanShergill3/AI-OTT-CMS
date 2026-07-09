import { z } from 'zod';

import { AGE_RATINGS, MOVIE_STATUSES } from '../models/movie.model.js';
import { createValidator } from './zod.util.js';

// ---------------------------------------------------------------------------
// Shared constants (aligned with movie.model.ts constraints)
// ---------------------------------------------------------------------------

const TITLE_MAX_LENGTH = 300;
const SHORT_DESCRIPTION_MAX_LENGTH = 500;
const DESCRIPTION_MAX_LENGTH = 5000;
const SEO_TITLE_MAX_LENGTH = 70;
const SEO_DESCRIPTION_MAX_LENGTH = 160;
const TAG_MAX_LENGTH = 50;
const TAG_MAX_COUNT = 20;
const GENRE_MAX_LENGTH = 50;
const GENRE_MAX_COUNT = 10;
const CAST_MAX_COUNT = 100;
const CAST_NAME_MAX_LENGTH = 200;
const CAST_CHARACTER_MAX_LENGTH = 200;
const PERSON_NAME_MAX_LENGTH = 200;
const SUBTITLE_MAX_COUNT = 30;
const SEARCH_QUERY_MIN_LENGTH = 2;
const SEARCH_QUERY_MAX_LENGTH = 200;
const LIST_DEFAULT_PAGE = 1;
const LIST_DEFAULT_LIMIT = 20;
const LIST_MAX_LIMIT = 100;
const SEARCH_DEFAULT_LIMIT = 20;
const SEARCH_MAX_LIMIT = 50;

const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;
const ISO_639_1_REGEX = /^[a-z]{2}$/;
const ISO_3166_1_ALPHA_2_REGEX = /^[A-Z]{2}$/;

/** Allowed sort fields for movie list queries. */
export const MOVIE_SORT_FIELDS = [
  'title',
  'createdAt',
  'updatedAt',
  'releaseDate',
  'publishedAt',
  'duration',
] as const;

export const MOVIE_SORT_ORDERS = ['asc', 'desc'] as const;

export type MovieSortField = (typeof MOVIE_SORT_FIELDS)[number];
export type MovieSortOrder = (typeof MOVIE_SORT_ORDERS)[number];

// ---------------------------------------------------------------------------
// Reusable primitive schemas
// ---------------------------------------------------------------------------

export const objectIdSchema = z
  .string()
  .trim()
  .regex(OBJECT_ID_REGEX, 'Must be a valid MongoDB ObjectId');

export const movieStatusSchema = z.enum(MOVIE_STATUSES, {
  message: 'Status must be one of: DRAFT, PUBLISHED, ARCHIVED',
});

export const ageRatingSchema = z.enum(AGE_RATINGS, {
  message: 'Age rating must be a recognized content rating',
});

const titleSchema = z
  .string()
  .trim()
  .min(1, 'Title is required')
  .max(TITLE_MAX_LENGTH, `Title cannot exceed ${TITLE_MAX_LENGTH} characters`);

const descriptionSchema = z
  .string()
  .trim()
  .max(DESCRIPTION_MAX_LENGTH, `Description cannot exceed ${DESCRIPTION_MAX_LENGTH} characters`);

const shortDescriptionSchema = z
  .string()
  .trim()
  .max(
    SHORT_DESCRIPTION_MAX_LENGTH,
    `Short description cannot exceed ${SHORT_DESCRIPTION_MAX_LENGTH} characters`,
  );

const categoryIdSchema = objectIdSchema;

const genreItemSchema = z
  .string()
  .trim()
  .min(1, 'Genre cannot be empty')
  .max(GENRE_MAX_LENGTH, `Genre cannot exceed ${GENRE_MAX_LENGTH} characters`);

const genresSchema = z
  .array(genreItemSchema)
  .max(GENRE_MAX_COUNT, `A movie cannot have more than ${GENRE_MAX_COUNT} genres`);

const languageItemSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(ISO_639_1_REGEX, 'Language must be a valid ISO 639-1 code');

const languagesSchema = z
  .array(languageItemSchema)
  .min(1, 'At least one language is required')
  .max(20, 'A movie cannot have more than 20 languages');

const durationSchema = z
  .number()
  .int('Duration must be a whole number of seconds')
  .positive('Duration must be greater than zero');

const countrySchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(ISO_3166_1_ALPHA_2_REGEX, 'Country must be a valid ISO 3166-1 alpha-2 code');

const castMemberSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Cast member name is required')
      .max(
        CAST_NAME_MAX_LENGTH,
        `Cast member name cannot exceed ${CAST_NAME_MAX_LENGTH} characters`,
      ),
    character: z
      .string()
      .trim()
      .min(1, 'Character name is required')
      .max(
        CAST_CHARACTER_MAX_LENGTH,
        `Character name cannot exceed ${CAST_CHARACTER_MAX_LENGTH} characters`,
      ),
    order: z.number().int('Cast billing order must be an integer').min(0, 'Cast billing order cannot be negative'),
    imageUrl: z.url('Cast image URL must be a valid URL').nullable().optional(),
  })
  .strict();

const castSchema = z
  .array(castMemberSchema)
  .max(CAST_MAX_COUNT, `Cast cannot exceed ${CAST_MAX_COUNT} members`);

const personNameSchema = z
  .string()
  .trim()
  .min(1, 'Name cannot be empty')
  .max(PERSON_NAME_MAX_LENGTH, `Name cannot exceed ${PERSON_NAME_MAX_LENGTH} characters`);

const mediaUrlSchema = z.url('Must be a valid URL');

const subtitleSchema = z
  .object({
    language: languageItemSchema,
    url: mediaUrlSchema,
  })
  .strict();

const subtitleUrlsSchema = z
  .array(subtitleSchema)
  .max(SUBTITLE_MAX_COUNT, `Subtitle tracks cannot exceed ${SUBTITLE_MAX_COUNT}`);

const isFeaturedSchema = z.boolean();
const isTrendingSchema = z.boolean();
const isPremiumSchema = z.boolean();

const tagItemSchema = z
  .string()
  .trim()
  .min(1, 'Tag cannot be empty')
  .max(TAG_MAX_LENGTH, `Tag cannot exceed ${TAG_MAX_LENGTH} characters`)
  .transform((value) => value.toLowerCase());

const tagsSchema = z
  .array(tagItemSchema)
  .max(TAG_MAX_COUNT, `A movie cannot have more than ${TAG_MAX_COUNT} tags`);

const seoTitleSchema = z
  .string()
  .trim()
  .min(1, 'SEO title cannot be empty')
  .max(SEO_TITLE_MAX_LENGTH, `SEO title cannot exceed ${SEO_TITLE_MAX_LENGTH} characters`);

const seoDescriptionSchema = z
  .string()
  .trim()
  .min(1, 'SEO description cannot be empty')
  .max(
    SEO_DESCRIPTION_MAX_LENGTH,
    `SEO description cannot exceed ${SEO_DESCRIPTION_MAX_LENGTH} characters`,
  );

const searchTermSchema = z
  .string()
  .trim()
  .min(SEARCH_QUERY_MIN_LENGTH, `Search query must be at least ${SEARCH_QUERY_MIN_LENGTH} characters`)
  .max(SEARCH_QUERY_MAX_LENGTH, `Search query cannot exceed ${SEARCH_QUERY_MAX_LENGTH} characters`);

// ---------------------------------------------------------------------------
// Query coercion helpers (Express query values are strings)
// ---------------------------------------------------------------------------

const pageSchema = z.coerce
  .number()
  .int('Page must be an integer')
  .min(1, 'Page must be at least 1')
  .default(LIST_DEFAULT_PAGE);

const listLimitSchema = z.coerce
  .number()
  .int('Limit must be an integer')
  .min(1, 'Limit must be at least 1')
  .max(LIST_MAX_LIMIT, `Limit cannot exceed ${LIST_MAX_LIMIT}`)
  .default(LIST_DEFAULT_LIMIT);

const searchLimitSchema = z.coerce
  .number()
  .int('Limit must be an integer')
  .min(1, 'Limit must be at least 1')
  .max(SEARCH_MAX_LIMIT, `Limit cannot exceed ${SEARCH_MAX_LIMIT}`)
  .default(SEARCH_DEFAULT_LIMIT);

const sortBySchema = z.enum(MOVIE_SORT_FIELDS, {
  message: `sortBy must be one of: ${MOVIE_SORT_FIELDS.join(', ')}`,
});

const sortOrderSchema = z.enum(MOVIE_SORT_ORDERS, {
  message: 'sortOrder must be asc or desc',
});

const queryBooleanSchema = z
  .enum(['true', 'false'], { message: 'Must be true or false' })
  .transform((value) => value === 'true');

const parseStatusQueryValue = (value: unknown): string[] | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const rawParts = Array.isArray(value) ? value : [value];

  const statuses = rawParts.flatMap((item) => {
    if (typeof item !== 'string') {
      return [];
    }

    return item
      .split(',')
      .map((part) => part.trim().toUpperCase())
      .filter((part) => part.length > 0);
  });

  return statuses.length > 0 ? statuses : undefined;
};

/**
 * Parses a single status or comma-separated status list from query strings.
 */
const statusFilterSchema = z.preprocess(
  parseStatusQueryValue,
  z.array(movieStatusSchema).min(1, 'At least one valid status is required').optional(),
);

const optionalSearchQuerySchema = searchTermSchema.optional();

// ---------------------------------------------------------------------------
// Shared create field map (single source of truth for create + update)
//
// Server-owned fields are intentionally excluded. They are set in the service
// layer, not by API clients:
//   - slug        — generated from title on create; immutable unless service allows
//   - createdBy   — from authenticated user context
//   - updatedBy   — from authenticated user context
//   - publishedAt — set when status transitions to PUBLISHED
//   - deletedAt   — set on soft delete
//
// `.strict()` rejects any client attempt to send these fields (including slug).
// ---------------------------------------------------------------------------

const movieWritableFieldsSchema = z
  .object({
    title: titleSchema,
    description: descriptionSchema.optional(),
    shortDescription: shortDescriptionSchema.optional(),
    category: categoryIdSchema,
    genres: genresSchema.optional(),
    languages: languagesSchema.optional(),
    duration: durationSchema,
    ageRating: ageRatingSchema.nullable().optional(),
    country: countrySchema.nullable().optional(),
    cast: castSchema.optional(),
    director: personNameSchema.nullable().optional(),
    producer: personNameSchema.nullable().optional(),
    thumbnailUrl: mediaUrlSchema.nullable().optional(),
    posterUrl: mediaUrlSchema.nullable().optional(),
    bannerUrl: mediaUrlSchema.nullable().optional(),
    trailerUrl: mediaUrlSchema.nullable().optional(),
    videoUrl: mediaUrlSchema.nullable().optional(),
    subtitleUrls: subtitleUrlsSchema.optional(),
    status: movieStatusSchema.optional(),
    isFeatured: isFeaturedSchema.optional(),
    isTrending: isTrendingSchema.optional(),
    isPremium: isPremiumSchema.optional(),
    tags: tagsSchema.optional(),
    seoTitle: seoTitleSchema.nullable().optional(),
    seoDescription: seoDescriptionSchema.nullable().optional(),
  })
  .strict();

// ---------------------------------------------------------------------------
// 1. Create Movie — POST /movies
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/movies
 *
 * Slug is not accepted from clients — the movie service generates it from title.
 */
export const createMovieSchema = movieWritableFieldsSchema.superRefine((data, ctx) => {
  if (data.status !== undefined && data.status !== 'DRAFT') {
    ctx.addIssue({
      code: 'custom',
      message: 'New movies must be created with DRAFT status',
      path: ['status'],
    });
  }
});

// ---------------------------------------------------------------------------
// 2. Update Movie — PATCH /movies/:id
// ---------------------------------------------------------------------------

/**
 * PATCH /api/v1/movies/:id
 *
 * Slug is not client-writable — use service logic if slug regeneration is needed.
 */
export const updateMovieSchema = movieWritableFieldsSchema.partial().strict().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' },
);

// ---------------------------------------------------------------------------
// 3. Get Movie By ID — GET /movies/:id
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/movies/:id
 */
export const getMovieByIdParamSchema = z
  .object({
    id: objectIdSchema,
  })
  .strict();

// ---------------------------------------------------------------------------
// 4. Delete Movie — DELETE /movies/:id
// ---------------------------------------------------------------------------

/**
 * DELETE /api/v1/movies/:id
 */
export const deleteMovieParamSchema = getMovieByIdParamSchema;

// ---------------------------------------------------------------------------
// 5. Movie List Query — GET /movies
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/movies
 */
export const movieListQuerySchema = z
  .object({
    page: pageSchema,
    limit: listLimitSchema,
    sortBy: sortBySchema.default('createdAt'),
    sortOrder: sortOrderSchema.default('desc'),
    status: statusFilterSchema,
    category: objectIdSchema.optional(),
    isFeatured: queryBooleanSchema.optional(),
    isTrending: queryBooleanSchema.optional(),
    isPremium: queryBooleanSchema.optional(),
    search: optionalSearchQuerySchema,
  })
  .strict();

// ---------------------------------------------------------------------------
// 6. Search Movies — GET /movies/search
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/movies/search
 */
export const searchMoviesQuerySchema = z
  .object({
    search: searchTermSchema,
    page: pageSchema,
    limit: searchLimitSchema,
    status: statusFilterSchema,
    category: objectIdSchema.optional(),
    isFeatured: queryBooleanSchema.optional(),
    isTrending: queryBooleanSchema.optional(),
    isPremium: queryBooleanSchema.optional(),
  })
  .strict();

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type CreateMovieInput = z.infer<typeof createMovieSchema>;
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>;
export type GetMovieByIdParams = z.infer<typeof getMovieByIdParamSchema>;
export type DeleteMovieParams = z.infer<typeof deleteMovieParamSchema>;
export type MovieListQuery = z.infer<typeof movieListQuerySchema>;
export type SearchMoviesQuery = z.infer<typeof searchMoviesQuerySchema>;

// ---------------------------------------------------------------------------
// Validator helpers (for tests and non-middleware callers)
// ---------------------------------------------------------------------------

export const validateCreateMovieBody = createValidator(createMovieSchema);
export const validateUpdateMovieBody = createValidator(updateMovieSchema);
export const validateGetMovieByIdParams = createValidator(getMovieByIdParamSchema);
export const validateDeleteMovieParams = createValidator(deleteMovieParamSchema);
export const validateMovieListQuery = createValidator(movieListQuerySchema);
export const validateSearchMoviesQuery = createValidator(searchMoviesQuerySchema);

export type { ValidationErrorDetail, ValidationResult } from './zod.util.js';
