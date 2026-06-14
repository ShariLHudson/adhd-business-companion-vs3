"use client";

import { FormEvent, useState } from "react";

import { useCompanionAuth } from "@/components/companion/CompanionAuthProvider";
import { companionAuthConfigStatus } from "@/lib/supabase/companionClient";

type Mode = "signin" | "signup";

function ConfigBanner() {
  const { configured, hasUrl, hasAnonKey } = companionAuthConfigStatus();
  if (configured) return null;

  const missing: string[] = [];
  if (!hasUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!hasAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return (
    <p className="rounded-lg border border-[#a85c4a]/30 bg-[#a85c4a]/8 px-3 py-2 text-sm text-[#a85c4a]">
      Sign-in is almost ready — add{" "}
      {missing.map((name, i) => (
        <span key={name}>
          {i > 0 ? " and " : ""}
          <code className="rounded bg-white/80 px-1">{name}</code>
        </span>
      ))}{" "}
      in Vercel, then redeploy. You can still see the form below.
    </p>
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
  const { configured, loading, user, signIn, signUp } = useCompanionAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!configured) {
      setError(
        "Sign-in is not live yet — the site owner needs to add Supabase URL + key in Vercel.",
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
          "Check your email for a confirmation link, then come back and sign in.",
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
          {mode === "signin" ? "Sign in" : "Create your account"}
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

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        {mode === "signup" ? (
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-[#4b463f]">Your name</span>
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
          <span className="font-medium text-[#4b463f]">Email</span>
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
          <span className="font-medium text-[#4b463f]">Password</span>
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
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setError(null);
          setNotice(null);
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
