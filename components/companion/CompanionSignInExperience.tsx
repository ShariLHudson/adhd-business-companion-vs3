"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CompanionSignInForm } from "@/components/companion/CompanionSignInForm";
import { useCompanionAuth } from "@/components/companion/CompanionAuthProvider";
import { hasSignedInOnThisDeviceBefore } from "@/lib/companionAuthIntelligence";
import {
  COMPANION_LOGIN_LOGO,
  COMPANION_LOGIN_PRIVACY_LINE,
  companionLoginHasHistory,
  companionLoginHeadline,
  companionLoginSubtext,
} from "@/lib/companionLoginPage";
import { navigateToCompanionHome } from "@/lib/companionLoginTransition";
import {
  dismissWelcomeRoomInvitation,
  dismissWelcomeRoomLoginOffer,
} from "@/lib/welcomeRoom";

export function CompanionSignInExperience() {
  const { loading, user, session, sessionChecked, configured: authReady } =
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

  const goHomeAfterAuth = useCallback(() => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    setRedirecting(true);
    setRedirectError(null);
    dismissWelcomeRoomInvitation();
    dismissWelcomeRoomLoginOffer();
    navigateToCompanionHome();
  }, []);

  useEffect(() => {
    if (!sessionChecked || loading || redirecting) return;
    if (!user && !session) return;
    goHomeAfterAuth();
  }, [sessionChecked, loading, user, session, redirecting, goHomeAfterAuth]);

  if (redirecting) {
    return (
      <main
        className="flex min-h-dvh items-center justify-center bg-[#f5f0e8] text-[#6b635a]"
        data-testid="companion-login-opening"
      >
        Opening your space…
      </main>
    );
  }

  return (
    <main
      className="flex min-h-dvh items-center justify-center bg-[#f5f0e8] px-4 py-8 sm:px-6 sm:py-10"
      data-testid="companion-login-page"
    >
      <div className="w-full max-w-[22rem] sm:max-w-md">
        <div className="rounded-2xl border border-[#e7dfd4] bg-[#faf7f2] px-5 py-6 shadow-sm sm:rounded-3xl sm:px-7 sm:py-7">
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
                ADHD Business Ecosystem™
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

          {!loading && !authReady ? (
            <p className="mt-4 text-center text-sm text-[#6b635a]">
              Sign-in is still being set up here. Try again shortly, or reach out
              if this keeps showing.
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
