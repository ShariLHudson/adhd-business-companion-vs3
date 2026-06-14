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
        try {
          const res = await fetch("/api/companion-auth/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const data = (await res.json()) as {
            ok?: boolean;
            error?: string;
            session?: { access_token: string; refresh_token: string };
          };
          if (!res.ok || !data.ok || !data.session) {
            return { error: data.error ?? "Sign-in failed." };
          }
          const supabase = getCompanionSupabase();
          if (!supabase) {
            return { error: "Could not save your session in the browser." };
          }
          const { error } = await supabase.auth.setSession(data.session);
          if (error) return { error: error.message };
          return { error: null };
        } catch {
          return {
            error:
              "Could not reach the server. Check your connection and try again.",
          };
        }
      },
      signUp: async (email, password, name) => {
        if (!configured) {
          return { error: "Sign-in is not configured on this server yet." };
        }
        try {
          const res = await fetch("/api/companion-auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name }),
          });
          const data = (await res.json()) as {
            ok?: boolean;
            error?: string;
            needsConfirmation?: boolean;
            session?: { access_token: string; refresh_token: string };
          };
          if (!res.ok || !data.ok) {
            return { error: data.error ?? "Sign-up failed." };
          }
          if (data.needsConfirmation) {
            return { error: null, needsConfirmation: true };
          }
          if (data.session) {
            const supabase = getCompanionSupabase();
            if (supabase) {
              const { error } = await supabase.auth.setSession(data.session);
              if (error) return { error: error.message };
            }
          }
          return { error: null, needsConfirmation: false };
        } catch {
          return {
            error:
              "Could not reach the server. Check your connection and try again.",
          };
        }
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
