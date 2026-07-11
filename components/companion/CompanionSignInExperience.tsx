"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CompanionSignInForm } from "@/components/companion/CompanionSignInForm";
import { CompanionLoginBackground } from "@/components/companion/CompanionLoginBackground";
import { useCompanionAuth } from "@/components/companion/CompanionAuthProvider";
import { hasSignedInOnThisDeviceBefore } from "@/lib/companionAuthIntelligence";
import {
  COMPANION_LOGIN_LOGO,
  COMPANION_LOGIN_PRIVACY_LINE,
  companionLoginHasHistory,
  companionLoginHeadline,
  companionLoginSubtext,
} from "@/lib/companionLoginPage";
import {
  COMPANION_AUTH_SESSION_PERSISTENCE_ERROR,
  navigateToCompanionHome,
  waitForCompanionAuthStorage,
} from "@/lib/companionLoginTransition";
import { getCompanionSupabase } from "@/lib/supabase/companionClient";
import {
  dismissWelcomeRoomInvitation,
  dismissWelcomeRoomLoginOffer,
} from "@/lib/welcomeRoom";

export function CompanionSignInExperience({
  forceSignIn = false,
}: {
  /** After explicit sign-out — stay on login; do not auto-enter home. */
  forceSignIn?: boolean;
}) {
  const { loading, user, session, sessionChecked, configured: authReady, configChecked } =
    useCompanionAuth();

  const [mounted, setMounted] = useState(false);
  const [redirectError, setRedirectError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const navigatingRef = useRef(false);

  const returning = useMemo(
    () => (mounted ? hasSignedInOnThisDeviceBefore() : false),
    [mounted],
  );
  const visitor = returning ? "returning" : "first";
  const hasCompanionHistory = useMemo(
    () => (mounted ? companionLoginHasHistory() : false),
    [mounted],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const goHomeAfterAuth = useCallback(async () => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    setRedirecting(true);
    setRedirectError(null);
    dismissWelcomeRoomInvitation();
    dismissWelcomeRoomLoginOffer();
    const persisted = await waitForCompanionAuthStorage(5_000);
    if (!persisted) {
      navigatingRef.current = false;
      setRedirecting(false);
      setRedirectError(COMPANION_AUTH_SESSION_PERSISTENCE_ERROR);
      return;
    }
    navigateToCompanionHome();
  }, []);

  useEffect(() => {
    if (forceSignIn || !sessionChecked || loading || redirecting) return;
    const token = session?.access_token;
    if (!user?.id && !token) return;

    let cancelled = false;
    void (async () => {
      const supabase = getCompanionSupabase();
      if (!supabase) return;
      const { data: userData, error } = await supabase.auth.getUser();
      if (cancelled) return;
      if (error || !userData.user) return;
      goHomeAfterAuth();
    })();

    return () => {
      cancelled = true;
    };
  }, [
    forceSignIn,
    sessionChecked,
    loading,
    user,
    session,
    redirecting,
    goHomeAfterAuth,
  ]);

  useEffect(() => {
    if (!redirecting) return;
    const timeout = window.setTimeout(() => {
      navigatingRef.current = false;
      setRedirecting(false);
      setRedirectError(
        "Taking longer than expected — try signing in again.",
      );
    }, 12_000);
    return () => window.clearTimeout(timeout);
  }, [redirecting]);

  if (redirecting) {
    return (
      <main
        className="companion-login-page companion-login-page--welcome-bg relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-8"
        data-testid="companion-login-opening"
      >
        <CompanionLoginBackground />
        <p className="relative z-10 rounded-2xl border border-white/45 bg-[#faf7f2]/72 px-6 py-4 text-base text-[#6b635a] shadow-sm backdrop-blur-md">
          Opening your space…
        </p>
      </main>
    );
  }

  return (
    <main
      className="companion-login-page companion-login-page--welcome-bg relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-8 sm:px-6 sm:py-10"
      data-testid="companion-login-page"
    >
      <CompanionLoginBackground />

      <div className="relative z-10 w-full max-w-[22rem] sm:max-w-md">
        <div className="rounded-2xl border border-white/45 bg-[#faf7f2]/72 px-5 py-6 shadow-sm backdrop-blur-md sm:rounded-3xl sm:px-7 sm:py-7">
          <div className="mb-5 flex flex-col items-center gap-3 text-center">
            <div className="flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={COMPANION_LOGIN_LOGO}
                alt="Spark Studio Companions"
                className="h-[3.125rem] w-auto object-contain"
              />
              <p className="text-sm font-semibold tracking-tight text-[#2f261f]">
                Spark Studio Companions
              </p>
              <p className="text-xs font-medium text-[#6b635a]">
                ADHD Business Ecosystem
              </p>
            </div>

            <div className="space-y-1 pt-1">
              <h1 className="text-2xl font-bold tracking-tight text-[#2f261f]">
                {companionLoginHeadline(visitor)}
              </h1>
              <p className="text-base leading-relaxed text-[#6b635a]">
                {companionLoginSubtext(visitor, hasCompanionHistory)}
              </p>
            </div>
          </div>

          <CompanionSignInForm
            variant="page"
            initialMode="signin"
            returning={returning}
            onSuccess={goHomeAfterAuth}
          />

          {redirectError ? (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-[#a85c4a]/30 bg-[#a85c4a]/8 px-3 py-2 text-sm text-[#a85c4a]"
            >
              {redirectError}
            </p>
          ) : null}

          <p className="mt-5 text-center text-xs leading-relaxed text-[#6b635a]">
            {COMPANION_LOGIN_PRIVACY_LINE}
          </p>

          {configChecked && sessionChecked && !loading && !authReady ? (
            <p className="mt-4 text-center text-sm text-[#6b635a]">
              Sign-in isn&apos;t connected here yet. If this keeps showing, reach
              out — we&apos;ll get you in.
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
