import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ThemeCustomizer from '../components/ThemeCustomizer';
import LoginForm from '../components/LoginForm';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Sparkles, Palette } from 'lucide-react';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'signin';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden transition-colors duration-200">
      {/* Background ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-primary/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-indigo-500/5 blur-[100px] pointer-events-none rounded-full" />

      {/* Top right quick theme customizer */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeCustomizer
          trigger={
            <Button variant="outline" size="sm" className="border-border/70 text-xs shadow-xs">
              <Palette className="w-3.5 h-3.5 mr-1.5 text-primary" />
              <span>Theme</span>
            </Button>
          }
        />
      </div>

      {/* Brand Header */}
      <div className="mb-8 text-center relative z-10 animate-in fade-in duration-300">
        <Link to="/" className="inline-flex items-center space-x-2.5 group mb-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary via-indigo-600 to-cyan-400 flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-foreground">
            Research Mind <span className="text-primary font-mono text-sm px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">AI</span>
          </span>
        </Link>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
          Enterprise Knowledge Discovery & Synthesis
        </p>
      </div>

      {/* Auth Container Card */}
      <Card className="w-full max-w-md p-6 sm:p-8 relative z-10 shadow-2xl border-border/80 bg-card/90 backdrop-blur-xl rounded-3xl animate-in fade-in zoom-in-95 duration-200">
        <LoginForm initialTab={initialTab} />
      </Card>

      {/* Security note footer */}
      <p className="mt-8 text-xs text-center text-muted-foreground max-w-sm z-10">
        Protected with enterprise-grade encryption. Passkeys use WebAuthn public-key cryptography to prevent phishing.
      </p>
    </div>
  );
}
