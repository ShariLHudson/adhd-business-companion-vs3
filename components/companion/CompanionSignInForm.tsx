"use client";

import { FormEvent, useEffect, useState } from "react";

import { useCompanionAuth } from "@/components/companion/CompanionAuthProvider";
import { useCompanionLanguage } from "@/components/companion/CompanionLanguageProvider";
import {
  recordAuthLoginFailure,
  recordAuthLoginSuccess,
  recordAuthPasswordResetRequested,
  type AuthLoginMethod,
} from "@/lib/companionAuthIntelligence";
import { companionAuthConfigStatus, companionAuthMisconfigHint } from "@/lib/supabase/companionClient";

type Mode = "signin" | "signup";

function envSetupHint(hostname: string): string {
  if (/localhost|127\.0\.0\.1/.test(hostname)) {
    return "companion-app/.env.local — then restart npm run dev";
  }
  return "Vercel environment variables — then redeploy";
}

function friendlyAuthError(message: string): string {
  if (/invalid login credentials|invalid email or password/i.test(message)) {
    return "That email or password didn't match. Double-check for typos — it happens to everyone.";
  }
  if (/email not confirmed|not confirmed/i.test(message)) {
    return message;
  }
  if (/too many requests|rate limit/i.test(message)) {
    return "A few too many tries — take a breath, then try again in a minute.";
  }
  return message;
}

function ConfigBanner() {
  const { configured: authReady, loading } = useCompanionAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading || authReady) return null;

  const {
    hasUrl,
    hasAnonKey,
    urlLooksValid,
    anonKeyLooksValid,
    anonKeyLength,
  } = companionAuthConfigStatus();

  const misconfigHint = companionAuthMisconfigHint();
  const missing: string[] = [];
  if (!hasUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!hasAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const showMissingBanner = missing.length > 0 && !misconfigHint;

  return (
    <div className="flex flex-col gap-2">
      {showMissingBanner ? (
        <p className="rounded-lg border border-[#a85c4a]/30 bg-[#a85c4a]/8 px-3 py-2 text-sm text-[#a85c4a]">
          Sign-in is almost ready — add{" "}
          {missing.map((name, i) => (
            <span key={name}>
              {i > 0 ? " and " : ""}
              <code className="rounded bg-white/80 px-1">{name}</code>
            </span>
          ))}{" "}
          in {envSetupHint(window.location.hostname)}.
        </p>
      ) : null}
      {misconfigHint ? (
        <p className="rounded-lg border border-[#a85c4a]/30 bg-[#a85c4a]/8 px-3 py-2 text-sm text-[#a85c4a]">
          {misconfigHint}
        </p>
      ) : null}
      {hasUrl && !urlLooksValid && !misconfigHint ? (
        <p className="rounded-lg border border-[#a85c4a]/30 bg-[#a85c4a]/8 px-3 py-2 text-sm text-[#a85c4a]">
          <code className="rounded bg-white/80 px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
          should be your Supabase project URL (e.g.{" "}
          <code className="rounded bg-white/80 px-1">
            https://xxxx.supabase.co
          </code>
          ), not an API key. Fix in {envSetupHint(window.location.hostname)}.
        </p>
      ) : null}
      {hasAnonKey && !anonKeyLooksValid && !misconfigHint ? (
        <p className="rounded-lg border border-[#a85c4a]/30 bg-[#a85c4a]/8 px-3 py-2 text-sm text-[#a85c4a]">
          Your Supabase API key does not look right ({anonKeyLength} characters).
          Use the full <strong>Publishable</strong> key from Supabase → Settings →
          API Keys (copy button), or the <strong>Legacy anon</strong>{" "}
          <code className="rounded bg-white/80 px-1">eyJ…</code> key. Paste into
          Vercel as{" "}
          <code className="rounded bg-white/80 px-1">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>
          , then restart or redeploy.
        </p>
      ) : null}
    </div>
  );
}

export function CompanionSignInForm({
  onSuccess,
  onClose,
  initialMode = "signin",
  showClose = false,
  variant = "overlay",
}: {
  onSuccess?: (method?: AuthLoginMethod) => void;
  onClose?: () => void;
  initialMode?: Mode;
  showClose?: boolean;
  /** page = full sign-in screen; overlay = settings sheet */
  variant?: "page" | "overlay";
}) {
  const {
    configured,
    loading,
    user,
    signIn,
    signUp,
    resendSignUpConfirmation,
    resetPassword,
    signInWithGoogle,
  } = useCompanionAuth();
  const { t } = useCompanionLanguage();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [authHint, setAuthHint] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  if (loading) {
    return (
      <p className="text-sm text-[#6b635a]">Checking your session…</p>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-base text-[#1f1c19]">
          Signed in as{" "}
          <strong>{user.email ?? "your account"}</strong>
        </p>
        <p className="text-sm text-[#6b635a]">
          You can close this panel and keep going. Your session stays saved in
          this browser.
        </p>
        {showClose && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
          >
            Close
          </button>
        ) : null}
      </div>
    );
  }

  async function onResendConfirmation() {
    if (!configured || !email.trim()) {
      setError("Enter the email you used to sign up, then try again.");
      return;
    }
    setResendBusy(true);
    setError(null);
    try {
      const result = await resendSignUpConfirmation(email);
      if (result.error) {
        setError(result.error);
        return;
      }
      setNotice(
        "Confirmation email sent. Check your inbox and spam — it can take a few minutes.",
      );
      setShowResend(true);
    } finally {
      setResendBusy(false);
    }
  }

  async function onForgotPassword() {
    if (!configured) {
      setError(
        companionAuthMisconfigHint() ??
          "Sign-in is not live yet on this environment.",
      );
      return;
    }
    if (!email.trim()) {
      setError("Enter your email above first — we'll send a reset link.");
      setForgotOpen(true);
      return;
    }
    setResetBusy(true);
    setError(null);
    setNotice(null);
    recordAuthPasswordResetRequested();
    try {
      const result = await resetPassword(email);
      if (result.error) {
        setError(friendlyAuthError(result.error));
        return;
      }
      setNotice(
        "Check your email for a password reset link. It may take a minute — check spam too.",
      );
      setForgotOpen(false);
    } finally {
      setResetBusy(false);
    }
  }

  async function onGoogleSignIn() {
    if (!configured) {
      setError(
        companionAuthMisconfigHint() ??
          "Sign-in is not live yet on this environment.",
      );
      return;
    }
    setGoogleBusy(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setError(friendlyAuthError(result.error));
        return;
      }
      recordAuthLoginSuccess("google");
      onSuccess?.("google");
    } finally {
      setGoogleBusy(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!configured) {
      setError(
        companionAuthMisconfigHint() ??
          "Sign-in is not live yet — add your Supabase anon key in companion-app/.env.local, then restart npm run dev.",
      );
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    setAuthHint(null);
    try {
      if (mode === "signin") {
        const result = await signIn(email, password);
        if (result.error) {
          recordAuthLoginFailure();
          setError(friendlyAuthError(result.error));
          setAuthHint(result.hint ?? null);
          setShowResend(/not confirmed|confirmation/i.test(result.error));
          return;
        }
        recordAuthLoginSuccess("email");
        onSuccess?.("email");
        return;
      }

      const result = await signUp(email, password, name);
      if (result.error) {
        recordAuthLoginFailure();
        setError(friendlyAuthError(result.error));
        return;
      }
      if (result.needsConfirmation) {
        setNotice(
          "Almost there — sign in with the email and password you just created.",
        );
        setMode("signin");
        return;
      }
      recordAuthLoginSuccess("email");
      onSuccess?.("email");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";

  const signInSubtitle =
    variant === "page"
      ? null
      : "Welcome back — pick up where we left off.";

  return (
    <div className="flex flex-col gap-4">
      <ConfigBanner />

      {variant === "overlay" ? (
        <div>
          <h2 className="text-xl font-semibold text-[#1f1c19]">
            {mode === "signin" ? t("auth.signIn") : t("auth.signUp")}
          </h2>
          {signInSubtitle ? (
            <p className="mt-1 text-sm text-[#6b635a]">{signInSubtitle}</p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-[#a85c4a]/30 bg-[#a85c4a]/8 px-3 py-2 text-sm text-[#a85c4a]"
        >
          {error}
        </p>
      ) : null}
      {authHint === "create_account" || authHint === "reset_via_signup" ? (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setAuthHint(null);
            setNotice(
              authHint === "reset_via_signup"
                ? "Enter the password you want, then create your account — we'll sign you in right after."
                : "Create your account with the email and password above.",
            );
            setMode("signup");
          }}
          className="rounded-xl border border-[#1e4f4f]/40 bg-[#1e4f4f]/8 px-4 py-2.5 text-left text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/12"
        >
          {authHint === "reset_via_signup"
            ? "Set a new password & sign in"
            : "Create account with this email"}
        </button>
      ) : null}
      {notice ? (
        <p className="rounded-lg border border-[#1e4f4f]/30 bg-[#1e4f4f]/8 px-3 py-2 text-sm text-[#1e4f4f]">
          {notice}
        </p>
      ) : null}
      {showResend ? (
        <button
          type="button"
          disabled={resendBusy || !email.trim()}
          onClick={() => void onResendConfirmation()}
          className="text-left text-sm font-medium text-[#1e4f4f] underline decoration-[#1e4f4f]/40 underline-offset-2 hover:decoration-[#1e4f4f] disabled:opacity-50"
        >
          {resendBusy ? "Sending…" : "Didn't get it? Resend confirmation email"}
        </button>
      ) : null}

      {mode === "signin" && variant === "page" ? (
        <button
          type="button"
          disabled={googleBusy || !configured}
          onClick={() => void onGoogleSignIn()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#d4cdc3] bg-white px-4 py-3 text-base font-semibold text-[#1f1c19] shadow-sm transition-colors hover:bg-[#faf7f2] disabled:opacity-60"
        >
          <span aria-hidden="true">G</span>
          {googleBusy ? "One moment…" : "Continue with Google"}
        </button>
      ) : null}

      {mode === "signin" && variant === "page" ? (
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[#e0d8cc]" />
          <span className="text-xs font-medium text-[#9a8f82]">or</span>
          <div className="h-px flex-1 bg-[#e0d8cc]" />
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        {mode === "signup" ? (
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-[#4b463f]">{t("auth.yourName")}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="What should Shari call you?"
              className={inputClass}
            />
          </label>
        ) : null}
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-[#4b463f]">{t("auth.email")}</span>
          <input
            type="email"
            required
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-[#4b463f]">{t("auth.password")}</span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              className={`${inputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-[#6b635a] hover:text-[#1e4f4f]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        {mode === "signin" ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setForgotOpen(true);
                if (email.trim()) void onForgotPassword();
              }}
              disabled={resetBusy}
              className="text-sm font-medium text-[#1e4f4f] hover:underline disabled:opacity-50"
            >
              {resetBusy ? "Sending…" : "Forgot password?"}
            </button>
          </div>
        ) : null}

        {forgotOpen && !notice?.includes("reset link") ? (
          <p className="text-sm text-[#6b635a]">
            Enter your email above, then tap Forgot password? — we&apos;ll send a
            gentle reset link.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-1 rounded-xl bg-[#1e4f4f] px-5 py-3 text-base font-semibold text-white hover:bg-[#163a3a] disabled:opacity-60"
        >
          {busy
            ? mode === "signin"
              ? "Signing you in…"
              : "One moment…"
            : mode === "signin"
              ? t("auth.signIn")
              : t("auth.createAccount")}
        </button>
      </form>

      {variant === "page" ? (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setNotice(null);
            setAuthHint(null);
            setShowResend(false);
            setMode((m) => (m === "signin" ? "signup" : "signin"));
          }}
          className="w-full rounded-xl border border-[#d4cdc3] bg-[#faf7f2] px-4 py-3 text-sm font-semibold text-[#1e4f4f] transition-colors hover:bg-white"
        >
          {mode === "signin" ? "Create Account" : "Already have an account? Sign in"}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setNotice(null);
            setAuthHint(null);
            setShowResend(false);
            setMode((m) => (m === "signin" ? "signup" : "signin"));
          }}
          className="text-sm font-medium text-[#1e4f4f] hover:underline"
        >
          {mode === "signin"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </button>
      )}

      {showClose && onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-medium text-[#9a8f82] hover:underline"
        >
          Close for now
        </button>
      ) : null}
    </div>
  );
}
