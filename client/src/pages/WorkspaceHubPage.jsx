import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import DocumentUploader from '../components/DocumentUploader';
import DocumentList from '../components/DocumentList';
import { api } from '../lib/api';
import { 
  FolderGit2, 
  Files, 
  MessageSquareCode, 
  Plus, 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Calendar,
  Layers,
  GraduationCap,
  TrendingUp,
  Scale,
  Building2,
  Bookmark,
  X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';

const domainIcons = {
  Academic: GraduationCap,
  Market: TrendingUp,
  Legal: Scale,
  Corporate: Building2,
  Other: Bookmark
};

const domainBadgeVariants = {
  Academic: 'academic',
  Market: 'market',
  Legal: 'legal',
  Corporate: 'corporate',
  Other: 'secondary',
};

export default function WorkspaceHubPage() {
  const { id } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploader, setShowUploader] = useState(false);

  const loadData = async () => {
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
      console.error('Failed to load workspace hub:', err);
      setError(err.message || 'Could not load workspace details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleDocumentUploaded = (newDoc) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setShowUploader(false);
    if (workspace) {
      setWorkspace((prev) => ({
        ...prev,
        document_count: (prev.document_count || 0) + 1
      }));
    }
  };

  const handleDeleteDocument = async (docId) => {
    await api.deleteDocument(docId);
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    if (workspace) {
      setWorkspace((prev) => ({
        ...prev,
        document_count: Math.max(0, (prev.document_count || 1) - 1)
      }));
    }
  };

  const DomainIcon = (workspace && domainIcons[workspace.domain]) || Bookmark;
  const badgeVariant = (workspace && domainBadgeVariants[workspace.domain]) || 'secondary';

  return (
    <Layout workspace={workspace}>
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-muted-foreground space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs font-mono">Loading workspace corpus and documents...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Workspace Error</strong>
            <p className="text-xs mt-1 text-muted-foreground">{error}</p>
            <Link to="/dashboard" className="mt-3 inline-block">
              <Button variant="outline" size="sm">Back to Workspaces</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Workspace Hero Banner */}
          <div className="relative rounded-3xl bg-gradient-to-br from-card via-card/90 to-background border border-border/70 p-6 sm:p-8 lg:p-10 overflow-hidden shadow-sm backdrop-blur-xl">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge variant={badgeVariant} className="flex items-center gap-1.5 px-3 py-1 text-xs">
                    <DomainIcon className="w-3.5 h-3.5" />
                    <span>{workspace.domain} Domain</span>
                  </Badge>

                  <span className="text-xs text-muted-foreground font-mono">
                    Created {new Date(workspace.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {workspace.name}
                </h1>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {workspace.description || 'Dedicated research workspace for knowledge synthesis, corpus indexing, and cited evidence discovery.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Button
                  variant={showUploader ? 'secondary' : 'outline'}
                  size="default"
                  onClick={() => setShowUploader(!showUploader)}
                  className="text-xs"
                >
                  {showUploader ? (
                    <>
                      <X className="w-4 h-4 mr-1.5" />
                      <span>Close Uploader</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1.5" />
                      <span>Ingest Material</span>
                    </>
                  )}
                </Button>

                <Link to={`/workspace/${id}/ask`}>
                  <Button
                    size="default"
                    className="bg-primary text-primary-foreground shadow-md shadow-primary/20 text-xs"
                  >
                    <MessageSquareCode className="w-4 h-4 mr-1.5" />
                    <span>Ask AI Assistant</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Ingest Document Drawer (Collapsible) */}
          {showUploader && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-200">
              <DocumentUploader
                workspaceId={id}
                onUploadSuccess={handleDocumentUploaded}
                onCancel={() => setShowUploader(false)}
              />
            </div>
          )}

          {/* Corpus Overview & Document List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                  <Files className="w-5 h-5 text-primary" />
                  Workspace Corpus ({documents.length} Indexed)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Processed with Gemini 2.5 Flash for automatic entity extraction, semantic chunking, and summarization.
                </p>
              </div>

              {!showUploader && documents.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploader(true)}
                  className="text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1 text-primary" />
                  <span>Add Material</span>
                </Button>
              )}
            </div>

            <DocumentList
              workspaceId={id}
              documents={documents}
              onDeleteDocument={handleDeleteDocument}
              onOpenUploader={() => setShowUploader(true)}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}
