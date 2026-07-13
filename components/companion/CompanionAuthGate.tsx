"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

import { useCompanionAuth } from "@/components/companion/CompanionAuthProvider";
import { SparkLoadingState } from "@/components/companion/SparkThinkingFlame";
import { isCompanionAuthBypassed } from "@/lib/companionAuthBypass";
import {
  armCompanionPreviewTestHarnessFromQuery,
  COMPANION_PREVIEW_TEST_QUERY,
} from "@/lib/companionPreviewTestHarness";
import {
  clearCompanionPostLoginQuiet,
  isCompanionPostLoginQuiet,
} from "@/lib/companionLoginTransition";

function AuthGateLoading({ message }: { message: string }) {
  return <SparkLoadingState fullPage message={message} size="lg" />;
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
  const gateOpen = isAuthed || loginHandoff;

  useEffect(() => {
    armCompanionPreviewTestHarnessFromQuery();
  }, []);

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
    const loginUrl = new URL("/companion/login", window.location.origin);
    if (new URLSearchParams(window.location.search).get(COMPANION_PREVIEW_TEST_QUERY) === "1") {
      loginUrl.searchParams.set(COMPANION_PREVIEW_TEST_QUERY, "1");
    }
    router.replace(`${loginUrl.pathname}${loginUrl.search}`);
  }, [configChecked, configured, sessionChecked, loading, gateOpen, router]);

  // Never render the Estate shell until the session is confirmed — login
  // handoff may open the gate for redirect logic, but must not flash workspace.
  if (!configChecked || !sessionChecked || loading) {
    return (
      <AuthGateLoading
        message={loginHandoff ? "Opening your space…" : "Loading your space…"}
      />
    );
  }

  if (!configured || !gateOpen) {
    return <AuthGateLoading message="Redirecting to sign in…" />;
  }

  if (!isAuthed && loginHandoff) {
    return <AuthGateLoading message="Opening your space…" />;
  }

  return <>{children}</>;
}
