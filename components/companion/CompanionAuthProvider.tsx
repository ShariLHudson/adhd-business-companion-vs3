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

import { savePrefs } from "@/lib/companionStore";
import {
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
  savePrefs({
    ...(metaName ? { name: metaName } : {}),
    ...(email ? { email } : {}),
  });
}

export function CompanionAuthProvider({ children }: { children: ReactNode }) {
  const configured = companionAuthConfigured();
  const [loading, setLoading] = useState(configured);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    const supabase = getCompanionSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      syncUserToPrefs(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      syncUserToPrefs(sess?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [configured]);

  const value = useMemo<CompanionAuthContextValue>(
    () => ({
      configured,
      loading,
      user,
      session,
      signIn: async (email, password) => {
        if (!configured) {
          return { error: "Sign-in is not configured on this server yet." };
        }
        const supabase = getCompanionSupabase();
        if (!supabase) {
          return { error: "Sign-in is not available right now." };
        }
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        return { error: error?.message ?? null };
      },
      signUp: async (email, password, name) => {
        if (!configured) {
          return { error: "Sign-in is not configured on this server yet." };
        }
        const supabase = getCompanionSupabase();
        if (!supabase) {
          return { error: "Sign-in is not available right now." };
        }
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: name?.trim() ? { name: name.trim() } : undefined,
          },
        });
        if (error) return { error: error.message };
        return { error: null, needsConfirmation: !data.session };
      },
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
