"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

import { getAppSiteUrl } from "@/lib/appSite";
import { languagePrefsFromUserMetadata } from "@/lib/companionUserLanguage";
import { savePrefs } from "@/lib/companionStore";
import {
  emailNotConfirmedMessage,
  isEmailNotConfirmedError,
  parseAuthApiResponse,
  postCompanionAuthApi,
  sanitizeSupabaseAuthError,
} from "@/lib/supabase/authErrors";
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
  ) => Promise<{ error: string | null; hint?: string }>;
  signUp: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  resendSignUpConfirmation: (email: string) => Promise<{ error: string | null }>;
};

const CompanionAuthContext = createContext<CompanionAuthContextValue | null>(
  null,
);

function shouldSyncPrefs(event: AuthChangeEvent): boolean {
  return (
    event === "SIGNED_IN" ||
    event === "INITIAL_SESSION" ||
    event === "USER_UPDATED"
  );
}

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
): Promise<{ error: string | null; hint?: string }> {
  const supabase = getCompanionSupabase();
  if (!supabase) {
    return { error: "Could not connect to Supabase in your browser." };
  }
  try {
    const res = await postCompanionAuthApi("/api/companion-auth/signin", {
      email,
      password,
    });
    const { data, htmlOrInvalid } = await parseAuthApiResponse(res);
    if (htmlOrInvalid || !data) {
      return {
        error:
          "Could not reach the sign-in service. Check your connection and try again.",
      };
    }
    if (!data.ok) {
      const err =
        typeof data.error === "string" ? data.error : "Sign-in failed.";
      const message = isEmailNotConfirmedError(err)
        ? emailNotConfirmedMessage()
        : sanitizeSupabaseAuthError(err);
      const hint =
        typeof data.hint === "string" ? data.hint : undefined;
      return { error: message, hint };
    }

    const session = data.session as
      | { access_token?: string; refresh_token?: string }
      | undefined;
    if (!session?.access_token || !session?.refresh_token) {
      return { error: "Sign-in failed — no session returned." };
    }

    const { error } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
    if (error) {
      return { error: sanitizeSupabaseAuthError(error.message) };
    }
    return { error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sign-in failed.";
    return { error: sanitizeSupabaseAuthError(message) };
  }
}

async function resendSignUpConfirmationDirect(
  email: string,
): Promise<{ error: string | null }> {
  const trimmed = email.trim();
  if (!trimmed) {
    return { error: "Enter your email address first." };
  }
  const supabase = getCompanionSupabase();
  if (!supabase) {
    return { error: "Could not connect to Supabase in your browser." };
  }
  try {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: trimmed,
      options: {
        emailRedirectTo: `${getAppSiteUrl()}/companion/login`,
      },
    });
    if (error) return { error: sanitizeSupabaseAuthError(error.message) };
    return { error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not resend email.";
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
    const res = await postCompanionAuthApi("/api/companion-auth/signup", {
      email,
      password,
      name: name?.trim() || undefined,
    });
    const { data, htmlOrInvalid } = await parseAuthApiResponse(res);
    if (htmlOrInvalid || !data) {
      return {
        error:
          "Could not reach the sign-up service. Check your connection and try again.",
      };
    }
    if (!data.ok) {
      const err =
        typeof data.error === "string" ? data.error : "Sign-up failed.";
      return { error: sanitizeSupabaseAuthError(err) };
    }

    const session = data.session as
      | { access_token?: string; refresh_token?: string }
      | undefined;
    if (session?.access_token && session?.refresh_token) {
      const { error } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      if (error) {
        return { error: sanitizeSupabaseAuthError(error.message) };
      }
      return { error: null, needsConfirmation: false };
    }

    return { error: null, needsConfirmation: Boolean(data.needsConfirmation) };
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
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    const finishLoading = () => {
      if (mounted) setLoading(false);
    };

    const loadingTimeout = window.setTimeout(finishLoading, 8_000);

    void (async () => {
      try {
        const ready =
          companionAuthConfigured() ||
          (await bootstrapCompanionSupabaseConfig());
        if (!mounted) return;
        setConfigured(ready);
        if (!ready) return;

        const supabase = getCompanionSupabase();
        if (!supabase) return;

        const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
          if (!mounted) return;
          setSession(sess);
          setUser(sess?.user ?? null);
          if (shouldSyncPrefs(event)) {
            syncUserToPrefs(sess?.user ?? null);
          }
          finishLoading();
        });
        unsubscribe = () => sub.subscription.unsubscribe();

        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;

        if (error) {
          const status = (error as { status?: number }).status;
          if (status === 429) {
            await supabase.auth.signOut({ scope: "local" });
          }
          return;
        }

        setSession(data.session);
        setUser(data.session?.user ?? null);
        if (data.session?.user) {
          syncUserToPrefs(data.session.user);
        }
      } finally {
        finishLoading();
      }
    })();

    return () => {
      mounted = false;
      window.clearTimeout(loadingTimeout);
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
      resendSignUpConfirmation: resendSignUpConfirmationDirect,
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
