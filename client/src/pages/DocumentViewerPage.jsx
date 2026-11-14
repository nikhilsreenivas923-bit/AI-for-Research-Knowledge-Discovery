import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../lib/api';
import { 
  ArrowLeft, 
  FileText, 
  Sparkles, 
  Tag, 
  Calendar, 
  UserCircle, 
  Trash2, 
  MessageSquareCode, 
  Loader2, 
  AlertCircle,
  Copy,
  Check,
  BookOpen
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export default function DocumentViewerPage() {
  const { id: workspaceId, docId } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadDoc() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getDocument(docId);
        setDocument(res.document);
      } catch (err) {
        console.error('Failed to load document:', err);
        setError(err.message || 'Could not load document insights');
      } finally {
        setLoading(false);
      }
    }
    loadDoc();
  }, [docId]);

  const handleCopy = () => {
    if (!document) return;
    navigator.clipboard.writeText(document.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${document.title}" from this workspace?`)) {
      setIsDeleting(true);
      try {
        await api.deleteDocument(docId);
        navigate(`/workspace/${workspaceId}`);
      } catch (err) {
        alert('Failed to delete document: ' + err.message);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const themes = Array.isArray(document?.key_themes) ? document.key_themes : [];

  return (
    <Layout workspace={document?.workspace}>
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-muted-foreground space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs font-mono">Loading document insights & text corpus...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Error Loading Document</strong>
            <p className="text-xs mt-1 text-muted-foreground">{error}</p>
            <Link to={`/workspace/${workspaceId}`} className="mt-3 inline-block">
              <Button variant="outline" size="sm">Back to Workspace</Button>
            </Link>
          </div>
        </div>
      ) : document ? (
        <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
          {/* Top Bar Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <Link
              to={`/workspace/${workspaceId}`}
              className="inline-flex items-center space-x-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Workspace Corpus</span>
            </Link>

            <div className="flex items-center space-x-2">
              <Link to={`/workspace/${workspaceId}/ask`}>
                <Button size="sm" className="bg-primary text-primary-foreground text-xs">
                  <MessageSquareCode className="w-3.5 h-3.5 mr-1.5" />
                  <span>Ask AI About This Corpus</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleDelete}
                disabled={isDeleting}
                title="Delete Document"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Document Header Card */}
          <Card className="p-6 md:p-8 space-y-4 shadow-xl bg-card/90">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 opacity-70" />
                Indexed on {new Date(document.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              {document.author_or_source && (
                <span className="flex items-center">
                  <UserCircle className="w-3.5 h-3.5 mr-1 text-primary" />
                  Source: <strong className="text-foreground ml-1">{document.author_or_source}</strong>
                </span>
              )}
              <span className="font-mono text-muted-foreground">
                {document.content.length} characters • ~{Math.round(document.content.split(/\s+/).length)} words
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-snug">
              {document.title}
            </h1>

            {/* AI Executive Summary Card */}
            <div className="mt-6 rounded-2xl bg-muted/40 border border-primary/20 p-5 shadow-inner">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-primary mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Gemini AI Executive Summary</span>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed font-normal">
                {document.summary || 'Summary unavailable.'}
              </p>

              {/* Extracted Key Themes */}
              {themes.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center flex-wrap gap-2">
                  <span className="text-[11px] font-mono text-muted-foreground mr-1 flex items-center">
                    <Tag className="w-3 h-3 mr-1 text-primary" />
                    Key Themes:
                  </span>
                  {themes.map((theme, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono font-medium"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Raw / Formatted Content Viewer */}
          <Card className="p-6 md:p-8 space-y-4 shadow-xl bg-card/90">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Primary Source Content
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-8 text-xs border-border/70 hover:border-primary/40"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500 mr-1.5" />
                    <span className="text-emerald-500 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </Button>
            </div>

            <div className="bg-muted/30 border border-border/70 rounded-2xl p-5 overflow-x-auto text-xs font-mono text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {document.content}
            </div>
          </Card>
        </div>
      ) : null}
    </Layout>
  );
}
