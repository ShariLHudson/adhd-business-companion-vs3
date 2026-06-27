"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { CompanionSignInForm } from "@/components/companion/CompanionSignInForm";
import { CompanionLoginBackground } from "@/components/companion/CompanionLoginBackground";
import { useCompanionAuth } from "@/components/companion/CompanionAuthProvider";
import { hasSignedInOnThisDeviceBefore } from "@/lib/companionAuthIntelligence";
import {
  COMPANION_LOGIN_LOGO,
  COMPANION_LOGIN_OPENING_MESSAGE,
  COMPANION_LOGIN_PRIVACY_LINE,
  companionLoginHasHistory,
  companionLoginHeadline,
  companionLoginSubtext,
} from "@/lib/companionLoginPage";
import {
  buildPostLoginContinueResolution,
  storePostLoginContinueFromResolution,
} from "@/lib/postLoginContinue";

export function CompanionSignInExperience() {
  const router = useRouter();
  const { loading, user, configured: authReady } = useCompanionAuth();

  const returning = useMemo(() => hasSignedInOnThisDeviceBefore(), []);
  const visitor = returning ? "returning" : "first";
  const hasCompanionHistory = useMemo(() => companionLoginHasHistory(), []);
  const [openingDoor, setOpeningDoor] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const resolution = buildPostLoginContinueResolution();
      storePostLoginContinueFromResolution(resolution);
      router.replace("/companion");
    }
  }, [loading, user, router]);

  function handleSuccess() {
    const resolution = buildPostLoginContinueResolution();
    storePostLoginContinueFromResolution(resolution);
    router.replace("/companion");
  }

  if (loading) {
    return (
      <main className="relative flex min-h-dvh items-center justify-center overflow-hidden">
        <CompanionLoginBackground />
        <p
          className="relative z-10 text-base text-[#f5efe6] drop-shadow-sm"
          role="status"
        >
          {COMPANION_LOGIN_OPENING_MESSAGE}
        </p>
      </main>
    );
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
            onSuccess={handleSuccess}
            onProcessingChange={setOpeningDoor}
          />

          {openingDoor ? (
            <p
              className="mt-4 text-center text-sm font-medium text-[#1e4f4f]"
              role="status"
              aria-live="polite"
            >
              {COMPANION_LOGIN_OPENING_MESSAGE}
            </p>
          ) : null}

          <p className="mt-5 text-center text-xs leading-relaxed text-[#6b635a]">
            {COMPANION_LOGIN_PRIVACY_LINE}
          </p>

          {!authReady ? (
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
