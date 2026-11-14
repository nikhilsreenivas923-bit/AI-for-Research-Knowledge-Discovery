import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../store/ThemeContext';
import { 
  LogOut, 
  ChevronRight, 
  Database, 
  BrainCircuit, 
  FolderGit2,
  Palette,
  Sun,
  Moon
} from 'lucide-react';
import ThemeCustomizer from './ThemeCustomizer';
import { Button } from './ui/button';

export default function Navbar({ workspaceName }) {
  const { user, signOut, isSupabaseActive } = useAuth();
  const { resolvedMode, toggleMode, color } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="h-16 border-b border-border/40 border-b-white/5 bg-slate-950/60 dark:bg-slate-950/60 bg-white/75 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors duration-300 shadow-xs">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground min-w-0">
        <Link 
          to="/dashboard" 
          className="flex items-center text-foreground hover:text-primary transition-colors font-semibold shrink-0"
        >
          <FolderGit2 className="w-4 h-4 mr-1.5 text-primary" />
          <span className="font-heading">Workspaces</span>
        </Link>

        {workspaceName && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <span className="text-foreground font-bold truncate max-w-[160px] sm:max-w-xs md:max-w-md font-heading">
              {workspaceName}
            </span>
          </>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Connection status pills */}
        <div className="hidden lg:flex items-center space-x-2">
          <span 
            title={isSupabaseActive ? "Connected to Supabase PostgreSQL" : "Local Development Mode"}
            className="flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono bg-muted/40 border border-border/50 text-muted-foreground shadow-xs"
          >
            <span className={`w-2 h-2 rounded-full mr-1.5 ${isSupabaseActive ? 'bg-emerald-500 animate-pulse shadow-xs shadow-emerald-500/50' : 'bg-amber-500'}`} />
            {isSupabaseActive ? 'Supabase DB' : 'Local Dev DB'}
          </span>

          <span className="flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono bg-primary/10 border border-primary/20 text-primary shadow-xs shadow-primary/10">
            <BrainCircuit className="w-3 h-3 mr-1.5" />
            Gemini 2.5 Flash
          </span>
        </div>

        {/* Quick Theme Toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleMode}
          title={`Switch to ${resolvedMode === 'dark' ? 'Light' : 'Dark'} mode`}
          className="text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-xl transition-all duration-300 ease-out hover:scale-[1.05] active:scale-95"
        >
          {resolvedMode === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-primary" />
          )}
        </Button>

        {/* Theme & Palette Customizer Modal Trigger */}
        <ThemeCustomizer
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs rounded-xl border-border/60 hover:border-primary/40 flex items-center gap-1.5 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 shadow-xs"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm shadow-primary/40 animate-pulse" />
              <Palette className="w-3.5 h-3.5 text-primary hidden sm:inline" />
              <span className="hidden md:inline font-semibold capitalize">{color}</span>
            </Button>
          }
        />

        {/* User profile dropdown / logout */}
        {user ? (
          <div className="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-3 border-l border-border/50">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-primary-foreground font-bold text-xs shadow-sm shadow-primary/20">
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs text-foreground font-medium hidden xl:inline-block max-w-[120px] truncate">
                {user.email}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              title="Sign Out"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-300 ease-out hover:scale-[1.05] active:scale-95"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Link to="/login">
            <Button size="sm" className="h-8 text-xs font-semibold rounded-xl">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
