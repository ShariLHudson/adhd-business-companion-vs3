"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import { CompanionSignInForm } from "@/components/companion/CompanionSignInForm";
import { CompanionBackground } from "@/components/companion/CompanionBackground";
import { useCompanionAuth } from "@/components/companion/CompanionAuthProvider";
import { hasSignedInOnThisDeviceBefore } from "@/lib/companionAuthIntelligence";
import { ASSETS, BRAND } from "@/lib/companionUi";
import {
  buildPostLoginContinueResolution,
  storePostLoginContinueFromResolution,
} from "@/lib/postLoginContinue";

export function CompanionSignInExperience() {
  const router = useRouter();
  const { loading, user, configured: authReady } = useCompanionAuth();

  const returning = useMemo(() => hasSignedInOnThisDeviceBefore(), []);

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
        <CompanionBackground page="today" seed="sign-in" />
        <p className="relative z-10 text-sm text-[#6b635a]">
          Checking your session…
        </p>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <CompanionBackground page="today" seed="sign-in-welcome" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/55 bg-white/78 px-6 py-8 shadow-[0_12px_40px_rgba(47,38,31,0.12)] backdrop-blur-md sm:px-8">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ASSETS.logo}
                alt=""
                className="h-9 w-9 rounded-lg object-contain"
              />
              <div className="text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6b635a]">
                  Spark Studio Companions™
                </p>
                <p className="text-sm font-semibold text-[#2f261f]">
                  ADHD Business Ecosystem™
                </p>
              </div>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ASSETS.profile}
              alt="Shari"
              className="mt-1 h-16 w-16 rounded-full object-cover ring-4 ring-white/90 shadow-md"
            />

            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-[#2f261f]">
                {returning ? "Welcome back." : "It's good to see you."}
              </h1>
              <p className="text-base text-[#6b635a]">
                {returning
                  ? "Ready to continue where we left off?"
                  : "Let's pick up where you left off — whenever you're ready."}
              </p>
            </div>
          </div>

          <CompanionSignInForm
            variant="page"
            initialMode="signin"
            onSuccess={handleSuccess}
          />

          {!authReady ? (
            <p className="mt-6 text-center text-sm text-[#6b635a]">
              Sign-in is still being set up here. Try again shortly, or reach out
              if this keeps showing.
            </p>
          ) : null}
        </div>

        <p className="mt-4 text-center text-xs text-[#9a8f82]">
          {BRAND.tagline}
        </p>
      </div>
    </main>
  );
}
