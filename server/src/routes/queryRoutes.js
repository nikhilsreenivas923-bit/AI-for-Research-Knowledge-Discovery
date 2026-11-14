import { Router } from 'express';
import { submitQuery, listQueries } from '../controllers/queryController.js';
import { authMiddleware } from '../middleware/auth.js';
import { queryRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Protect all query routes with auth middleware
router.use(authMiddleware);

// POST /api/query - Submits a question, retrieves workspace docs, calls Gemini for synthesis, saves to queries
// Protected with strict 10 requests / minute rate limiter
router.post('/', queryRateLimiter, submitQuery);

// GET /api/query/:workspaceId - Retrieves past queries and chat history for a workspace
router.get('/:workspaceId', listQueries);

export default router;

