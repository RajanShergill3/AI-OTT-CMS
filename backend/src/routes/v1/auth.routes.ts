import { Router } from 'express';

import {
  getProfile,
  login,
  logout,
  refresh,
  register,
} from '../../controllers/auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import {
  validateLoginBody,
  validateRefreshBody,
  validateRegisterBody,
} from '../../validators/auth.validator.js';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
router.post('/register', validate('body', validateRegisterBody), asyncHandler(register));

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user and issue tokens
 * @access  Public
 */
router.post('/login', validate('body', validateLoginBody), asyncHandler(login));

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token using refresh token cookie or body
 * @access  Public
 */
router.post('/refresh', validate('body', validateRefreshBody), asyncHandler(refresh));

/**
 * @route   POST /api/v1/auth/logout
 * @desc    End the current session and clear refresh token cookie
 * @access  Private
 */
router.post('/logout', authenticate, asyncHandler(logout));

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get authenticated user profile
 * @access  Private
 */
router.get('/profile', authenticate, asyncHandler(getProfile));

export default router;
