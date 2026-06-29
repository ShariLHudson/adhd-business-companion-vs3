"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { useCompanionAuth } from "@/components/companion/CompanionAuthProvider";
import { isCompanionAuthBypassed } from "@/lib/companionAuthBypass";
import { hasCompanionAuthStorageHint } from "@/lib/companionLoginTransition";

/** Unauthenticated visitors go to sign-in when Supabase auth is configured. */
export function CompanionAuthGate({ children }: { children: ReactNode }) {
  if (isCompanionAuthBypassed()) {
    return <>{children}</>;
  }
  const router = useRouter();
  const { configured, loading, sessionChecked, user, session } =
    useCompanionAuth();
  const redirectingRef = useRef(false);
  const [restoreGrace, setRestoreGrace] = useState(false);
  const isAuthed = Boolean(user || session);

  useEffect(() => {
    if (isAuthed) {
      setRestoreGrace(false);
      redirectingRef.current = false;
      return;
    }
    if (!configured || !sessionChecked || loading) {
      return;
    }
    if (hasCompanionAuthStorageHint()) {
      setRestoreGrace(true);
      const timer = window.setTimeout(() => setRestoreGrace(false), 5_000);
      return () => window.clearTimeout(timer);
    }
    setRestoreGrace(false);
  }, [configured, sessionChecked, loading, isAuthed]);

  useEffect(() => {
    if (isAuthed) {
      redirectingRef.current = false;
      return;
    }
    if (
      !configured ||
      !sessionChecked ||
      loading ||
      restoreGrace ||
      redirectingRef.current
    ) {
      return;
    }
    redirectingRef.current = true;
    router.replace("/companion/login");
  }, [configured, sessionChecked, loading, isAuthed, restoreGrace, router]);

  if (configured && (!sessionChecked || loading || restoreGrace)) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f5f0e8] text-[#6b635a]">
        Loading your space…
      </main>
    );
  }

  if (configured && sessionChecked && !loading && !isAuthed && !restoreGrace) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f5f0e8] text-[#6b635a]">
        Redirecting to sign in…
      </main>
    );
  }

  return <>{children}</>;
}
