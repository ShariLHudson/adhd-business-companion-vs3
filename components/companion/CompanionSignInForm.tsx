"use client";

import { FormEvent, useEffect, useState } from "react";

import { useCompanionAuth } from "@/components/companion/CompanionAuthProvider";
import { useCompanionLanguage } from "@/components/companion/CompanionLanguageProvider";
import { companionAuthConfigStatus, companionAuthMisconfigHint } from "@/lib/supabase/companionClient";

type Mode = "signin" | "signup";

function envSetupHint(hostname: string): string {
  if (/localhost|127\.0\.0\.1/.test(hostname)) {
    return "companion-app/.env.local — then restart npm run dev";
  }
  return "Vercel environment variables — then redeploy";
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
}: {
  onSuccess?: () => void;
  onClose?: () => void;
  initialMode?: Mode;
  showClose?: boolean;
}) {
  const { configured, loading, user, signIn, signUp, resendSignUpConfirmation } =
    useCompanionAuth();
  const { t } = useCompanionLanguage();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);

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
          You can close this panel and keep using your ADHD Ecosystem. Your session
          stays saved in this browser.
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
        "Confirmation email sent. Check your inbox and spam/promotions — it can take a few minutes.",
      );
      setShowResend(true);
    } finally {
      setResendBusy(false);
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
    try {
      if (mode === "signin") {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
          setShowResend(
            /not confirmed|confirmation/i.test(result.error),
          );
          return;
        }
        onSuccess?.();
        return;
      }

      const result = await signUp(email, password, name);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.needsConfirmation) {
        setNotice(
          "Almost there — sign in with the email and password you just created.",
        );
        setMode("signin");
        return;
      }
      onSuccess?.();
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f]";

  return (
    <div className="flex flex-col gap-4">
      <ConfigBanner />

      <div>
        <h2 className="text-xl font-semibold text-[#1f1c19]">
          {mode === "signin" ? t("auth.signIn") : t("auth.signUp")}
        </h2>
        <p className="mt-1 text-sm text-[#6b635a]">
          {mode === "signin"
            ? "Welcome back — pick up where you left off."
            : "Set up your ADHD Ecosystem account in under a minute."}
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-[#a85c4a]/30 bg-[#a85c4a]/8 px-3 py-2 text-sm text-[#a85c4a]">
          {error}
        </p>
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-[#4b463f]">{t("auth.password")}</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            className={inputClass}
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="mt-1 rounded-xl bg-[#1e4f4f] px-5 py-3 text-base font-semibold text-white hover:bg-[#163a3a] disabled:opacity-60"
        >
          {busy
            ? "One moment…"
            : mode === "signin"
              ? t("auth.signIn")
              : t("auth.createAccount")}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setError(null);
          setNotice(null);
          setShowResend(false);
          setMode((m) => (m === "signin" ? "signup" : "signin"));
        }}
        className="text-sm font-medium text-[#1e4f4f] hover:underline"
      >
        {mode === "signin"
          ? "New here? Create an account"
          : "Already have an account? Sign in"}
      </button>

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
