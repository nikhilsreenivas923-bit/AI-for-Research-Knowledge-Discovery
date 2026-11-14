import { Router } from 'express';
import { 
  createWorkspace, 
  listWorkspaces, 
  getWorkspace, 
  deleteWorkspace 
} from '../controllers/workspaceController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Protect all workspace routes with auth middleware
router.use(authMiddleware);

// POST /api/workspaces - Create workspace
router.post('/', createWorkspace);

// GET /api/workspaces - List user workspaces
router.get('/', listWorkspaces);

// GET /api/workspaces/:id - Get specific workspace
router.get('/:id', getWorkspace);

// DELETE /api/workspaces/:id - Delete workspace
router.delete('/:id', deleteWorkspace);

export default router;

