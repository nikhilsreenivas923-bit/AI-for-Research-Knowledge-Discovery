import { WorkspaceSchema } from '../schemas/index.js';
import { supabaseAdmin, isSupabaseConfigured, memoryStore } from '../services/supabase.js';
import { randomUUID } from 'crypto';

export async function createWorkspace(req, res) {
  try {
    const validated = WorkspaceSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: validated.error.flatten().fieldErrors
      });
    }

    const { name, domain, description } = validated.data;
    const userId = req.user.id;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('workspaces')
        .insert({
          user_id: userId,
          name,
          domain,
          description: description || ''
        })
        .select()
        .single();

      if (error) {
        console.error('[Supabase Create Workspace Error]:', error.message);
        return res.status(500).json({ error: 'Database error creating workspace', details: error.message });
      }

      return res.status(201).json({
        success: true,
        workspace: { ...data, document_count: 0, query_count: 0 }
      });
    }

    // In-memory fallback
    const newWorkspace = {
      id: randomUUID(),
      user_id: userId,
      name,
      domain,
      description: description || '',
      created_at: new Date().toISOString(),
      document_count: 0,
      query_count: 0
    };
    memoryStore.workspaces.set(newWorkspace.id, newWorkspace);

    return res.status(201).json({
      success: true,
      workspace: newWorkspace
    });
  } catch (err) {
    console.error('[Create Workspace Controller Error]:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function listWorkspaces(req, res) {
  try {
    const userId = req.user.id;

    if (isSupabaseConfigured()) {
      const { data: workspaces, error } = await supabaseAdmin
        .from('workspaces')
        .select(`
          id,
          user_id,
          name,
          domain,
          description,
          created_at,
          documents:documents(count),
          queries:queries(count)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Supabase List Workspaces Error]:', error.message);
        return res.status(500).json({ error: 'Database error fetching workspaces', details: error.message });
      }

      const formatted = (workspaces || []).map(ws => ({
        id: ws.id,
        user_id: ws.user_id,
        name: ws.name,
        domain: ws.domain,
        description: ws.description,
        created_at: ws.created_at,
        document_count: ws.documents?.[0]?.count || 0,
        query_count: ws.queries?.[0]?.count || 0
      }));

      return res.status(200).json({
        success: true,
        workspaces: formatted
      });
    }

    // In-memory fallback
    const userWorkspaces = Array.from(memoryStore.workspaces.values())
      .filter(ws => ws.user_id === userId)
      .map(ws => {
        const docCount = Array.from(memoryStore.documents.values()).filter(d => d.workspace_id === ws.id).length;
        const queryCount = Array.from(memoryStore.queries.values()).filter(q => q.workspace_id === ws.id).length;
        return {
          ...ws,
          document_count: docCount,
          query_count: queryCount
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.status(200).json({
      success: true,
      workspaces: userWorkspaces
    });
  } catch (err) {
    console.error('[List Workspaces Controller Error]:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getWorkspace(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (isSupabaseConfigured()) {
      const { data: workspace, error } = await supabaseAdmin
        .from('workspaces')
        .select(`
          id,
          user_id,
          name,
          domain,
          description,
          created_at,
          documents:documents(count),
          queries:queries(count)
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error || !workspace) {
        return res.status(404).json({ error: 'Workspace not found or access denied' });
      }

      return res.status(200).json({
        success: true,
        workspace: {
          id: workspace.id,
          user_id: workspace.user_id,
          name: workspace.name,
          domain: workspace.domain,
          description: workspace.description,
          created_at: workspace.created_at,
          document_count: workspace.documents?.[0]?.count || 0,
          query_count: workspace.queries?.[0]?.count || 0
        }
      });
    }

    // In-memory fallback
    const ws = memoryStore.workspaces.get(id);
    if (!ws || ws.user_id !== userId) {
      return res.status(404).json({ error: 'Workspace not found or access denied' });
    }

    const docCount = Array.from(memoryStore.documents.values()).filter(d => d.workspace_id === ws.id).length;
    const queryCount = Array.from(memoryStore.queries.values()).filter(q => q.workspace_id === ws.id).length;

    return res.status(200).json({
      success: true,
      workspace: {
        ...ws,
        document_count: docCount,
        query_count: queryCount
      }
    });
  } catch (err) {
    console.error('[Get Workspace Controller Error]:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function deleteWorkspace(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (isSupabaseConfigured()) {
      const { error } = await supabaseAdmin
        .from('workspaces')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('[Supabase Delete Workspace Error]:', error.message);
        return res.status(500).json({ error: 'Database error deleting workspace', details: error.message });
      }

      return res.status(200).json({ success: true, message: 'Workspace deleted successfully' });
    }

    // In-memory fallback
    const ws = memoryStore.workspaces.get(id);
    if (!ws || ws.user_id !== userId) {
      return res.status(404).json({ error: 'Workspace not found or access denied' });
    }

    // Cascade delete documents and queries
    for (const [docId, doc] of memoryStore.documents.entries()) {
      if (doc.workspace_id === id) memoryStore.documents.delete(docId);
    }
    for (const [qId, q] of memoryStore.queries.entries()) {
      if (q.workspace_id === id) memoryStore.queries.delete(qId);
    }
    memoryStore.workspaces.delete(id);

    return res.status(200).json({ success: true, message: 'Workspace deleted successfully' });
  } catch (err) {
    console.error('[Delete Workspace Controller Error]:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

