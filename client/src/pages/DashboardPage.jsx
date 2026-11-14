import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import WorkspaceCard from '../components/WorkspaceCard';
import ThemeCustomizer from '../components/ThemeCustomizer';
import { WorkspaceSchema } from '../schemas';
import { api } from '../lib/api';
import {
  FolderGit2,
  Plus,
  Search,
  Files,
  MessageSquareCode,
  Layers,
  Sparkles,
  X,
  AlertCircle,
  Loader2,
  GraduationCap,
  TrendingUp,
  Scale,
  Building2,
  Bookmark,
  RotateCcw,
  Palette
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../components/ui/dialog';

const domainFilterList = [
  { id: 'All', label: 'All Domains', icon: Layers },
  { id: 'Academic', label: 'Academic', icon: GraduationCap },
  { id: 'Market', label: 'Market', icon: TrendingUp },
  { id: 'Legal', label: 'Legal', icon: Scale },
  { id: 'Corporate', label: 'Corporate', icon: Building2 },
  { id: 'Other', label: 'Other', icon: Bookmark },
];

export default function DashboardPage() {
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Form fields
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('Academic');
  const [description, setDescription] = useState('');

  const loadWorkspaces = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.listWorkspaces();
      setWorkspaces(res.workspaces || []);
    } catch (err) {
      console.error('Failed to list workspaces:', err);
      setError(err.message || 'Could not load workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    setModalError(null);
    setFieldErrors({});

    const validation = WorkspaceSchema.safeParse({
      name,
      domain,
      description
    });

    if (!validation.success) {
      setFieldErrors(validation.error.flatten().fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createWorkspace({
        name,
        domain,
        description
      });

      if (res.workspace) {
        setWorkspaces((prev) => [res.workspace, ...prev]);
        setShowCreateModal(false);
        setName('');
        setDomain('Academic');
        setDescription('');
      }
    } catch (err) {
      console.error('Create workspace error:', err);
      setModalError(err.message || 'Failed to create workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWorkspace = async (id) => {
    try {
      await api.deleteWorkspace(id);
      setWorkspaces((prev) => prev.filter((ws) => ws.id !== id));
    } catch (err) {
      alert('Failed to delete workspace: ' + err.message);
    }
  };

  // Filtered list
  const filteredWorkspaces = workspaces.filter((ws) => {
    const matchesSearch =
      ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ws.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = selectedDomain === 'All' || ws.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  // Calculate totals
  const totalDocs = workspaces.reduce((acc, ws) => acc + (ws.document_count || 0), 0);
  const totalQueries = workspaces.reduce((acc, ws) => acc + (ws.query_count || 0), 0);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDomain('All');
  };

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* ==========================================================================
            Hero-Style Header & Aggregate Statistics
           ========================================================================== */}
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card/95 via-card/80 to-background/90 p-6 sm:p-8 lg:p-10 shadow-sm backdrop-blur-2xl border-white/5">
          {/* Subtle Ambient Radial Mesh Glows */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none transition-all duration-700" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-border/40">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-mono font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ENTERPRISE KNOWLEDGE HUB</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight font-heading">
                Research Workspaces
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                Aggregated, isolated corpora for literature reviews, competitor intelligence, and legal claims with 100% cited Gemini synthesis.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ThemeCustomizer
                trigger={
                  <Button variant="outline" size="lg" className="border-border/70 hover:border-primary/40 text-xs transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 shadow-xs">
                    <Palette className="w-4 h-4 mr-1.5 text-primary" />
                    <span>Personalize Theme</span>
                  </Button>
                }
              />

              <Button
                size="lg"
                onClick={() => setShowCreateModal(true)}
                className="bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 font-semibold text-xs sm:text-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>New Workspace</span>
              </Button>
            </div>
          </div>

          {/* Aggregate Stat Cards Grid */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            {/* Stat 1: Workspaces */}
            <div className="group p-5 rounded-3xl bg-card/70 border border-border/50 hover:border-primary/40 shadow-xs hover:shadow-md transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 flex items-center justify-between cursor-pointer">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Total Workspaces</span>
                  <Badge variant="subtle" className="text-[10px] py-0 px-1.5 font-mono">
                    Active
                  </Badge>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
                  {workspaces.length}
                </div>
                <span className="text-[11px] text-muted-foreground">Isolated project domains</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm shadow-primary/10 group-hover:scale-110 transition-transform duration-300">
                <FolderGit2 className="w-6 h-6" />
              </div>
            </div>

            {/* Stat 2: Documents */}
            <div className="group p-5 rounded-3xl bg-card/70 border border-border/50 hover:border-primary/40 shadow-xs hover:shadow-md transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 flex items-center justify-between cursor-pointer">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Documents Ingested</span>
                  <Badge variant="subtle" className="text-[10px] py-0 px-1.5 font-mono">
                    Corpus
                  </Badge>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
                  {totalDocs}
                </div>
                <span className="text-[11px] text-muted-foreground">Indexed for vector retrieval</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Files className="w-6 h-6" />
              </div>
            </div>

            {/* Stat 3: Queries */}
            <div className="group p-5 rounded-3xl bg-card/70 border border-border/50 hover:border-primary/40 shadow-xs hover:shadow-md transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 flex items-center justify-between cursor-pointer">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Synthesized Queries</span>
                  <Badge variant="subtle" className="text-[10px] py-0 px-1.5 font-mono">
                    100% Cited
                  </Badge>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
                  {totalQueries}
                </div>
                <span className="text-[11px] text-muted-foreground">Evidence-backed answers</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 dark:text-cyan-400 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <MessageSquareCode className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================================================
            Search & Filter Toolbar
           ========================================================================== */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workspaces by name or keywords..."
              className="pl-10 pr-9 bg-card/70 border-border/70 rounded-2xl"
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

          {/* Domain Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {domainFilterList.map((d) => {
              const Icon = d.icon;
              const isActive = selectedDomain === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDomain(d.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all duration-300 ease-out shrink-0 cursor-pointer ${isActive
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25 scale-[1.02]'
                      : 'bg-card text-muted-foreground hover:text-foreground border border-border/60 hover:bg-accent/50'
                    }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  <span>{d.label}</span>
                </button>
              );
            })}

            {(searchQuery || selectedDomain !== 'All') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0 rounded-xl"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* ==========================================================================
            Workspaces Grid / Empty State / Loading State
           ========================================================================== */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-muted-foreground space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-mono">Synchronizing research workspaces...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-3xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Error Loading Workspaces</strong>
              <p className="text-xs mt-1 text-muted-foreground">{error}</p>
              <Button
                variant="destructive"
                size="sm"
                onClick={loadWorkspaces}
                className="mt-3 text-xs rounded-xl"
              >
                Retry Connection
              </Button>
            </div>
          </div>
        ) : filteredWorkspaces.length === 0 ? (
          /* Sleek Enterprise Empty State */
          <div className="py-16 sm:py-20 text-center bg-card/50 border border-border/60 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
            {/* Layered concentric glowing rings */}
            <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-3xl bg-primary/10 border border-primary/20 animate-ping opacity-25" />
              <div className="absolute -inset-2 rounded-3xl bg-primary/5 blur-md" />
              <div className="relative w-16 h-16 rounded-2xl bg-card border border-border/80 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                <FolderGit2 className="w-8 h-8" />
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 tracking-tight font-heading">
              {searchQuery || selectedDomain !== 'All'
                ? 'No matching research domains found'
                : 'No workspaces created yet'}
            </h3>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed font-sans">
              {searchQuery || selectedDomain !== 'All'
                ? 'Try adjusting your search terms or selecting a different research domain filter.'
                : 'Initialize an isolated research corpus to aggregate papers, corporate docs, or legal filings for cited Gemini synthesis.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {searchQuery || selectedDomain !== 'All' ? (
                <Button variant="outline" size="sm" onClick={clearFilters} className="rounded-xl">
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Clear Search & Filters
                </Button>
              ) : null}

              <Button
                size="default"
                onClick={() => setShowCreateModal(true)}
                className="bg-primary text-primary-foreground shadow-md shadow-primary/25 rounded-xl font-semibold"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Create First Workspace</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkspaces.map((ws) => (
              <WorkspaceCard
                key={ws.id}
                workspace={ws}
                onDelete={handleDeleteWorkspace}
              />
            ))}
          </div>
        )}
      </div>

      {/* ==========================================================================
          Workspace Creation Modal (Shadcn Dialog)
         ========================================================================== */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg p-0 overflow-hidden rounded-3xl bg-card/95 backdrop-blur-2xl border-border/70">
          <div className="p-6 pb-4 border-b border-border/50 bg-muted/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm shadow-primary/10">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="font-heading text-lg">Create Research Workspace</DialogTitle>
                <DialogDescription>
                  Establish an isolated knowledge domain with dedicated vector storage.
                </DialogDescription>
              </div>
            </div>
          </div>

          {modalError && (
            <div className="mx-6 mt-4 p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <form onSubmit={handleCreateWorkspace} className="p-6 space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Workspace Name <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Neuromorphic Computing & Synaptic Edge AI"
                className={`rounded-2xl ${fieldErrors.name ? 'border-destructive' : ''}`}
                required
              />
              {fieldErrors.name && (
                <p className="text-[11px] text-destructive mt-1">{fieldErrors.name[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Research Domain <span className="text-destructive">*</span>
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full h-10 px-3.5 bg-background border border-input rounded-2xl text-xs sm:text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all cursor-pointer font-sans"
              >
                <option value="Academic">Academic & Scientific Research</option>
                <option value="Market">Market Intelligence & Competitor Intel</option>
                <option value="Legal">Legal & Regulatory Compliance</option>
                <option value="Corporate">Corporate Knowledge & Strategy</option>
                <option value="Other">Other / General Research</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Description & Research Objectives
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summarize the core investigative objectives and target data sources..."
                className="w-full p-3.5 bg-background border border-input rounded-2xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all resize-none font-sans"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                disabled={isSubmitting}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !name}
                className="bg-primary text-primary-foreground shadow-md shadow-primary/25 rounded-xl text-xs font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Workspace</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
