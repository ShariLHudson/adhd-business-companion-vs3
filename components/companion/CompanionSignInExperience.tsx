"use client";

import { useRouter } from "next/navigation";
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
  COMPANION_LOGIN_LOADING_DELAY_MS,
  markCompanionLoginArrival,
  pickCompanionLoginSlowMessage,
  waitForCompanionAuthStorage,
} from "@/lib/companionLoginTransition";
import {
  dismissWelcomeRoomInvitation,
  dismissWelcomeRoomLoginOffer,
} from "@/lib/welcomeRoom";

/** Shared chunk promise — login page warms the home shell before auth completes. */
const companionPageImport = import("@/app/companion/CompanionPageClient");

export function CompanionSignInExperience() {
  const router = useRouter();
  const { loading, user, session, sessionChecked, configured: authReady } =
    useCompanionAuth();

  const [mounted, setMounted] = useState(false);
  const [authInFlight, setAuthInFlight] = useState(false);
  const [redirectError, setRedirectError] = useState<string | null>(null);
  const [slowMessage, setSlowMessage] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const navigatingRef = useRef(false);
  const authInFlightRef = useRef(false);
  const slowMessageRef = useRef(pickCompanionLoginSlowMessage());

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

  useEffect(() => {
    void companionPageImport;
  }, []);

  const goHomeAfterAuth = useCallback(async () => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    setRedirecting(true);
    setRedirectError(null);
    dismissWelcomeRoomInvitation();
    dismissWelcomeRoomLoginOffer();
    markCompanionLoginArrival();
    const persisted = await waitForCompanionAuthStorage(5_000);
    if (!persisted) {
      navigatingRef.current = false;
      setRedirecting(false);
      authInFlightRef.current = false;
      setAuthInFlight(false);
      setRedirectError(
        "Signed in, but this browser could not save your session. Free some storage, then try again.",
      );
      return;
    }
    router.replace("/companion");
  }, [router]);

  const shouldLeaveLogin =
    sessionChecked &&
    !loading &&
    Boolean(user || session) &&
    !authInFlight &&
    !authInFlightRef.current;

  useEffect(() => {
    if (!shouldLeaveLogin) return;
    void goHomeAfterAuth();
  }, [shouldLeaveLogin, goHomeAfterAuth]);

  const showSlowStatus =
    (loading || authInFlight) &&
    !shouldLeaveLogin &&
    !redirecting;

  useEffect(() => {
    if (!showSlowStatus) {
      setSlowMessage(null);
      return;
    }
    const timer = window.setTimeout(() => {
      setSlowMessage(slowMessageRef.current);
    }, COMPANION_LOGIN_LOADING_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [showSlowStatus]);

  if (shouldLeaveLogin || redirecting) {
    return null;
  }

  return (
    <main
      className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-8 sm:px-6 sm:py-10"
      data-testid="companion-login-page"
    >
      <CompanionLoginBackground />

      <div className="relative z-10 w-full max-w-[22rem] sm:max-w-md">
        <div className="rounded-2xl border border-white/45 bg-[#faf7f2]/72 px-5 py-6 backdrop-blur-md sm:rounded-3xl sm:px-7 sm:py-7">
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
            onSuccess={() => void goHomeAfterAuth()}
            onProcessingChange={(processing) => {
              authInFlightRef.current = processing;
              setAuthInFlight(processing);
              if (processing) setRedirectError(null);
            }}
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

      {slowMessage ? (
        <p className="companion-login-page__slow-status" role="status" aria-live="polite">
          {slowMessage}
        </p>
      ) : null}
    </main>
  );
}
