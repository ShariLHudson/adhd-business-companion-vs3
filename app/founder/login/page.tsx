"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { FOUNDER_ADMIN_WORKSPACE_PATH } from "@/lib/founderAdmin";

export default function FounderAdminLoginPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState(FOUNDER_ADMIN_WORKSPACE_PATH);

  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get("next");
    if (next?.startsWith("/founder/")) setNextPath(next);
  }, []);

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverConfigured, setServerConfigured] = useState<boolean | null>(
    null,
  );
  const [serverPasswordLength, setServerPasswordLength] = useState<number | null>(
    null,
  );

  useEffect(() => {
    void fetch("/api/founder-admin/status")
      .then((r) => r.json())
      .then((data: { configured?: boolean; passwordLength?: number }) => {
        setServerConfigured(Boolean(data.configured));
        setServerPasswordLength(
          typeof data.passwordLength === "number" ? data.passwordLength : null,
        );
      })
      .catch(() => setServerConfigured(null));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/founder-admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }
      router.replace(nextPath);
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f5f0e8] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#d4cdc3] bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-[#1f1c19]">Founder sign-in</h1>
        <p className="mt-1 text-sm text-[#6b635a]">
          Admin workspace — not visible to app users.
        </p>
        <p className="mt-2 text-xs text-[#6b635a]">
          Put your password in{" "}
          <code className="rounded bg-[#f5f0e8] px-1">
            companion-app/.env.local
          </code>{" "}
          as{" "}
          <code className="rounded bg-[#f5f0e8] px-1">FOUNDER_ADMIN_PASSWORD=…</code>
          . A plain <code className="rounded bg-[#f5f0e8] px-1">.env</code> file
          is not used unless it lives in that same folder. Restart{" "}
          <code className="rounded bg-[#f5f0e8] px-1">npm run dev</code> after
          every change.
        </p>
        {serverConfigured === false ? (
          <p className="mt-2 rounded-lg border border-[#a85c4a]/30 bg-[#a85c4a]/8 px-3 py-2 text-xs text-[#a85c4a]">
            This server has no password loaded. Add FOUNDER_ADMIN_PASSWORD to
            .env.local and restart the dev server.
          </p>
        ) : null}
        {serverConfigured === true ? (
          <p className="mt-2 text-xs text-[#1e4f4f]">
            Server has a password loaded
            {serverPasswordLength
              ? ` (${serverPasswordLength} characters)`
              : ""}
            . Paste only the part <em>after</em>{" "}
            <code className="rounded bg-[#f5f0e8] px-1">FOUNDER_ADMIN_PASSWORD=</code>
            , then press Ctrl+S on .env.local and restart{" "}
            <code className="rounded bg-[#f5f0e8] px-1">npm run dev</code> if you
            changed it.
          </p>
        ) : null}
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-[#2d2926]">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-[#d4cdc3] px-3 py-2"
              required
            />
          </label>
          {error ? <p className="text-sm text-[#a85c4a]">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
