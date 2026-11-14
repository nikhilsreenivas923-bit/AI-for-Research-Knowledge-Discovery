import { supabaseAdmin, isSupabaseConfigured, memoryStore } from '../services/supabase.js';

export async function syncUser(req, res) {
  try {
    const user = req.user;
    if (!user || !user.id || !user.email) {
      return res.status(400).json({ error: 'User data missing in authenticated session' });
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          created_at: new Date().toISOString()
        }, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('[Supabase Auth Sync Error]:', error.message);
        return res.status(500).json({ error: 'Failed to sync user profile with Supabase', details: error.message });
      }

      return res.status(200).json({
        success: true,
        message: 'User profile synced successfully',
        profile: data
      });
    }

    // In-memory fallback
    memoryStore.profiles.set(user.id, {
      id: user.id,
      email: user.email,
      created_at: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'User profile synced successfully (Memory store)',
      profile: { id: user.id, email: user.email }
    });
  } catch (err) {
    console.error('[Sync Controller Error]:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

