"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

import { useCompanionAuth } from "@/components/companion/CompanionAuthProvider";
import { isCompanionAuthBypassed } from "@/lib/companionAuthBypass";
import {
  clearCompanionPostLoginQuiet,
  hasCompanionAuthStorageHint,
  isCompanionPostLoginQuiet,
} from "@/lib/companionLoginTransition";

function AuthGateLoading({ message }: { message: string }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f5f0e8] text-[#6b635a]">
      {message}
    </main>
  );
}

/** Unauthenticated visitors go to sign-in when Supabase auth is configured. */
export function CompanionAuthGate({ children }: { children: ReactNode }) {
  if (isCompanionAuthBypassed()) {
    return <>{children}</>;
  }
  const router = useRouter();
  const { configured, configChecked, loading, sessionChecked, user, session } =
    useCompanionAuth();
  const redirectingRef = useRef(false);

  const isAuthed = Boolean(user || session);
  const loginHandoff =
    typeof window !== "undefined" && isCompanionPostLoginQuiet();
  const hasStoredSession =
    typeof window !== "undefined" && hasCompanionAuthStorageHint();
  const gateOpen =
    isAuthed ||
    loginHandoff ||
    (sessionChecked && !loading && hasStoredSession);

  useEffect(() => {
    if (isAuthed) {
      clearCompanionPostLoginQuiet();
      redirectingRef.current = false;
    }
  }, [isAuthed]);

  useEffect(() => {
    if (gateOpen) {
      redirectingRef.current = false;
      return;
    }
    if (
      !configChecked ||
      !configured ||
      !sessionChecked ||
      loading ||
      redirectingRef.current
    ) {
      return;
    }
    redirectingRef.current = true;
    router.replace("/companion/login");
  }, [configChecked, configured, sessionChecked, loading, gateOpen, router]);

  if (!configChecked || !configured) {
    return <>{children}</>;
  }

  if (!sessionChecked || loading) {
    if (loginHandoff || hasStoredSession) {
      return <>{children}</>;
    }
    return <AuthGateLoading message="Loading your space…" />;
  }

  if (!gateOpen) {
    return <AuthGateLoading message="Redirecting to sign in…" />;
  }

  return <>{children}</>;
}
