import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import ThemeCustomizer from './ThemeCustomizer';
import { 
  Sparkles, 
  FolderGit2, 
  Files, 
  MessageSquareCode, 
  Compass, 
  GraduationCap, 
  TrendingUp, 
  Scale, 
  Building2, 
  Palette, 
  ShieldCheck, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export default function Layout({ children, workspace }) {
  const location = useLocation();
  const { id: workspaceId } = useParams();
  const activeId = workspace?.id || workspaceId;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const researchDomains = [
    {
      name: 'Academic',
      desc: 'Literature Reviews',
      icon: GraduationCap,
      color: 'bg-purple-500 shadow-purple-500/30',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      name: 'Market',
      desc: 'Competitor Intel',
      icon: TrendingUp,
      color: 'bg-emerald-500 shadow-emerald-500/30',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      name: 'Legal',
      desc: 'Case Law & Claims',
      icon: Scale,
      color: 'bg-amber-500 shadow-amber-500/30',
      textColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      name: 'Corporate',
      desc: 'Knowledge Repos',
      icon: Building2,
      color: 'bg-blue-500 shadow-blue-500/30',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-border/40 border-b-white/5">
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary via-indigo-600 to-cyan-400 flex items-center justify-center text-primary-foreground shadow-md shadow-primary/25 group-hover:scale-105 transition-all duration-300 ease-out">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight text-foreground flex items-center gap-1.5 font-heading">
              Research Mind <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono border border-primary/20 font-bold">AI</span>
            </div>
            <div className="text-[9px] text-muted-foreground font-mono tracking-widest uppercase font-semibold">
              Enterprise Intelligence
            </div>
          </div>
        </Link>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1.5 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
        {/* Core Navigation */}
        <div>
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5 font-mono">
            Workspace Core
          </div>
          <nav className="space-y-1">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center px-3 py-2.5 text-xs rounded-2xl transition-all duration-300 ease-out ${
                location.pathname === '/dashboard'
                  ? 'bg-primary/10 text-primary font-bold shadow-sm shadow-primary/10 border border-primary/25 scale-[1.01]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:scale-[1.01]'
              }`}
            >
              <FolderGit2 className={`w-4 h-4 mr-3 transition-colors ${location.pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="font-semibold">All Workspaces</span>
            </Link>
          </nav>
        </div>

        {/* Active Workspace Sub-navigation (if inside workspace) */}
        {activeId && (
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 border-white/5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
              <span>Active Research</span>
              {workspace?.domain && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-background border border-border/70 text-foreground font-mono font-semibold">
                  {workspace.domain}
                </span>
              )}
            </div>

            <div className="text-xs font-bold text-foreground truncate px-1 font-heading">
              {workspace?.name || 'Current Workspace'}
            </div>

            <nav className="space-y-1">
              <Link
                to={`/workspace/${activeId}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 text-xs font-medium rounded-xl transition-all duration-300 ease-out ${
                  location.pathname === `/workspace/${activeId}`
                    ? 'bg-primary/10 text-primary font-bold shadow-sm shadow-primary/10 border border-primary/20 scale-[1.01]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <Files className="w-4 h-4 mr-2.5 text-primary" />
                <span>Corpus & Documents</span>
              </Link>

              <Link
                to={`/workspace/${activeId}/ask`}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 text-xs font-medium rounded-xl transition-all duration-300 ease-out ${
                  location.pathname === `/workspace/${activeId}/ask`
                    ? 'bg-primary/10 text-primary font-bold shadow-sm shadow-primary/10 border border-primary/20 scale-[1.01]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <MessageSquareCode className="w-4 h-4 mr-2.5 text-primary" />
                <span>Ask AI Synthesis</span>
              </Link>
            </nav>
          </div>
        )}

        {/* Research Domains Section */}
        <div>
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3 font-mono flex items-center justify-between">
            <span>Research Domains</span>
            <Compass className="w-3.5 h-3.5 text-muted-foreground" />
          </div>

          <div className="space-y-1.5 px-1">
            {researchDomains.map((dom) => {
              const Icon = dom.icon;
              return (
                <div
                  key={dom.name}
                  className="flex items-center justify-between p-2.5 rounded-2xl border border-transparent hover:border-border/50 hover:bg-accent/40 transition-all duration-300 ease-out text-xs cursor-pointer group"
                >
                  <div className="flex items-center min-w-0">
                    <span className={`w-2 h-2 rounded-full mr-2.5 shrink-0 ${dom.color} shadow-xs group-hover:scale-125 transition-transform duration-300`} />
                    <span className="font-semibold text-foreground truncate mr-2">{dom.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                    {dom.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar Footer: Strict Traceability & Theme Quick Customizer */}
      <div className="p-4 border-t border-border/40 border-t-white/5 space-y-3 bg-muted/20">
        <div className="p-3.5 rounded-2xl bg-card/80 border border-border/50 border-white/5 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Strict Traceability
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
              100% CITED
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-normal">
            Syntheses cite exact workspace pages to prevent hallucinations.
          </p>
        </div>

        {/* Theme Settings Trigger Button */}
        <ThemeCustomizer
          trigger={
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-semibold text-muted-foreground hover:text-foreground bg-accent/40 hover:bg-accent/70 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 border border-border/50 border-white/5 cursor-pointer">
              <Palette className="w-3.5 h-3.5 text-primary" />
              <span>Personalize Theme</span>
            </button>
          }
        />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-200 relative overflow-x-hidden font-sans">
      {/* Rich Ambient Mesh Background Gradients (Faint & Subtle) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[25%] -left-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-primary/4 dark:bg-primary/5 blur-[140px] transition-all duration-700" />
        <div className="absolute top-[35%] -right-[15%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full bg-indigo-500/3 dark:bg-indigo-500/4 blur-[150px]" />
        <div className="absolute -bottom-[20%] left-[25%] w-[55vw] h-[55vw] max-w-[750px] max-h-[750px] rounded-full bg-primary/3 dark:bg-primary/4 blur-[160px] transition-all duration-700" />
      </div>

      {/* Desktop Sidebar with Enhanced Frosted Glassmorphism */}
      <aside className="hidden lg:flex w-64 border-r border-border/40 border-r-white/5 bg-slate-950/60 dark:bg-slate-950/60 bg-white/70 backdrop-blur-xl flex-col shrink-0 sticky top-0 h-screen z-30 shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-slate-950/80 dark:bg-slate-950/80 bg-white/90 backdrop-blur-2xl border-r border-border/50 shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar workspaceName={workspace?.name} />
        
        {/* Mobile menu trigger button */}
        <div className="lg:hidden px-4 pt-3 pb-1 flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center gap-2 text-xs rounded-xl"
          >
            <Menu className="w-4 h-4" />
            <span>Navigation Menu</span>
          </Button>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
