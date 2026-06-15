"use client";

import { useState } from "react";
import { hasUserOnboarded, markUserOnboarded } from "@/lib/companionOnboarding";

type HomeOnboardingOfferProps = {
  userId: string | undefined;
  onSetup: () => void;
};

/** Optional one-line onboarding invite on calm home — no cards, no pressure. */
export function HomeOnboardingOffer({
  userId,
  onSetup,
}: HomeOnboardingOfferProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !userId || hasUserOnboarded(userId)) return null;

  return (
    <p className="mt-3 text-center text-sm text-[#6b635a]">
      New here?{" "}
      <button
        type="button"
        onClick={onSetup}
        className="font-semibold text-[#1e4f4f] underline decoration-[#1e4f4f]/35 underline-offset-2 hover:decoration-[#1e4f4f]"
      >
        Quick setup
      </button>{" "}
      helps me support you better.{" "}
      <button
        type="button"
        onClick={() => {
          markUserOnboarded(userId);
          setDismissed(true);
        }}
        className="text-[#9a8f82] underline decoration-[#9a8f82]/35 underline-offset-2 hover:text-[#6b635a]"
      >
        Skip for now
      </button>
    </p>
  );
}
