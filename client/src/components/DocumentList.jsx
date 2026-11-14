import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  Tag, 
  Calendar,
  Layers,
  ArrowUpRight,
  X
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function DocumentList({ workspaceId, documents = [], onDeleteDocument, onOpenUploader }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const filteredDocs = documents.filter((doc) => {
    const q = searchQuery.toLowerCase();
    const titleMatch = doc.title?.toLowerCase().includes(q);
    const authorMatch = doc.author_or_source?.toLowerCase().includes(q);
    const summaryMatch = doc.summary?.toLowerCase().includes(q);
    return titleMatch || authorMatch || summaryMatch;
  });

  const handleDelete = async (docId, title) => {
    if (confirm(`Remove "${title}" from this workspace?`)) {
      setDeletingId(docId);
      try {
        await onDeleteDocument(docId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (documents.length === 0) {
    return (
      <div className="bg-card/60 border border-border/70 rounded-3xl p-10 sm:p-14 text-center backdrop-blur-sm relative overflow-hidden">
        {/* Layered concentric glowing rings */}
        <div className="relative w-16 h-16 mx-auto mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-primary/10 border border-primary/20 animate-ping opacity-30" />
          <div className="relative w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
            <FileText className="w-7 h-7" />
          </div>
        </div>

        <h4 className="text-base sm:text-lg font-bold text-foreground mb-2 tracking-tight">
          No Documents Ingested Yet
        </h4>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
          This workspace corpus is empty. Ingest research papers, market briefings, case laws, or notes to unlock evidence-backed Gemini synthesis.
        </p>

        {onOpenUploader && (
          <Button
            onClick={onOpenUploader}
            className="bg-primary text-primary-foreground shadow-md shadow-primary/20 text-xs"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            <span>Ingest First Document</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title, author, or keyword..."
            className="pl-10 pr-9 bg-card/70 border-border/70"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span>Corpus Filter:</span>
          <span className="font-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg border border-primary/20">
            {filteredDocs.length} of {documents.length}
          </span>
        </div>
      </div>

      {/* Document Items List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredDocs.map((doc) => {
          const themes = Array.isArray(doc.key_themes) ? doc.key_themes : [];
          const formattedDate = new Date(doc.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });

          return (
            <Card
              key={doc.id}
              className="group p-5 hover:border-primary/40 hover:shadow-md transition-all duration-200 bg-card/80"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Title & Metadata */}
                  <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                    <Link
                      to={`/workspace/${workspaceId}/document/${doc.id}`}
                      className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center"
                    >
                      <span>{doc.title}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </Link>

                    {doc.author_or_source && (
                      <span className="text-[11px] px-2 py-0.5 rounded-lg bg-muted text-muted-foreground font-mono border border-border/80">
                        {doc.author_or_source}
                      </span>
                    )}
                  </div>

                  {/* AI Summary Preview */}
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {doc.summary || (doc.content ? doc.content.slice(0, 160) + '...' : 'No summary generated.')}
                    </p>
                  </div>

                  {/* Themes / Tags */}
                  {themes.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1.5 mb-2.5">
                      <Tag className="w-3 h-3 text-muted-foreground mr-1" />
                      {themes.slice(0, 4).map((theme, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-mono font-medium"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Document Meta Stats */}
                  <div className="flex items-center space-x-4 text-[11px] text-muted-foreground pt-1">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1 opacity-70" />
                      {formattedDate}
                    </span>
                    <span>{doc.content?.length || 0} characters</span>
                    <span>~{Math.round((doc.content?.split(/\s+/).length || 0))} words</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1 shrink-0">
                  <Link
                    to={`/workspace/${workspaceId}/document/${doc.id}`}
                    title="Inspect Document Insights"
                  >
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(doc.id, doc.title)}
                    disabled={deletingId === doc.id}
                    title="Delete Document"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
