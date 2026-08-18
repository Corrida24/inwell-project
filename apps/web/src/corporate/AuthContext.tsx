import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabaseClient';

interface CorporateAuthValue {
  /** undefined = ещё проверяем сессию, null = не залогинен, Session = залогинен. */
  session: Session | null | undefined;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const CorporateAuthContext = createContext<CorporateAuthValue | null>(null);

export const CorporateAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: 'not_configured' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const value = useMemo<CorporateAuthValue>(() => ({ session, configured: isSupabaseConfigured, signIn, signOut }), [session]);

  return <CorporateAuthContext.Provider value={value}>{children}</CorporateAuthContext.Provider>;
};

export function useCorporateAuth(): CorporateAuthValue {
  const ctx = useContext(CorporateAuthContext);
  if (!ctx) throw new Error('useCorporateAuth must be used within CorporateAuthProvider');
  return ctx;
}
