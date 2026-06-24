"use client";

import { useEffect, useState } from "react";
import { ASSETS } from "@/lib/companionUi";
import {
  incrementHomeVisitCount,
  shouldShowIntroCopy,
} from "@/lib/homeWelcome";
import {
  isPhase1OnboardingActive,
  PHASE1_OPENING_MESSAGE,
} from "@/lib/phase1Onboarding";
import { useRotatingShariPhoto } from "@/lib/useRotatingShariPhoto";

type SimpleHomeWelcomeProps = {
  onOpenToday: () => void;
};

export function SimpleHomeWelcome({ onOpenToday }: SimpleHomeWelcomeProps) {
  const [showIntro, setShowIntro] = useState(false);
  const [onboardingActive, setOnboardingActive] = useState(false);
  const photo = useRotatingShariPhoto();
  const [photoSrc, setPhotoSrc] = useState(photo);

  useEffect(() => {
    setPhotoSrc(photo);
  }, [photo]);

  useEffect(() => {
    const count = incrementHomeVisitCount();
    setShowIntro(shouldShowIntroCopy(count));
    setOnboardingActive(isPhase1OnboardingActive());
    const refresh = () => setOnboardingActive(isPhase1OnboardingActive());
    window.addEventListener("companion-phase1-onboarding-updated", refresh);
    return () =>
      window.removeEventListener("companion-phase1-onboarding-updated", refresh);
  }, []);

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-5 px-6 pt-8 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={photoSrc}
        src={photoSrc}
        alt="Shari"
        className="companion-fade-in h-28 w-28 rounded-full object-cover shadow-md ring-4 ring-white transition-opacity duration-700"
        onError={() => {
          if (photoSrc !== ASSETS.profile) setPhotoSrc(ASSETS.profile);
        }}
      />

      {showIntro ? (
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[#2f261f]">Hi, I&apos;m Shari</h1>
          <p className="text-lg text-[#6f6259]">Your Coach & Companion</p>
        </div>
      ) : (
        <p className="text-2xl font-semibold text-[#2f261f]">Welcome back.</p>
      )}

      {onboardingActive ? (
        <div className="max-w-lg space-y-3 text-left text-base leading-relaxed text-[#4b463f]">
          {PHASE1_OPENING_MESSAGE.split("\n\n").map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={onOpenToday}
        className="rounded-2xl border border-[#d7c8b8] bg-white px-5 py-3 text-base font-semibold text-[#3b2f27] shadow-sm hover:bg-[#fff8ef]"
      >
        📅 Today
      </button>
    </section>
  );
}
