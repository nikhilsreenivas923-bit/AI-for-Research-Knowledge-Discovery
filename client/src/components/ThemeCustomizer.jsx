import React, { useState } from 'react';
import { 
  Palette, 
  Sun, 
  Moon, 
  Laptop, 
  Check, 
  Sparkles, 
  Sliders, 
  Eye
} from 'lucide-react';
import { useTheme, COLOR_PALETTES, RADIUS_OPTIONS } from '../store/ThemeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export default function ThemeCustomizer({ open, onOpenChange, trigger }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { mode, resolvedMode, color, radius, setMode, setColor, setRadius } = useTheme();

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

  const modeOptions = [
    { id: 'light', label: 'Light', icon: Sun, desc: 'Clean, luminous' },
    { id: 'dark', label: 'Dark', icon: Moon, desc: 'Obsidian, low strain' },
    { id: 'system', label: 'System', icon: Laptop, desc: 'Follows OS preference' },
  ];

  return (
    <>
      {trigger ? (
        <span onClick={() => setIsOpen(true)} className="inline-flex cursor-pointer">
          {trigger}
        </span>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 border-border/70 hover:border-primary/40 text-xs transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 shadow-xs"
          title="Customize theme and accent color"
        >
          <Palette className="w-3.5 h-3.5 text-primary" />
          <span className="hidden sm:inline font-semibold">Theme</span>
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border border-border/70 shadow-2xl bg-card/95 backdrop-blur-2xl rounded-3xl">
          {/* Header */}
          <div className="p-6 pb-4 border-b border-border/50 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm shadow-primary/10">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold tracking-tight">Theme & Accent Customizer</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Select your workspace appearance mode, primary brand color, and corner curvature.
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* 1. Appearance Mode */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-mono">
                  <Sun className="w-3.5 h-3.5" />
                  Appearance Mode
                </label>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Current: <strong className="text-primary capitalize">{mode}</strong> {mode === 'system' && `(${resolvedMode})`}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {modeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = mode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setMode(opt.id)}
                      className={`relative flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-300 ease-out text-center cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20 font-bold scale-[1.02]'
                          : 'border-border/60 bg-card hover:bg-accent/50 text-muted-foreground hover:text-foreground hover:scale-[1.01]'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                      <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-xs font-semibold">{opt.label}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5 opacity-80">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Color Palettes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  Brand Color Palette
                </label>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Active: <strong className="text-primary capitalize">{color}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {COLOR_PALETTES.map((palette) => {
                  const isSelected = color === palette.id;
                  return (
                    <button
                      key={palette.id}
                      onClick={() => setColor(palette.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all duration-300 ease-out cursor-pointer hover:scale-[1.02] active:scale-95 ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm shadow-primary/20 ring-1 ring-primary'
                          : 'border-border/60 bg-card hover:bg-accent/40 text-foreground'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full shrink-0 shadow-sm border border-black/10 dark:border-white/20 flex items-center justify-center text-white"
                        style={{ backgroundColor: palette.colorHex }}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">{palette.name.split(' ')[0]}</div>
                        <div className="text-[10px] text-muted-foreground font-mono truncate">{palette.id}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Radius Options */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-mono">
                  <Sliders className="w-3.5 h-3.5" />
                  Corner Curvature
                </label>
                <span className="text-[11px] font-mono text-muted-foreground capitalize">
                  {radius === 'sm' ? '8px' : radius === 'md' ? '12px' : '16px'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {RADIUS_OPTIONS.map((r) => {
                  const isSelected = radius === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setRadius(r.id)}
                      className={`p-2.5 rounded-xl border text-xs text-center transition-all duration-300 ease-out cursor-pointer hover:scale-[1.02] active:scale-95 ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                          : 'border-border/60 bg-card hover:bg-accent/40 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Live UI Component Preview */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium">
                  <Eye className="w-3.5 h-3.5 text-primary" />
                  Instant Live Theme Preview
                </span>
                <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 font-semibold">
                  CSS Reactive
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-bold text-foreground">Deep Synthesized Intelligence</span>
                  </div>
                  <Badge variant="subtle" className="text-[10px] font-mono">100% CITED</Badge>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Synthesizing empirical findings across 24 whitepapers with strict evidence traceability.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button size="sm" variant="default" className="shadow-sm shadow-primary/20">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Primary Action
                  </Button>
                  <Button size="sm" variant="outline">
                    Outline Action
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border/60 bg-muted/20 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              Changes apply instantly and persist to local storage.
            </span>
            <Button size="sm" onClick={() => setIsOpen(false)} className="px-5 font-semibold">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
