import { Router } from 'express';
import { 
  ingestDocument, 
  listDocuments, 
  getDocument, 
  deleteDocument 
} from '../controllers/documentController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Protect all document routes with auth middleware
router.use(authMiddleware);

// POST /api/documents - Ingest document (Triggers Gemini for initial summary)
router.post('/', ingestDocument);

// GET /api/documents/:workspaceId - List documents for a workspace
router.get('/:workspaceId', listDocuments);

// GET /api/documents/single/:docId - Get single document details & summary
router.get('/single/:docId', getDocument);

// DELETE /api/documents/:docId - Delete document
router.delete('/:docId', deleteDocument);

export default router;

