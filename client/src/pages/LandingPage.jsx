import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import ThemeCustomizer from '../components/ThemeCustomizer';
import { 
  Sparkles, 
  ArrowRight, 
  Plus, 
  Database, 
  BrainCircuit, 
  Atom, 
  Wind, 
  Layers,
  GraduationCap,
  TrendingUp,
  Scale,
  Building2,
  Lock,
  ChevronRight,
  ShieldCheck,
  Zap,
  FolderGit2,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { api } from '../lib/api';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Settings & Workspace modal states
  const [themeCustomizerOpen, setThemeCustomizerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  // Form states for quick workspace initialization
  const [wsName, setWsName] = useState('');
  const [wsDomain, setWsDomain] = useState('Academic');
  const [wsDesc, setWsDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLaunch = () => {
    if (user) {
      setCreateModalOpen(true);
    } else {
      navigate('/login');
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!wsName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.createWorkspace({
        name: wsName,
        domain: wsDomain,
        description: wsDesc,
      });
      if (res?.workspace) {
        navigate(`/workspace/${res.workspace.id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Failed to create workspace:', err);
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tickerBrands = [
    {
      name: 'Supabase PostgreSQL',
      icon: Database,
      accent: 'text-emerald-400',
    },
    {
      name: 'Gemini 2.5 Flash',
      icon: BrainCircuit,
      accent: 'text-violet-400',
    },
    {
      name: 'React 19',
      icon: Atom,
      accent: 'text-cyan-400',
    },
    {
      name: 'Tailwind CSS',
      icon: Wind,
      accent: 'text-sky-400',
    },
    {
      name: 'Shadcn UI',
      icon: Layers,
      accent: 'text-indigo-400',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden select-none font-sans">
      {/* ==========================================================================
          [GLOBAL SETTINGS & ENVIRONMENT]: Background Video & Layered Text Protection
         ========================================================================== */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Abstract data nodes fallback canvas/mesh behind video */}
        <div className="absolute inset-0 bg-[#020617] z-0">
          <div className="absolute top-1/4 right-[5%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-1/4 right-[20%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[160px]" />
        </div>

        {/* Background Video:
            Anchored strictly to RIGHT SIDE (transform-origin: right center)
            Scale: 1.3 (130%)
            100% opacity
            object-fit: cover, object-position: right center
            filter: brightness(1.0) contrast(1.1)
        */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute right-0 top-0 w-full lg:w-[70%] h-full object-cover z-0 pointer-events-none opacity-100"
          style={{
            transformOrigin: 'right center',
            transform: 'scale(1.3)',
            objectPosition: 'right center',
            filter: 'brightness(1.0) contrast(1.1)',
          }}
        >
          <source
            src="https://cdn.sceneai.art/Hero%20Section%20Video/9ad5cc99-2fa4-4154-bcc2-5c9ec152778e.mp4"
            type="video/mp4"
          />
        </video>

        {/* Deep left-aligned black-to-transparent text protection overlay:
            linear-gradient(to right, rgba(2,6,23,1) 0%, rgba(2,6,23,0.9) 40%, rgba(2,6,23,0) 90%)
        */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(to right, rgba(2,6,23,1) 0%, rgba(2,6,23,0.9) 40%, rgba(2,6,23,0) 90%)',
          }}
        />

        {/* Faint subtle grid texture */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] z-10 opacity-60" />
      </div>

      {/* Main Container maintaining strictly 70px side padding on desktop */}
      <div className="flex-1 flex flex-col justify-between min-h-screen px-6 sm:px-10 lg:px-[70px] relative z-20">
        {/* ==========================================================================
            [LAYER 1: TOP NAVIGATION]
           ========================================================================== */}
        <header className="h-24 flex items-center justify-between z-30 pt-2">
          {/* Logo (Left): Square frame with glowing brand-600 (violet) Sparkles icon. Text "RESEARCH MIND AI" in bold uppercase, 11px size, 0.5em tracking */}
          <Link to="/" className="flex items-center group">
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/40 shadow-[0_0_20px_rgba(124,58,237,0.5)] flex items-center justify-center text-violet-400 group-hover:scale-105 transition-all duration-300">
              <Sparkles className="w-5 h-5 text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.5em] text-white ml-3 font-heading select-none">
              RESEARCH MIND AI
            </span>
          </Link>

          {/* Links (Center-Right): Sentence case, font-medium, 0.85rem size. Slate-400 color, hovering to solid white. ml-auto mr-12 */}
          <nav className="hidden md:flex items-center space-x-8 ml-auto mr-12 text-[0.85rem] font-medium text-slate-400">
            <Link
              to="/dashboard"
              className="hover:text-white transition-colors duration-200"
            >
              Workspaces
            </Link>
            <Link
              to="/dashboard"
              className="hover:text-white transition-colors duration-200"
            >
              Documents
            </Link>
            <Link
              to="/dashboard"
              className="hover:text-white transition-colors duration-200"
            >
              Syntheses
            </Link>
            <button
              onClick={() => setThemeCustomizerOpen(true)}
              className="hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Settings
            </button>
            <button
              onClick={() => setSupportModalOpen(true)}
              className="hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Support
            </button>
          </nav>

          {/* Play Button (Far Right): Circular frosted glass button (52px diameter). 12px backdrop-blur. 1px white border at 20% opacity. Centered white "Plus" (+) icon to signify New Workspace */}
          <button
            onClick={handleLaunch}
            title="Create New Workspace"
            className="w-[52px] h-[52px] rounded-full bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-[12px] border border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex items-center justify-center text-white transition-all duration-300 ease-out hover:scale-110 active:scale-95 cursor-pointer shrink-0 group"
          >
            <Plus className="w-5 h-5 text-white stroke-[2.5] transition-transform duration-300 group-hover:rotate-90" />
          </button>
        </header>

        {/* ==========================================================================
            [LAYER 2: MIDDLE HERO ELEMENTS]
            Shift entire Hero block upward using translate-y-[-10%]
           ========================================================================== */}
        <div className="flex-1 flex flex-col justify-center items-start text-left max-w-3xl transform -translate-y-[10%] my-auto pt-8 pb-4">
          {/* Element 1 (Tag): "ENTERPRISE KNOWLEDGE HUB" pill label with a glowing border. Font: 9px bold uppercase. Tracking: 0.4em. Spacing: 12px vertical gap below */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-violet-500/40 bg-violet-500/10 shadow-[0_0_15px_rgba(124,58,237,0.35)] text-violet-300 text-[9px] font-bold uppercase tracking-[0.4em] mb-[12px] backdrop-blur-md">
            ENTERPRISE KNOWLEDGE HUB
          </div>

          {/* Element 2 (Heading): "Research Workspaces". Font: 72px bold sans-serif (tracking-tight). Line-height: 1.0. Color: Pure white. Spacing: 20px vertical gap below */}
          <h1 className="text-[44px] sm:text-[58px] lg:text-[72px] font-bold tracking-tight leading-[1.0] text-white font-sans mb-[20px] select-none">
            Research Workspaces
          </h1>

          {/* Element 3 (Subheading): Regular weight text. Font: 16px size. Color: Slate-400 (60% white). Max-width area: strictly 480px. Spacing: 32px vertical gap below */}
          <p className="text-[16px] font-normal text-slate-400 max-w-[480px] leading-relaxed mb-[32px]">
            Aggregated, isolated corpora for literature reviews, competitor intelligence, and legal claims with 100% cited Gemini synthesis.
          </p>

          {/* Element 4 (Primary Button):
              Shape: Capsule/Pill shape (rounded-full). Padding: 14px vertical, 26.5px horizontal.
              Material: Frosted Glass base (rgba(124,58,237,0.15)) with 40px backdrop-blur and internal glow shadow.
              Text: "INITIALIZE WORKSPACE" - Bold uppercase 12px. STRICTLY REMOVE ALL TEXT SHADOWS.
              Orbital Border: 2.5px conic-gradient stroke (#4f46e5, #7c3aed, #06b6d4, #10b981, #4f46e5).
              Animation: 10x larger (1000%) rotating continuously over 6s.
              Interaction: Arrow or Zap nudges +5px on hover.
          */}
          <div className="relative inline-flex items-center justify-center rounded-full p-[2.5px] overflow-hidden group shadow-[0_0_30px_rgba(124,58,237,0.35)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(124,58,237,0.5)]">
            {/* 10x (1000%) Rotating Conic Gradient Orbital Border */}
            <div
              className="absolute inset-[-450%] w-[1000%] h-[1000%] animate-orbital-spin pointer-events-none"
              style={{
                background:
                  'conic-gradient(from 0deg, #4f46e5, #7c3aed, #06b6d4, #10b981, #4f46e5)',
              }}
            />

            {/* Inner Frosted Glass Capsule Button */}
            <button
              onClick={handleLaunch}
              className="relative z-10 rounded-full py-[14px] px-[26.5px] bg-[rgba(124,58,237,0.15)] hover:bg-[rgba(124,58,237,0.25)] backdrop-blur-[40px] shadow-[inset_0_0_20px_rgba(124,58,237,0.35)] flex items-center justify-center space-x-2.5 text-white text-[12px] font-bold uppercase [text-shadow:none] tracking-wider transition-all duration-300 cursor-pointer"
            >
              <span className="[text-shadow:none]">INITIALIZE WORKSPACE</span>
              <ArrowRight className="w-4 h-4 text-white transition-transform duration-300 group-hover:translate-x-[5px]" />
            </button>
          </div>
        </div>

        {/* ==========================================================================
            [LAYER 3: BOTTOM ELEMENTS]
            Pushed as far to the bottom as possible while maintaining 70px side padding
           ========================================================================== */}
        <div className="w-full pb-8 pt-4 mt-auto z-20">
          {/* Label: "SECURED ENTERPRISE INFRASTRUCTURE" centered. Font: 9px bold. Tracking: 0.6em. Opacity: 30%. Color: Slate-500 */}
          <div className="text-center mb-4">
            <span className="text-[9px] font-bold uppercase tracking-[0.6em] text-slate-500 opacity-30 select-none">
              SECURED ENTERPRISE INFRASTRUCTURE
            </span>
          </div>

          {/* Ticker: Infinite auto-scrolling row. Logos must be Grayscale at 55% opacity, hovering to full color. Icons: 16px height. Text: 11px size */}
          <div className="overflow-hidden w-full relative mask-linear-fade">
            <div className="flex items-center space-x-12 w-max animate-marquee">
              {/* Set 1 */}
              {tickerBrands.map((brand, idx) => {
                const Icon = brand.icon;
                return (
                  <div
                    key={`b1-${idx}`}
                    className="flex items-center space-x-2.5 grayscale opacity-55 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${brand.accent}`} />
                    <span className="text-[11px] font-mono font-medium tracking-wide text-slate-300">
                      {brand.name}
                    </span>
                  </div>
                );
              })}

              {/* Set 2 (for seamless loop) */}
              {tickerBrands.map((brand, idx) => {
                const Icon = brand.icon;
                return (
                  <div
                    key={`b2-${idx}`}
                    className="flex items-center space-x-2.5 grayscale opacity-55 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${brand.accent}`} />
                    <span className="text-[11px] font-mono font-medium tracking-wide text-slate-300">
                      {brand.name}
                    </span>
                  </div>
                );
              })}

              {/* Set 3 */}
              {tickerBrands.map((brand, idx) => {
                const Icon = brand.icon;
                return (
                  <div
                    key={`b3-${idx}`}
                    className="flex items-center space-x-2.5 grayscale opacity-55 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${brand.accent}`} />
                    <span className="text-[11px] font-mono font-medium tracking-wide text-slate-300">
                      {brand.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================================================
          Workspace Creation Modal (Triggered by Play Button / Initialize Button)
         ========================================================================== */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden rounded-3xl bg-slate-900/95 backdrop-blur-2xl border-white/10 text-white">
          <div className="p-6 pb-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400 shadow-sm shadow-violet-500/20">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="font-heading text-lg text-white">Initialize Research Workspace</DialogTitle>
                <DialogDescription className="text-slate-400 text-xs">
                  Create an isolated project corpus for cited Gemini synthesis.
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={handleCreateWorkspace} className="p-6 space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Workspace Name <span className="text-violet-400">*</span>
              </label>
              <Input
                type="text"
                value={wsName}
                onChange={(e) => setWsName(e.target.value)}
                placeholder="e.g. Neuromorphic Computing & Synaptic Edge AI"
                className="rounded-2xl bg-slate-950/80 border-white/10 text-white placeholder:text-slate-600"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Research Domain
              </label>
              <select
                value={wsDomain}
                onChange={(e) => setWsDomain(e.target.value)}
                className="w-full h-10 px-3.5 bg-slate-950/80 border border-white/10 rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all cursor-pointer"
              >
                <option value="Academic">Academic & Scientific Research</option>
                <option value="Market">Market Intelligence & Competitor Intel</option>
                <option value="Legal">Legal & Regulatory Compliance</option>
                <option value="Corporate">Corporate Knowledge & Strategy</option>
                <option value="Other">Other / General Research</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Description & Objectives
              </label>
              <textarea
                rows={3}
                value={wsDesc}
                onChange={(e) => setWsDesc(e.target.value)}
                placeholder="Summarize target data sources and investigative objectives..."
                className="w-full p-3.5 bg-slate-950/80 border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all resize-none"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-xl border-white/10 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !wsName.trim()}
                className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-lg shadow-violet-600/30 font-semibold"
              >
                {isSubmitting ? 'Initializing...' : 'Launch Workspace'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Theme Settings Customizer Dialog (Accessible via Settings Nav Link) */}
      <ThemeCustomizer
        open={themeCustomizerOpen}
        onOpenChange={setThemeCustomizerOpen}
      />

      {/* Support Information Dialog */}
      <Dialog open={supportModalOpen} onOpenChange={setSupportModalOpen}>
        <DialogContent className="max-w-md p-6 rounded-3xl bg-slate-900 border-white/10 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white font-heading">Enterprise Support & Docs</DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                24/7 dedicated research intelligence infrastructure
              </DialogDescription>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-6">
            Research Mind AI provides evidence-backed knowledge synthesis with automated citations. For technical inquiries, custom domain integrations, or API access:
          </p>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 text-xs font-mono text-violet-300 mb-6">
            support@researchmind.ai • enterprise SLA
          </div>
          <Button
            onClick={() => setSupportModalOpen(false)}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-xs"
          >
            Close Window
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
