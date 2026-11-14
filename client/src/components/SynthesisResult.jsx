import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { 
  Check, 
  Copy, 
  Bookmark, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

export default function SynthesisResult({ 
  workspaceId, 
  answer, 
  citations = [], 
  citationDetails = [],
  question,
  timestamp
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = timestamp 
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <Card className="rounded-2xl border-border/70 shadow-lg bg-card/95 overflow-hidden transition-all duration-300">
      {/* Answer Header Bar */}
      <div className="bg-muted/40 px-6 py-3.5 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-foreground tracking-wide uppercase">
            Synthesized Evidence
          </span>
          <Badge variant="subtle" className="text-[10px] py-0.5 px-2 font-mono flex items-center">
            <ShieldCheck className="w-3 h-3 mr-1 text-emerald-500" />
            Verified Citations
          </Badge>
        </div>

        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
          {formattedDate && <span className="font-mono text-[11px]">{formattedDate}</span>}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2.5 text-xs border-border/70 hover:border-primary/40"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                <span className="text-[11px] text-emerald-500 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                <span className="text-[11px]">Copy Markdown</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Answer Content */}
      <div className="p-6 md:p-8">
        <div className="prose-research max-w-none text-foreground/90">
          <ReactMarkdown>{answer}</ReactMarkdown>
        </div>

        {/* Citations & Evidence Traceability Drawer */}
        <div className="mt-8 pt-6 border-t border-border/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Bookmark className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Evidence Traceability ({citations.length} Sources Cited)
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              Click badge to view primary source
            </span>
          </div>

          {citationDetails && citationDetails.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {citationDetails.map((doc, idx) => (
                <Link
                  key={doc.id || idx}
                  to={`/workspace/${workspaceId}/document/${doc.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60 hover:border-primary/50 group transition-all"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {doc.title}
                      </h5>
                      {doc.author_or_source && (
                        <p className="text-[10px] text-muted-foreground truncate">{doc.author_or_source}</p>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {citations.map((c, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-mono font-medium"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
