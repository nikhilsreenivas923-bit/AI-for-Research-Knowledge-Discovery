import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { 
  KeyRound, 
  Fingerprint, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  SendHorizontal
} from 'lucide-react';

export default function LoginForm({ initialTab = 'signin', onAuthSuccess }) {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithPasskey, signInWithOtp, signInAsDemo, isSupabaseActive } = useAuth();

  const [tab, setTab] = useState(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);

  // Loading & status states
  const [isLoading, setIsLoading] = useState(false);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Check if browser supports WebAuthn / Passkeys
  const [hasPasskeySupport, setHasPasskeySupport] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = Boolean(window.PublicKeyCredential);
      setHasPasskeySupport(supported);
    }

    // Pre-fill remembered email if present
    try {
      const savedEmail = localStorage.getItem('rm_remember_email');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  // Sync tab if initialTab prop changes
  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const handleTabSwitch = (newTab) => {
    setTab(newTab);
    setError(null);
    setSuccessMessage(null);
    setUseMagicLink(false);
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError('Please provide a valid email address.');
      return;
    }

    // Handle Magic Link flow
    if (useMagicLink) {
      setIsLoading(true);
      try {
        await signInWithOtp(cleanEmail);
        setSuccessMessage('A secure sign-in magic link has been dispatched to your email.');
      } catch (err) {
        console.error('Magic link dispatch error:', err);
        setError(err.message || 'Unable to send magic link. Please check the email provided.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Handle Password flow
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (tab === 'signup' && password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      if (rememberMe) {
        localStorage.setItem('rm_remember_email', cleanEmail);
      } else {
        localStorage.removeItem('rm_remember_email');
      }

      if (tab === 'signin') {
        await signIn(cleanEmail, password);
        if (onAuthSuccess) {
          onAuthSuccess();
        } else {
          navigate('/dashboard');
        }
      } else {
        const data = await signUp(cleanEmail, password);
        if (data.session) {
          if (onAuthSuccess) {
            onAuthSuccess();
          } else {
            navigate('/dashboard');
          }
        } else {
          setSuccessMessage('Account registered successfully! You may now sign in with your credentials.');
          setTab('signin');
        }
      }
    } catch (err) {
      console.error('Credentials auth error:', err);
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeySignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsPasskeyLoading(true);

    try {
      await signInWithPasskey();
      if (onAuthSuccess) {
        onAuthSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Passkey sign-in error:', err);
      // Clean up common WebAuthn error messages for better user experience
      let msg = err.message || 'Passkey ceremony failed or was cancelled.';
      if (err.name === 'NotAllowedError') {
        msg = 'Passkey authentication was cancelled or timed out.';
      } else if (err.message?.includes('not found')) {
        msg = 'No matching passkey found on this device. Sign in with password or create a passkey in settings.';
      }
      setError(msg);
    } finally {
      setIsPasskeyLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError(null);
    setIsDemoLoading(true);
    try {
      await signInAsDemo();
      if (onAuthSuccess) {
        onAuthSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Demo auth error:', err);
      setError('Demo authentication failed: ' + err.message);
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Backend & Security Mode Indicator */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/70 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Security Protocol:</span>
        </span>
        <Badge variant="subtle" className="font-mono text-[11px] py-0.5">
          {isSupabaseActive ? 'Supabase Auth' : 'Local Dev Storage'}
        </Badge>
      </div>

      {/* Primary Passkey / WebAuthn Action */}
      <div className="space-y-2">
        <Button
          type="button"
          onClick={handlePasskeySignIn}
          disabled={isPasskeyLoading || isLoading || isDemoLoading}
          className="w-full h-12 bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2.5 font-bold text-xs sm:text-sm rounded-xl transition-all"
        >
          {isPasskeyLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Passkey Biometrics...</span>
            </>
          ) : (
            <>
              <Fingerprint className="w-5 h-5 text-primary-foreground stroke-[2.2]" />
              <span>Sign in with Passkey</span>
            </>
          )}
        </Button>
        <p className="text-[11px] text-center text-muted-foreground">
          Touch ID, Face ID, Windows Hello, or FIDO2 Security Key
        </p>
      </div>

      {/* Visual Separator */}
      <div className="relative flex items-center justify-center">
        <Separator className="w-full" />
        <span className="absolute bg-card px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
          Or continue with email
        </span>
      </div>

      {/* Tab Switcher: Sign In vs Create Account */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-muted/60 border border-border/60 text-xs font-semibold">
        <button
          type="button"
          onClick={() => handleTabSwitch('signin')}
          className={`py-2 rounded-lg transition-all duration-200 cursor-pointer ${
            tab === 'signin'
              ? 'bg-card text-foreground shadow-sm font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => handleTabSwitch('signup')}
          className={`py-2 rounded-lg transition-all duration-200 cursor-pointer ${
            tab === 'signup'
              ? 'bg-card text-foreground shadow-sm font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start space-x-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <strong className="block font-semibold mb-0.5">Authentication Notice</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start space-x-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <strong className="block font-semibold mb-0.5">Success</strong>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Credentials Form */}
      <form onSubmit={handleCredentialsSubmit} className="space-y-4">
        {/* Email Address with HTML5 Browser Autofill */}
        <div className="space-y-1.5">
          <Label htmlFor="auth-email">Email Address</Label>
          <div className="relative">
            <Input
              id="auth-email"
              name="email"
              type="email"
              autoComplete="username email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="researcher@institution.org"
              className="pl-10 text-xs sm:text-sm"
              required
            />
            <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Password or Magic Link Switch */}
        {!useMagicLink ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="auth-password">Password</Label>
              {tab === 'signin' && (
                <button
                  type="button"
                  onClick={() => setUseMagicLink(true)}
                  className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                >
                  Sign in with Magic Link?
                </button>
              )}
            </div>

            <div className="relative">
              <Input
                id="auth-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="pl-10 pr-10 text-xs sm:text-sm"
                required={!useMagicLink}
              />
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 p-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {tab === 'signup' && (
              <p className="text-[11px] text-muted-foreground mt-1">
                Must contain at least 6 characters. Passwords are securely hashed with bcrypt.
              </p>
            )}
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <SendHorizontal className="w-3.5 h-3.5 text-primary" />
                Passwordless Magic Link
              </span>
              <button
                type="button"
                onClick={() => setUseMagicLink(false)}
                className="text-[11px] text-primary hover:underline font-medium"
              >
                Use password instead
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              We'll send an instant login link to your inbox. No password required.
            </p>
          </div>
        )}

        {/* Remember Me Checkbox & Password Reset */}
        {tab === 'signin' && !useMagicLink && (
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-me"
                name="remember-me"
                checked={rememberMe}
                onCheckedChange={setRememberMe}
              />
              <Label htmlFor="remember-me" className="text-xs text-muted-foreground cursor-pointer">
                Remember my email
              </Label>
            </div>

            <span className="text-[11px] text-muted-foreground font-mono">
              100% CITED
            </span>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || isPasskeyLoading || isDemoLoading}
          className="w-full h-11 text-xs sm:text-sm font-bold shadow-md shadow-primary/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span>
                {useMagicLink
                  ? 'Dispatching Magic Link...'
                  : tab === 'signin'
                  ? 'Verifying Credentials...'
                  : 'Creating Account...'}
              </span>
            </>
          ) : useMagicLink ? (
            <>
              <SendHorizontal className="w-4 h-4 mr-1.5" />
              <span>Send Magic Link</span>
            </>
          ) : tab === 'signin' ? (
            <>
              <span>Sign In with Password</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </>
          ) : (
            <>
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </>
          )}
        </Button>
      </form>

      {/* Instant Demo Sandbox Access */}
      <div className="pt-4 border-t border-border/60 text-center space-y-2.5">
        <p className="text-xs text-muted-foreground">
          Want to test the platform instantly without credentials?
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={handleDemoSignIn}
          disabled={isLoading || isPasskeyLoading || isDemoLoading}
          className="w-full h-10 text-xs font-semibold border-border/80 hover:border-primary/40 text-foreground"
        >
          {isDemoLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              <span>Launching Demo Session...</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-amber-500 mr-1.5" />
              <span>Launch Instant Demo Session</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
