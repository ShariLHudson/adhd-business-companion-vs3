"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { getAppSiteUrl } from "@/lib/appSite";
import { languagePrefsFromUserMetadata } from "@/lib/companionUserLanguage";
import { savePrefs } from "@/lib/companionStore";
import { sanitizeSupabaseAuthError } from "@/lib/supabase/authErrors";
import {
  bootstrapCompanionSupabaseConfig,
  companionAuthConfigured,
  getCompanionSupabase,
} from "@/lib/supabase/companionClient";

type CompanionAuthContextValue = {
  configured: boolean;
  loading: boolean;
  user: User | null;
  session: Session | null;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
};

const CompanionAuthContext = createContext<CompanionAuthContextValue | null>(
  null,
);

function syncUserToPrefs(user: User | null) {
  if (!user) return;
  const metaName =
    typeof user.user_metadata?.name === "string"
      ? user.user_metadata.name.trim()
      : "";
  const email = user.email?.trim() ?? "";
  const languagePrefs = languagePrefsFromUserMetadata(
    user.user_metadata as Record<string, unknown> | undefined,
  );
  savePrefs({
    ...(metaName ? { name: metaName } : {}),
    ...(email ? { email } : {}),
    ...(languagePrefs ?? {}),
  });
}

async function signInDirect(
  email: string,
  password: string,
): Promise<{ error: string | null }> {
  const supabase = getCompanionSupabase();
  if (!supabase) {
    return { error: "Could not connect to Supabase in your browser." };
  }
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: sanitizeSupabaseAuthError(error.message) };
    return { error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sign-in failed.";
    return { error: sanitizeSupabaseAuthError(message) };
  }
}

async function signUpDirect(
  email: string,
  password: string,
  name?: string,
): Promise<{ error: string | null; needsConfirmation?: boolean }> {
  const supabase = getCompanionSupabase();
  if (!supabase) {
    return { error: "Could not connect to Supabase in your browser." };
  }
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: name?.trim() ? { name: name.trim() } : undefined,
        emailRedirectTo: `${getAppSiteUrl()}/companion`,
      },
    });
    if (error) return { error: sanitizeSupabaseAuthError(error.message) };
    if (data.session) return { error: null, needsConfirmation: false };
    return { error: null, needsConfirmation: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sign-up failed.";
    return { error: sanitizeSupabaseAuthError(message) };
  }
}

export function CompanionAuthProvider({ children }: { children: ReactNode }) {
  const [configured, setConfigured] = useState(companionAuthConfigured());
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      const ready =
        companionAuthConfigured() || (await bootstrapCompanionSupabaseConfig());
      if (!mounted) return;
      setConfigured(ready);
      if (!ready) {
        setLoading(false);
        return;
      }

      const supabase = getCompanionSupabase();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      syncUserToPrefs(data.session?.user ?? null);
      setLoading(false);

      const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
        setSession(sess);
        setUser(sess?.user ?? null);
        syncUserToPrefs(sess?.user ?? null);
        setLoading(false);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    })();

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  const value = useMemo<CompanionAuthContextValue>(
    () => ({
      configured,
      loading,
      user,
      session,
      signIn: signInDirect,
      signUp: signUpDirect,
      signOut: async () => {
        const supabase = getCompanionSupabase();
        if (!supabase) return;
        await supabase.auth.signOut();
      },
    }),
    [configured, loading, user, session],
  );

  return (
    <CompanionAuthContext.Provider value={value}>
      {children}
    </CompanionAuthContext.Provider>
  );
}

export function useCompanionAuth(): CompanionAuthContextValue {
  const ctx = useContext(CompanionAuthContext);
  if (!ctx) {
    throw new Error(
      "useCompanionAuth must be used within CompanionAuthProvider",
    );
  }
  return ctx;
}
