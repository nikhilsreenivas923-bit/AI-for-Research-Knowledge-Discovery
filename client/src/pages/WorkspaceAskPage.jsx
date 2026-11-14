import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ChatInterface from '../components/ChatInterface';
import { api } from '../lib/api';
import { 
  ArrowLeft, 
  Files, 
  MessageSquareCode, 
  Sparkles, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export default function WorkspaceAskPage() {
  const { id } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadWorkspaceData() {
      try {
        setLoading(true);
        setError(null);
        const [wsRes, docsRes] = await Promise.all([
          api.getWorkspace(id),
          api.listDocuments(id)
        ]);
        setWorkspace(wsRes.workspace);
        setDocuments(docsRes.documents || []);
      } catch (err) {
        console.error('Failed to load ask interface data:', err);
        setError(err.message || 'Could not load workspace context');
      } finally {
        setLoading(false);
      }
    }
    loadWorkspaceData();
  }, [id]);

  return (
    <Layout workspace={workspace}>
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-muted-foreground space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs font-mono">Initializing AI synthesis engine & workspace context...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Error Loading AI Interface</strong>
            <p className="text-xs mt-1 text-muted-foreground">{error}</p>
            <Link to={`/workspace/${id}`} className="mt-3 inline-block">
              <Button variant="outline" size="sm">Back to Workspace Hub</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Top navigation / back bar */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <Link
              to={`/workspace/${id}`}
              className="inline-flex items-center space-x-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Workspace Corpus</span>
            </Link>

            <div className="flex items-center space-x-3 text-xs">
              <span className="text-muted-foreground flex items-center">
                <Files className="w-3.5 h-3.5 mr-1.5 text-primary" />
                Active Corpus: <strong className="text-foreground ml-1">{documents.length} Documents</strong>
              </span>
            </div>
          </div>

          {/* AI Chat Interface */}
          <ChatInterface
            workspaceId={id}
            documents={documents}
          />
        </div>
      )}
    </Layout>
  );
}
