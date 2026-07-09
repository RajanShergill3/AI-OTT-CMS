import { Router } from 'express';

import {
  createMovie,
  deleteMovie,
  getMovieById,
  listMovies,
  searchMovies,
  updateMovie,
} from '../../controllers/movie.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireAnyRole, requireRole } from '../../middleware/role.middleware.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../../middleware/validate.middleware.js';
import type { EmptyQuery } from '../../types/express.d.js';
import { authenticatedHandler } from '../../utils/authenticated-handler.js';
import type {
  CreateMovieInput,
  GetMovieByIdParams,
  MovieListQuery,
  SearchMoviesQuery,
  UpdateMovieInput,
} from '../../validators/movie.validator.js';
import {
  createMovieSchema,
  deleteMovieParamSchema,
  getMovieByIdParamSchema,
  movieListQuerySchema,
  searchMoviesQuerySchema,
  updateMovieSchema,
} from '../../validators/movie.validator.js';

const router = Router();

const readRoles = requireAnyRole('ADMIN', 'EDITOR', 'VIEWER');
const writeRoles = requireAnyRole('ADMIN', 'EDITOR');
const adminOnly = requireRole('ADMIN');

/**
 * @route   GET /api/v1/movies
 * @desc    List movies with pagination, sorting, and filters
 * @access  Private — Admin, Editor, Viewer
 */
router.get(
  '/',
  authenticate,
  readRoles,
  validateQuery(movieListQuerySchema),
  authenticatedHandler<unknown, MovieListQuery>(listMovies),
);

/**
 * @route   GET /api/v1/movies/search
 * @desc    Search movies by text query
 * @access  Private — Admin, Editor, Viewer
 */
router.get(
  '/search',
  authenticate,
  readRoles,
  validateQuery(searchMoviesQuerySchema),
  authenticatedHandler<unknown, SearchMoviesQuery>(searchMovies),
);

/**
 * @route   GET /api/v1/movies/:id
 * @desc    Get a single movie by ID
 * @access  Private — Admin, Editor, Viewer
 */
router.get(
  '/:id',
  authenticate,
  readRoles,
  validateParams(getMovieByIdParamSchema),
  authenticatedHandler<unknown, EmptyQuery, GetMovieByIdParams>(getMovieById),
);

/**
 * @route   POST /api/v1/movies
 * @desc    Create a new movie
 * @access  Private — Admin, Editor
 */
router.post(
  '/',
  authenticate,
  writeRoles,
  validateBody(createMovieSchema),
  authenticatedHandler<CreateMovieInput>(createMovie),
);

/**
 * @route   PATCH /api/v1/movies/:id
 * @desc    Partially update a movie
 * @access  Private — Admin, Editor
 */
router.patch(
  '/:id',
  authenticate,
  writeRoles,
  validateParams(getMovieByIdParamSchema),
  validateBody(updateMovieSchema),
  authenticatedHandler<UpdateMovieInput, EmptyQuery, GetMovieByIdParams>(updateMovie),
);

/**
 * @route   DELETE /api/v1/movies/:id
 * @desc    Soft-delete a movie
 * @access  Private — Admin
 */
router.delete(
  '/:id',
  authenticate,
  adminOnly,
  validateParams(deleteMovieParamSchema),
  authenticatedHandler<unknown, EmptyQuery, GetMovieByIdParams>(deleteMovie),
);

export default router;
