import React, { useState } from 'react';
import { DocumentIngestSchema } from '../schemas';
import { api } from '../lib/api';
import { 
  FileUp, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Upload, 
  Hash, 
  UserCircle 
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function DocumentUploader({ workspaceId, onUploadSuccess, onCancel }) {
  const [mode, setMode] = useState('text'); // 'text' | 'file'
  const [title, setTitle] = useState('');
  const [authorOrSource, setAuthorOrSource] = useState('');
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusStep, setStatusStep] = useState('');
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // File drag & drop or selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    // Auto-fill title from filename if not yet entered
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setContent(text);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file. Please ensure it is a valid text, markdown, or json document.');
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validate with Zod
    const validation = DocumentIngestSchema.safeParse({
      workspaceId,
      title,
      content,
      author_or_source: authorOrSource
    });

    if (!validation.success) {
      setFieldErrors(validation.error.flatten().fieldErrors);
      return;
    }

    setIsSubmitting(true);
    setStatusStep('Analyzing document structure with Gemini 2.5 Flash...');

    try {
      // Simulate/Show stages for UI transparency
      const stageTimer = setTimeout(() => {
        setStatusStep('Extracting key themes & generating executive summary...');
      }, 1200);

      const res = await api.ingestDocument({
        workspaceId,
        title,
        content,
        author_or_source: authorOrSource
      });

      clearTimeout(stageTimer);
      setStatusStep('Document successfully indexed into workspace corpus!');

      // Reset form
      setTitle('');
      setAuthorOrSource('');
      setContent('');
      setFileName('');

      if (onUploadSuccess) {
        onUploadSuccess(res.document);
      }
    } catch (err) {
      console.error('Ingest error:', err);
      setError(err.message || 'Failed to ingest document');
    } finally {
      setIsSubmitting(false);
      setStatusStep('');
    }
  };

  const charCount = content.trim().length;
  const isContentValid = charCount >= 50;

  return (
    <Card className="p-6 border-border/80 shadow-xl bg-card/90">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border/60 mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm shrink-0">
            <FileUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Ingest Research Material</h3>
            <p className="text-xs text-muted-foreground">
              Upload papers, memos, or raw notes. Gemini will extract entities & summarize upon upload.
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/60 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              mode === 'text' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Raw Note / Text
          </button>
          <button
            type="button"
            onClick={() => setMode('file')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              mode === 'file' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            File Upload (.md, .txt)
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title & Author Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Document Title <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Market Dynamics in Generative Video"
              className={fieldErrors.title ? 'border-destructive' : ''}
            />
            {fieldErrors.title && (
              <p className="text-[11px] text-destructive mt-1">{fieldErrors.title[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Source / Author / Publication
            </label>
            <div className="relative">
              <Input
                type="text"
                value={authorOrSource}
                onChange={(e) => setAuthorOrSource(e.target.value)}
                placeholder="e.g. Gartner, DeepMind, IEEE (2026)"
                className="pr-10"
              />
              <UserCircle className="w-4 h-4 text-muted-foreground absolute right-3.5 top-3" />
            </div>
          </div>
        </div>

        {/* File Drag & Drop Zone (if file mode) */}
        {mode === 'file' && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Select Document File (.txt, .md, .json)
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border/80 hover:border-primary/60 rounded-2xl p-6 cursor-pointer bg-background/50 hover:bg-background/80 transition-all group">
              <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
              <span className="text-xs text-foreground font-medium">
                {fileName ? fileName : "Click to browse or drop document file here"}
              </span>
              <span className="text-[10px] text-muted-foreground mt-1">
                Supports Plaintext, Markdown, and JSON documents
              </span>
              <input
                type="file"
                accept=".txt,.md,.markdown,.json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Document Content Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Document Text Content <span className="text-destructive">*</span>
            </label>
            <span className={`text-[11px] font-mono ${isContentValid ? 'text-muted-foreground' : 'text-amber-500'}`}>
              {charCount} / min 50 characters
            </span>
          </div>
          <textarea
            rows={mode === 'file' && content ? 5 : 8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste raw research content, academic paper excerpts, meeting transcripts, or market observations here..."
            className={`w-full p-3.5 bg-background border rounded-xl text-xs text-foreground placeholder:text-muted-foreground font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all leading-relaxed resize-none ${
              fieldErrors.content ? 'border-destructive' : 'border-input'
            }`}
          />
          {fieldErrors.content && (
            <p className="text-[11px] text-destructive mt-1">{fieldErrors.content[0]}</p>
          )}
        </div>

        {/* Status indicator during AI processing */}
        {isSubmitting && (
          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs flex items-center space-x-3 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-mono">{statusStep}</span>
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !title || !isContentValid}
            className="bg-primary text-primary-foreground shadow-md shadow-primary/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                <span>Ingesting & Summarizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-1.5" />
                <span>Ingest & Generate AI Summary</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
