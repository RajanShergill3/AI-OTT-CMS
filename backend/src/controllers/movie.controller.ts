import type { Response } from 'express';

import { HTTP_STATUS } from '../constants/http-status.js';
import * as movieService from '../services/movie.service.js';
import type { EmptyQuery, ValidatedRequest } from '../types/express.d.js';
import type { MovieActorContext } from '../types/movie.types.js';
import { sendSuccess } from '../utils/api-response.js';
import type {
  CreateMovieInput,
  GetMovieByIdParams,
  MovieListQuery,
  SearchMoviesQuery,
  UpdateMovieInput,
} from '../validators/movie.validator.js';

type CreateMovieRequest = ValidatedRequest<CreateMovieInput>;
type UpdateMovieRequest = ValidatedRequest<UpdateMovieInput, EmptyQuery, GetMovieByIdParams>;
type MovieIdParamsRequest = ValidatedRequest<unknown, EmptyQuery, GetMovieByIdParams>;
type ListMoviesRequest = ValidatedRequest<unknown, MovieListQuery>;
type SearchMoviesRequest = ValidatedRequest<unknown, SearchMoviesQuery>;

const getActorFromRequest = (req: ValidatedRequest<unknown>): MovieActorContext => {
  return { userId: req.user.id };
};

/**
 * POST /api/v1/movies
 */
export const createMovie = async (req: CreateMovieRequest, res: Response): Promise<void> => {
  const movie = await movieService.createMovie(req.body, getActorFromRequest(req));

  sendSuccess(res, movie, {
    status: HTTP_STATUS.CREATED,
    message: 'Movie created successfully',
  });
};

/**
 * PATCH /api/v1/movies/:id
 */
export const updateMovie = async (req: UpdateMovieRequest, res: Response): Promise<void> => {
  const movie = await movieService.updateMovie(req.params.id, req.body, getActorFromRequest(req));

  sendSuccess(res, movie, {
    status: HTTP_STATUS.OK,
    message: 'Movie updated successfully',
  });
};

/**
 * GET /api/v1/movies/:id
 */
export const getMovieById = async (req: MovieIdParamsRequest, res: Response): Promise<void> => {
  const movie = await movieService.getMovieById(req.params.id);

  sendSuccess(res, movie, {
    status: HTTP_STATUS.OK,
    message: 'Movie retrieved successfully',
  });
};

/**
 * GET /api/v1/movies
 */
export const listMovies = async (req: ListMoviesRequest, res: Response): Promise<void> => {
  const result = await movieService.listMovies(req.query);

  sendSuccess(res, result.items, {
    status: HTTP_STATUS.OK,
    meta: {
      pagination: result.pagination,
    },
  });
};

/**
 * GET /api/v1/movies/search
 */
export const searchMovies = async (req: SearchMoviesRequest, res: Response): Promise<void> => {
  const result = await movieService.searchMovies(req.query);

  sendSuccess(res, result.items, {
    status: HTTP_STATUS.OK,
    meta: {
      query: result.query,
      pagination: result.pagination,
    },
  });
};

/**
 * DELETE /api/v1/movies/:id
 */
export const deleteMovie = async (req: MovieIdParamsRequest, res: Response): Promise<void> => {
  const result = await movieService.softDeleteMovie(req.params.id, getActorFromRequest(req));

  sendSuccess(res, result, {
    status: HTTP_STATUS.OK,
    message: 'Movie deleted successfully',
  });
};
