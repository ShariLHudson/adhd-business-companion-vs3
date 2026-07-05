"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

import { getAppSiteUrl } from "@/lib/appSite";
import { isCompanionAuthBypassed } from "@/lib/companionAuthBypass";
import {
  clearCompanionAuthStorage,
  clearCompanionSignedOut,
  hasCompanionAuthStorageHint,
  markCompanionSignedOut,
  waitForCompanionAuthStorage,
} from "@/lib/companionLoginTransition";
import { languagePrefsFromUserMetadata } from "@/lib/companionUserLanguage";
import { savePrefs } from "@/lib/companionStore";
import {
  authRequestAbortedMessage,
  emailNotConfirmedMessage,
  isAuthRequestAborted,
  isEmailNotConfirmedError,
  parseAuthApiResponse,
  postCompanionAuthApi,
  sanitizeSupabaseAuthError,
} from "@/lib/supabase/authErrors";
import {
  bootstrapCompanionSupabaseConfig,
  companionAuthConfigured,
  getCompanionSupabase,
  hydrateCompanionAuthFromInlineConfig,
  resetCompanionAuthBackoff,
  seedCompanionSupabaseInlineConfig,
} from "@/lib/supabase/companionClient";

type CompanionInlineSupabaseConfig = {
  url: string;
  anonKey: string;
};

type CompanionAuthContextValue = {
  configured: boolean;
  loading: boolean;
  /** True after the first session restore attempt finishes. */
  sessionChecked: boolean;
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
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
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
): Promise<{ error: string | null; hint?: string; session?: Session | null }> {
  const supabase = getCompanionSupabase();
  if (!supabase) {
    return { error: "Could not connect to Supabase in your browser." };
  }
  try {
    resetCompanionAuthBackoff();
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

    const { data: sessionData, error } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
    if (error) {
      if (isAuthRequestAborted(error)) {
        const retry = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
        if (retry.error) {
          return { error: authRequestAbortedMessage() };
        }
        if (!retry.data.session) {
          return { error: "Sign-in failed — could not save your session." };
        }
        resetCompanionAuthBackoff();
        return { error: null, session: retry.data.session };
      }
      return { error: sanitizeSupabaseAuthError(error.message) };
    }
    if (!sessionData.session) {
      return { error: "Sign-in failed — could not save your session." };
    }
    resetCompanionAuthBackoff();
    return { error: null, session: sessionData.session };
  } catch (e) {
    if (isAuthRequestAborted(e)) {
      return { error: authRequestAbortedMessage() };
    }
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

async function resetPasswordDirect(
  email: string,
): Promise<{ error: string | null }> {
  const trimmed = email.trim();
  if (!trimmed) {
    return { error: "Enter your email and we'll send a reset link." };
  }
  const supabase = getCompanionSupabase();
  if (!supabase) {
    return { error: "Could not connect to Supabase in your browser." };
  }
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${getAppSiteUrl()}/companion/login`,
    });
    if (error) return { error: sanitizeSupabaseAuthError(error.message) };
    return { error: null };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not send reset email.";
    return { error: sanitizeSupabaseAuthError(message) };
  }
}

async function signInWithGoogleDirect(): Promise<{ error: string | null }> {
  const supabase = getCompanionSupabase();
  if (!supabase) {
    return { error: "Could not connect to Supabase in your browser." };
  }
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${getAppSiteUrl()}/companion/login`,
      },
    });
    if (error) return { error: sanitizeSupabaseAuthError(error.message) };
    return { error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Google sign-in failed.";
    return { error: sanitizeSupabaseAuthError(message) };
  }
}

async function signUpDirect(
  email: string,
  password: string,
  name?: string,
): Promise<{ error: string | null; needsConfirmation?: boolean; session?: Session | null }> {
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
      const { data: sessionData, error } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      if (error) {
        return { error: sanitizeSupabaseAuthError(error.message) };
      }
      const persisted = await waitForCompanionAuthStorage(5_000);
      if (!persisted) {
        return {
          error:
            "Account created, but this browser could not save your session. Free some storage or try another browser.",
        };
      }
      return {
        error: null,
        needsConfirmation: false,
        session: sessionData.session,
      };
    }

    return { error: null, needsConfirmation: Boolean(data.needsConfirmation) };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sign-up failed.";
    return { error: sanitizeSupabaseAuthError(message) };
  }
}

export function CompanionAuthProvider({
  children,
  inlineSupabase,
}: {
  children: ReactNode;
  inlineSupabase?: CompanionInlineSupabaseConfig | null;
}) {
  const authBypassed = isCompanionAuthBypassed();

  const [configured, setConfigured] = useState(() => {
    if (typeof window === "undefined") return false;
    hydrateCompanionAuthFromInlineConfig();
    return companionAuthConfigured();
  });
  const [loading, setLoading] = useState(() => !authBypassed);
  const [sessionChecked, setSessionChecked] = useState(() => authBypassed);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const explicitSignOutRef = useRef(false);

  useLayoutEffect(() => {
    if (inlineSupabase?.url && inlineSupabase.anonKey) {
      seedCompanionSupabaseInlineConfig(
        inlineSupabase.url,
        inlineSupabase.anonKey,
      );
    }
    hydrateCompanionAuthFromInlineConfig();
    if (companionAuthConfigured()) {
      setConfigured(true);
    }
  }, [inlineSupabase?.url, inlineSupabase?.anonKey]);

  function applyAuthSession(sess: Session | null) {
    setSession(sess);
    setUser(sess?.user ?? null);
    if (sess?.user) {
      syncUserToPrefs(sess.user);
    }
  }

  useEffect(() => {
    if (authBypassed) return;

    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    const finishLoading = () => {
      if (mounted) {
        setLoading(false);
        setSessionChecked(true);
      }
    };

    const loadingTimeout = window.setTimeout(finishLoading, 10_000);

    void (async () => {
      try {
        hydrateCompanionAuthFromInlineConfig();
        let ready = companionAuthConfigured();
        if (!ready) {
          for (let attempt = 0; attempt < 4 && !ready; attempt += 1) {
            ready = await bootstrapCompanionSupabaseConfig();
            if (!ready && attempt < 3) {
              await new Promise((resolve) =>
                window.setTimeout(resolve, 200 * (attempt + 1)),
              );
            }
          }
        }
        if (!mounted) return;
        const authReady = companionAuthConfigured();
        setConfigured(authReady);
        if (!authReady) return;

        const supabase = getCompanionSupabase();
        if (!supabase) return;

        const applySession = (sess: Session | null) => {
          if (!mounted) return;
          setSession(sess);
          setUser(sess?.user ?? null);
          if (sess?.user) syncUserToPrefs(sess.user);
        };

        const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
          if (!mounted) return;
          if (event === "SIGNED_OUT") {
            if (explicitSignOutRef.current) {
              explicitSignOutRef.current = false;
              setSession(null);
              setUser(null);
              return;
            }
            if (hasCompanionAuthStorageHint()) {
              void (async () => {
                const refreshed = await supabase.auth.refreshSession();
                if (!mounted) return;
                if (refreshed.data.session) {
                  applySession(refreshed.data.session);
                  return;
                }
                const retry = await supabase.auth.getSession();
                if (!mounted) return;
                if (retry.data.session) {
                  applySession(retry.data.session);
                  return;
                }
                setSession(null);
                setUser(null);
              })();
              return;
            }
            setSession(null);
            setUser(null);
            return;
          }
          applySession(sess);
          if (shouldSyncPrefs(event)) {
            syncUserToPrefs(sess?.user ?? null);
          }
        });
        unsubscribe = () => sub.subscription.unsubscribe();

        async function restoreSession(): Promise<Session | null> {
          if (!supabase) return null;
          const first = await supabase.auth.getSession();
          if (first.data.session) return first.data.session;
          if (first.error) {
            const status = (first.error as { status?: number }).status;
            if (status === 429) resetCompanionAuthBackoff();
          }
          for (let i = 0; i < 12; i += 1) {
            await new Promise((resolve) => window.setTimeout(resolve, 100));
            const retry = await supabase.auth.getSession();
            if (retry.data.session) return retry.data.session;
          }
          if (hasCompanionAuthStorageHint()) {
            const refreshed = await supabase.auth.refreshSession();
            if (refreshed.data.session) return refreshed.data.session;
          }
          return null;
        }

        const restored = await restoreSession();
        if (mounted) applySession(restored);
      } finally {
        window.clearTimeout(loadingTimeout);
        finishLoading();
      }
    })();

    return () => {
      mounted = false;
      window.clearTimeout(loadingTimeout);
      unsubscribe?.();
    };
  }, [authBypassed]);

  useEffect(() => {
    if (authBypassed) return;
    if (!configured || loading || user || session) return;
    if (!sessionChecked || !hasCompanionAuthStorageHint()) return;

    let cancelled = false;
    const supabase = getCompanionSupabase();
    if (!supabase) return;

    void (async () => {
      const first = await supabase.auth.getSession();
      if (!cancelled && first.data.session) {
        applyAuthSession(first.data.session);
        return;
      }
      const refreshed = await supabase.auth.refreshSession();
      if (!cancelled && refreshed.data.session) {
        applyAuthSession(refreshed.data.session);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authBypassed, configured, loading, sessionChecked, user, session]);

  const value = useMemo<CompanionAuthContextValue>(
    () => ({
      configured,
      loading,
      sessionChecked,
      user,
      session,
      signIn: async (email, password) => {
        hydrateCompanionAuthFromInlineConfig();
        if (!companionAuthConfigured()) {
          await bootstrapCompanionSupabaseConfig();
        }
        if (companionAuthConfigured()) setConfigured(true);
        const result = await signInDirect(email, password);
        clearCompanionSignedOut();
        if (!result.error && result.session) {
          applyAuthSession(result.session);
        } else if (!result.error) {
          const supabase = getCompanionSupabase();
          const restored = await supabase?.auth.getSession();
          if (restored?.data.session) {
            applyAuthSession(restored.data.session);
          }
        }
        return { error: result.error, hint: result.hint };
      },
      signUp: async (email, password, name) => {
        const result = await signUpDirect(email, password, name);
        if (!result.error && result.session) {
          applyAuthSession(result.session);
        }
        return {
          error: result.error,
          needsConfirmation: result.needsConfirmation,
        };
      },
      signOut: async () => {
        explicitSignOutRef.current = true;
        markCompanionSignedOut();
        clearCompanionAuthStorage();
        setSession(null);
        setUser(null);
        const supabase = getCompanionSupabase();
        if (!supabase) return;
        await supabase.auth.signOut();
      },
      resendSignUpConfirmation: resendSignUpConfirmationDirect,
      resetPassword: resetPasswordDirect,
      signInWithGoogle: signInWithGoogleDirect,
    }),
    [configured, loading, sessionChecked, user, session],
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
