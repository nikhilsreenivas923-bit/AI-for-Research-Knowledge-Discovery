import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseClientConfigured } from '../lib/supabase';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        if (isSupabaseClientConfigured()) {
          const { data: { session: initialSession } } = await supabase.auth.getSession();
          if (initialSession && mounted) {
            setSession(initialSession);
            setUser(initialSession.user);
            api.setToken(initialSession.access_token);
            try {
              await api.syncAuth();
            } catch (err) {
              console.warn('Initial auth sync warning:', err.message);
            }
          }
        } else {
          // Check if local demo session is stored
          const storedUser = localStorage.getItem('researchmind_demo_user');
          if (storedUser && mounted) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            setSession({ access_token: 'demo-token', user: parsed });
            api.setToken('demo-token');
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    // Listen to Supabase Auth state changes if configured
    let subscription = null;
    if (isSupabaseClientConfigured()) {
      const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user || null);
        if (newSession?.access_token) {
          api.setToken(newSession.access_token);
          try {
            await api.syncAuth();
          } catch (err) {
            console.warn('Auth sync failed:', err.message);
          }
        } else {
          api.setToken(null);
        }
        setLoading(false);
      });
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    if (isSupabaseClientConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setSession(data.session);
      setUser(data.user);
      api.setToken(data.session.access_token);
      await api.syncAuth();
      return data.user;
    }

    // Demo/Development mode sign in
    const demoUser = {
      id: '00000000-0000-4000-a000-000000000001',
      email: email || 'researcher@researchmind.ai'
    };
    setUser(demoUser);
    setSession({ access_token: 'demo-token', user: demoUser });
    api.setToken('demo-token');
    localStorage.setItem('researchmind_demo_user', JSON.stringify(demoUser));
    await api.syncAuth();
    return demoUser;
  };

  const signUp = async (email, password) => {
    if (isSupabaseClientConfigured()) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        api.setToken(data.session.access_token);
        await api.syncAuth();
      }
      return data;
    }

    // Demo/Development mode sign up
    return signIn(email, password);
  };

  const signInWithPasskey = async () => {
    if (isSupabaseClientConfigured()) {
      if (typeof window !== 'undefined' && !window.PublicKeyCredential) {
        throw new Error('WebAuthn / Passkeys are not supported by this browser or device.');
      }

      let res = null;
      if (typeof supabase.auth.signInWithPasskey === 'function') {
        res = await supabase.auth.signInWithPasskey();
      } else if (typeof supabase.auth.signInWithWebAuthn === 'function') {
        res = await supabase.auth.signInWithWebAuthn();
      } else {
        throw new Error('Passkey authentication is not supported in the active Supabase client.');
      }

      if (res?.error) throw res.error;
      if (res?.data?.session) {
        setSession(res.data.session);
        setUser(res.data.user);
        api.setToken(res.data.session.access_token);
        await api.syncAuth();
        return res.data.user;
      }
      return res?.data?.user;
    }

    // Demo/Development mode passkey simulation
    const demoUser = {
      id: '00000000-0000-4000-a000-000000000001',
      email: 'passkey.researcher@researchmind.ai',
      user_metadata: { auth_method: 'passkey' }
    };
    setUser(demoUser);
    setSession({ access_token: 'demo-passkey-token', user: demoUser });
    api.setToken('demo-passkey-token');
    localStorage.setItem('researchmind_demo_user', JSON.stringify(demoUser));
    await api.syncAuth();
    return demoUser;
  };

  const signInWithOtp = async (email) => {
    if (isSupabaseClientConfigured()) {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
      return data;
    }

    // Demo/Development mode
    return { message: 'Demo magic link sent' };
  };

  const signOut = async () => {
    if (isSupabaseClientConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    api.setToken(null);
    localStorage.removeItem('researchmind_demo_user');
  };

  const signInAsDemo = async () => {
    return signIn('researcher@researchmind.ai', 'demopassword123');
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signInWithPasskey,
      signInWithOtp,
      signOut,
      signInAsDemo,
      isSupabaseActive: isSupabaseClientConfigured()
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
