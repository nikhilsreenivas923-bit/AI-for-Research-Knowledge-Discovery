import { Router } from 'express';
import { syncUser } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/sync - Syncs Supabase auth user to public.profiles
router.post('/sync', authMiddleware, syncUser);

export default router;

