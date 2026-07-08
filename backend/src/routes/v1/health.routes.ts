import { Router } from 'express';
import { getHealth } from '../../controllers/health.controller.js';
import { asyncHandler } from '../../utils/async-handler.js';

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    Application health check
 * @access  Public
 */
router.get('/health', asyncHandler(getHealth));

export default router;
