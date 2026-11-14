import { DocumentIngestSchema } from '../schemas/index.js';
import { supabaseAdmin, isSupabaseConfigured, memoryStore } from '../services/supabase.js';
import { summarizeDocument } from '../services/gemini.js';
import { randomUUID } from 'crypto';

export async function ingestDocument(req, res) {
  try {
    const validated = DocumentIngestSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: validated.error.flatten().fieldErrors
      });
    }

    const { workspaceId, title, content, author_or_source } = validated.data;
    const userId = req.user.id;

    // 1. Verify workspace ownership
    if (isSupabaseConfigured()) {
      const { data: ws, error: wsError } = await supabaseAdmin
        .from('workspaces')
        .select('id')
        .eq('id', workspaceId)
        .eq('user_id', userId)
        .single();

      if (wsError || !ws) {
        return res.status(403).json({ error: 'Forbidden: You do not own this workspace' });
      }

      // 2. Call Gemini for automatic summarization and key entity extraction
      const { summary, key_themes } = await summarizeDocument(title, content, author_or_source);

      // 3. Save to database
      const { data: document, error: docError } = await supabaseAdmin
        .from('documents')
        .insert({
          workspace_id: workspaceId,
          title,
          content,
          author_or_source: author_or_source || '',
          summary,
          key_themes: key_themes || []
        })
        .select()
        .single();

      if (docError) {
        console.error('[Supabase Ingest Doc Error]:', docError.message);
        return res.status(500).json({ error: 'Database error saving document', details: docError.message });
      }

      return res.status(201).json({
        success: true,
        document
      });
    }

    // In-memory fallback
    const ws = memoryStore.workspaces.get(workspaceId);
    if (!ws || ws.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this workspace' });
    }

    const { summary, key_themes } = await summarizeDocument(title, content, author_or_source);

    const newDoc = {
      id: randomUUID(),
      workspace_id: workspaceId,
      title,
      content,
      author_or_source: author_or_source || '',
      summary,
      key_themes: key_themes || [],
      created_at: new Date().toISOString()
    };
    memoryStore.documents.set(newDoc.id, newDoc);

    return res.status(201).json({
      success: true,
      document: newDoc
    });
  } catch (err) {
    console.error('[Ingest Document Controller Error]:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function listDocuments(req, res) {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;

    if (isSupabaseConfigured()) {
      // Verify workspace ownership
      const { data: ws, error: wsError } = await supabaseAdmin
        .from('workspaces')
        .select('id')
        .eq('id', workspaceId)
        .eq('user_id', userId)
        .single();

      if (wsError || !ws) {
        return res.status(403).json({ error: 'Forbidden: You do not own this workspace' });
      }

      const { data: documents, error } = await supabaseAdmin
        .from('documents')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: 'Database error fetching documents', details: error.message });
      }

      return res.status(200).json({
        success: true,
        documents: documents || []
      });
    }

    // In-memory fallback
    const ws = memoryStore.workspaces.get(workspaceId);
    if (!ws || ws.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this workspace' });
    }

    const docs = Array.from(memoryStore.documents.values())
      .filter(d => d.workspace_id === workspaceId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.status(200).json({
      success: true,
      documents: docs
    });
  } catch (err) {
    console.error('[List Documents Controller Error]:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getDocument(req, res) {
  try {
    const { docId } = req.params;
    const userId = req.user.id;

    if (isSupabaseConfigured()) {
      const { data: document, error } = await supabaseAdmin
        .from('documents')
        .select('*, workspace:workspaces(id, user_id, name, domain)')
        .eq('id', docId)
        .single();

      if (error || !document || document.workspace?.user_id !== userId) {
        return res.status(404).json({ error: 'Document not found or access denied' });
      }

      return res.status(200).json({
        success: true,
        document
      });
    }

    // In-memory fallback
    const doc = memoryStore.documents.get(docId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const ws = memoryStore.workspaces.get(doc.workspace_id);
    if (!ws || ws.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this workspace' });
    }

    return res.status(200).json({
      success: true,
      document: {
        ...doc,
        workspace: {
          id: ws.id,
          user_id: ws.user_id,
          name: ws.name,
          domain: ws.domain
        }
      }
    });
  } catch (err) {
    console.error('[Get Document Controller Error]:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function deleteDocument(req, res) {
  try {
    const { docId } = req.params;
    const userId = req.user.id;

    if (isSupabaseConfigured()) {
      const { data: document, error: fetchErr } = await supabaseAdmin
        .from('documents')
        .select('*, workspace:workspaces(user_id)')
        .eq('id', docId)
        .single();

      if (fetchErr || !document || document.workspace?.user_id !== userId) {
        return res.status(404).json({ error: 'Document not found or access denied' });
      }

      const { error: delErr } = await supabaseAdmin
        .from('documents')
        .delete()
        .eq('id', docId);

      if (delErr) {
        return res.status(500).json({ error: 'Database error deleting document', details: delErr.message });
      }

      return res.status(200).json({ success: true, message: 'Document deleted successfully' });
    }

    // In-memory fallback
    const doc = memoryStore.documents.get(docId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const ws = memoryStore.workspaces.get(doc.workspace_id);
    if (!ws || ws.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this workspace' });
    }

    memoryStore.documents.delete(docId);
    return res.status(200).json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    console.error('[Delete Document Controller Error]:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

