import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderGit2, 
  Files, 
  MessageSquareCode, 
  Calendar, 
  Trash2, 
  ArrowRight,
  GraduationCap,
  TrendingUp,
  Scale,
  Building2,
  Bookmark,
  Sparkles
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const domainConfig = {
  Academic: {
    badgeVariant: 'academic',
    icon: GraduationCap,
    glowBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 shadow-purple-500/10',
  },
  Market: {
    badgeVariant: 'market',
    icon: TrendingUp,
    glowBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-emerald-500/10',
  },
  Legal: {
    badgeVariant: 'legal',
    icon: Scale,
    glowBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shadow-amber-500/10',
  },
  Corporate: {
    badgeVariant: 'corporate',
    icon: Building2,
    glowBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-blue-500/10',
  },
  Other: {
    badgeVariant: 'secondary',
    icon: Bookmark,
    glowBg: 'bg-muted text-muted-foreground border-border/80',
  }
};

export default function WorkspaceCard({ workspace, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const domainInfo = domainConfig[workspace.domain] || domainConfig.Other;
  const DomainIcon = domainInfo.icon;

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete workspace "${workspace.name}"? All associated documents and synthesis queries will be permanently removed.`)) {
      setIsDeleting(true);
      try {
        await onDelete(workspace.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formattedDate = new Date(workspace.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Card className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/90 hover:border-primary/50 shadow-xs hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 ease-out hover:scale-[1.02] flex flex-col justify-between">
      {/* Decorative top accent glow line on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-6 pb-4">
        {/* Top Header: Domain Badge + Distinct Icon + Delete */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-2xl border flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110 ${domainInfo.glowBg}`}>
              <DomainIcon className="w-4 h-4" />
            </div>
            <Badge variant={domainInfo.badgeVariant} className="font-semibold tracking-wide">
              {workspace.domain}
            </Badge>
          </div>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete workspace"
            className="p-1.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <Link to={`/workspace/${workspace.id}`} className="block group/link">
          <h3 className="text-base font-bold text-foreground group-hover/link:text-primary transition-colors line-clamp-1 mb-2 tracking-tight font-heading">
            {workspace.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[36px] leading-relaxed mb-4 font-sans">
          {workspace.description || 'Dedicated research domain with corpus indexing, knowledge extraction, and cited synthesis.'}
        </p>
      </div>

      {/* Footer Stats & Quick Navigation */}
      <div className="p-6 pt-0">
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-muted/40 border border-border/50 mb-4 text-xs font-mono">
          <div className="flex items-center text-muted-foreground">
            <div className="w-6 h-6 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mr-2 text-primary shadow-xs">
              <Files className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">
              <strong className="text-foreground font-semibold">{workspace.document_count || 0}</strong> Docs
            </span>
          </div>

          <div className="flex items-center text-muted-foreground">
            <div className="w-6 h-6 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mr-2 text-primary shadow-xs">
              <MessageSquareCode className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">
              <strong className="text-foreground font-semibold">{workspace.query_count || 0}</strong> Queries
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs">
          <span className="flex items-center text-muted-foreground text-[11px] font-mono">
            <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
            {formattedDate}
          </span>

          <div className="flex items-center space-x-2">
            <Link to={`/workspace/${workspace.id}/ask`}>
              <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px] rounded-xl border-border/70 hover:border-primary/40 hover:text-primary transition-all duration-300 ease-out hover:scale-[1.05] active:scale-95 shadow-xs">
                <Sparkles className="w-3 h-3 mr-1 text-primary" />
                Ask AI
              </Button>
            </Link>
            <Link to={`/workspace/${workspace.id}`}>
              <Button size="sm" className="h-7 px-2.5 text-[11px] rounded-xl group/btn shadow-xs shadow-primary/20 transition-all duration-300 ease-out hover:scale-[1.05] active:scale-95">
                <span>Open</span>
                <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover/btn:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
