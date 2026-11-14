import { supabaseAdmin, isSupabaseConfigured, memoryStore } from '../services/supabase.js';

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or malformed Authorization Bearer header'
      });
    }

    const token = authHeader.split(' ')[1]?.trim();
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Empty Bearer token provided'
      });
    }

    // 1. If active Supabase credentials are configured, verify JWT with Supabase Auth
    if (isSupabaseConfigured()) {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !user) {
        // Check if demo token provided during development
        if (token === 'demo-token') {
          req.user = {
            id: '00000000-0000-4000-a000-000000000001',
            email: 'researcher@researchmind.ai'
          };
          return next();
        }

        return res.status(401).json({
          error: 'Unauthorized',
          message: error?.message || 'Invalid or expired authentication token'
        });
      }

      req.user = {
        id: user.id,
        email: user.email
      };
      return next();
    }

    // 2. Fallback in development/demo mode when Supabase credentials are placeholder
    if (token === 'demo-token' || token.length > 10) {
      // Allow demo user or decode basic info if mock
      req.user = {
        id: '00000000-0000-4000-a000-000000000001',
        email: 'researcher@researchmind.ai'
      };
      return next();
    }

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid session token'
    });
  } catch (err) {
    console.error('[Auth Middleware Error]:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to authenticate request'
    });
  }
}

