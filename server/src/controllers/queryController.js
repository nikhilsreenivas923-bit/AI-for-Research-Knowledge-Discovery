import { QuerySchema } from '../schemas/index.js';
import { supabaseAdmin, isSupabaseConfigured, memoryStore } from '../services/supabase.js';
import { synthesizeQuery } from '../services/gemini.js';
import { randomUUID } from 'crypto';

export async function submitQuery(req, res) {
  try {
    const validated = QuerySchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: validated.error.flatten().fieldErrors
      });
    }

    const { workspaceId, question, includeWebSearch, strictCitationsOnly } = validated.data;
    const userId = req.user.id;

    if (isSupabaseConfigured()) {
      // 1. Verify workspace ownership
      const { data: ws, error: wsError } = await supabaseAdmin
        .from('workspaces')
        .select('id, name')
        .eq('id', workspaceId)
        .eq('user_id', userId)
        .single();

      if (wsError || !ws) {
        return res.status(403).json({ error: 'Forbidden: You do not own this workspace' });
      }

      // 2. Fetch all documents for this workspace
      const { data: documents, error: docsError } = await supabaseAdmin
        .from('documents')
        .select('id, title, content, author_or_source, summary')
        .eq('workspace_id', workspaceId);

      if (docsError) {
        return res.status(500).json({ error: 'Database error fetching workspace context', details: docsError.message });
      }

      if (!documents || documents.length === 0) {
        return res.status(400).json({
          error: 'Empty Corpus',
          message: 'This workspace contains no documents yet. Please ingest research sources before querying.'
        });
      }

      // 3. Call Gemini Cross-Document Synthesis
      const synthesis = await synthesizeQuery({
        question,
        documents,
        includeWebSearch,
        strictCitationsOnly
      });

      // 4. Save to queries table
      const { data: queryRecord, error: queryError } = await supabaseAdmin
        .from('queries')
        .insert({
          workspace_id: workspaceId,
          question,
          answer: synthesis.synthesized_answer,
          citations: synthesis.cited_document_ids || []
        })
        .select()
        .single();

      if (queryError) {
        console.error('[Supabase Save Query Error]:', queryError.message);
      }

      // 5. Gather full citation document details for frontend badge rendering
      const citationDocs = documents
        .filter(d => (synthesis.cited_document_ids || []).includes(d.id))
        .map(d => ({
          id: d.id,
          title: d.title,
          author_or_source: d.author_or_source
        }));

      return res.status(200).json({
        success: true,
        query: {
          id: queryRecord?.id || randomUUID(),
          workspace_id: workspaceId,
          question,
          answer: synthesis.synthesized_answer,
          citations: synthesis.cited_document_ids || [],
          citation_details: citationDocs,
          created_at: queryRecord?.created_at || new Date().toISOString()
        }
      });
    }

    // In-memory fallback
    const ws = memoryStore.workspaces.get(workspaceId);
    if (!ws || ws.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this workspace' });
    }

    const docs = Array.from(memoryStore.documents.values()).filter(d => d.workspace_id === workspaceId);
    if (docs.length === 0) {
      return res.status(400).json({
        error: 'Empty Corpus',
        message: 'This workspace contains no documents yet. Please ingest research sources before querying.'
      });
    }

    const synthesis = await synthesizeQuery({
      question,
      documents: docs,
      includeWebSearch,
      strictCitationsOnly
    });

    const newQuery = {
      id: randomUUID(),
      workspace_id: workspaceId,
      question,
      answer: synthesis.synthesized_answer,
      citations: synthesis.cited_document_ids || [],
      created_at: new Date().toISOString()
    };
    memoryStore.queries.set(newQuery.id, newQuery);

    const citationDocs = docs
      .filter(d => (synthesis.cited_document_ids || []).includes(d.id))
      .map(d => ({
        id: d.id,
        title: d.title,
        author_or_source: d.author_or_source
      }));

    return res.status(200).json({
      success: true,
      query: {
        ...newQuery,
        citation_details: citationDocs
      }
    });
  } catch (err) {
    console.error('[Query Synthesis Controller Error]:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function listQueries(req, res) {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;

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

      const { data: queries, error } = await supabaseAdmin
        .from('queries')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: true });

      if (error) {
        return res.status(500).json({ error: 'Database error fetching queries', details: error.message });
      }

      // Fetch documents to populate citation details
      const { data: docs } = await supabaseAdmin
        .from('documents')
        .select('id, title, author_or_source')
        .eq('workspace_id', workspaceId);

      const docsMap = new Map((docs || []).map(d => [d.id, d]));

      const formatted = (queries || []).map(q => ({
        ...q,
        citation_details: (q.citations || []).map(id => docsMap.get(id)).filter(Boolean)
      }));

      return res.status(200).json({
        success: true,
        queries: formatted
      });
    }

    // In-memory fallback
    const ws = memoryStore.workspaces.get(workspaceId);
    if (!ws || ws.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this workspace' });
    }

    const docsMap = new Map(
      Array.from(memoryStore.documents.values())
        .filter(d => d.workspace_id === workspaceId)
        .map(d => [d.id, { id: d.id, title: d.title, author_or_source: d.author_or_source }])
    );

    const queries = Array.from(memoryStore.queries.values())
      .filter(q => q.workspace_id === workspaceId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map(q => ({
        ...q,
        citation_details: (q.citations || []).map(id => docsMap.get(id)).filter(Boolean)
      }));

    return res.status(200).json({
      success: true,
      queries
    });
  } catch (err) {
    console.error('[List Queries Controller Error]:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

