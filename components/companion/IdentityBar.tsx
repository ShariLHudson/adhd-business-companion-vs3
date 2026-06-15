"use client";

import { useEffect, useMemo, useState } from "react";
import { PRESENCE_LINES, type EmotionalState } from "@/lib/companionEmotions";
import { ASSETS, BRAND } from "@/lib/companionUi";
import { getShariImageState } from "@/lib/shariImageState";
import { recognitionToShariPresence } from "@/lib/recognition/shariPresenceBridge";
import type { RecognitionMoment } from "@/lib/recognition/types";
import {
  getMemberSinceIso,
  isAppAnniversaryToday,
} from "@/lib/shariMemberSince";

// A soft "mood ring" color around Shari's photo, reflecting the read on how the
// person seems.
const RING: Record<EmotionalState, string> = {
  focused: "#2e8b57",
  building: "#1e4f4f",
  overwhelmed: "#d4a574",
  emotional: "#4a6fa5",
  stuck: "#9a8f82",
  unclear: "#b8a98f",
};

type IdentityBarProps = {
  emotion: EmotionalState;
  photoError: boolean;
  logoError: boolean;
  onPhotoError: () => void;
  onLogoError: () => void;
  /** Slim header once chat is underway — conversation owns the screen. */
  compact?: boolean;
  resumeLine?: string | null;
  onResumeClick?: () => void;
  userBirthday?: { month: number; day: number } | null;
  recognitionMoment?: RecognitionMoment | null;
  /** Gentle recovery day / lighter-day support is active. */
  recoveryMode?: boolean;
  /** Focus timer or focus workspace is active. */
  focusMode?: boolean;
  /** User win / recognition moment — proud Shari. */
  recognitionWin?: boolean;
  /** Optional gentle load-awareness line for the opening welcome. */
  welcomeLine?: string | null;
  /** Dismiss the welcome line for today (cognitive load offer). */
  onDismissWelcome?: () => void;
  /** Primary question on calm home — replaces status line. */
  primaryQuestion?: string | null;
};

export function IdentityBar({
  emotion,
  photoError,
  onPhotoError,
  resumeLine,
  onResumeClick,
  compact = false,
  userBirthday = null,
  recognitionMoment = null,
  recoveryMode = false,
  focusMode = false,
  recognitionWin = false,
  welcomeLine = null,
  onDismissWelcome,
  primaryQuestion = null,
}: IdentityBarProps) {
  const status = primaryQuestion
    ? primaryQuestion
    : resumeLine
      ? resumeLine
      : welcomeLine
        ? welcomeLine
        : emotion === "unclear"
          ? "Tell me how I can help"
          : (PRESENCE_LINES[emotion] ?? "I'm here with you");
  const ring = RING[emotion] ?? "#d4a574";

  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string>(ASSETS.profile);

  useEffect(() => {
    setMemberSince(getMemberSinceIso());
  }, []);

  const presence = useMemo(() => {
    const now = new Date();
    const milestoneCelebration = isAppAnniversaryToday(memberSince, now)
      ? ("app_anniversary" as const)
      : null;
    const base = recognitionToShariPresence(recognitionMoment, {
      now,
      emotion,
      userBirthday,
      milestoneCelebration,
      recoveryMode,
      focusMode,
      recognitionWin,
    });
    return getShariImageState(base);
  }, [
    emotion,
    memberSince,
    userBirthday,
    recognitionMoment,
    recoveryMode,
    focusMode,
    recognitionWin,
  ]);

  useEffect(() => {
    if (compact) {
      setImageSrc(ASSETS.profile);
      return;
    }
    setImageSrc(presence.src);
  }, [compact, presence.src]);

  const avatar = (size: "lg" | "sm") => {
    const dim = size === "lg" ? "h-24 w-24 text-2xl" : "h-10 w-10 text-sm";
    const imgDim = size === "lg" ? 96 : 40;
    return photoError ? (
      <div
        className={`flex ${dim} items-center justify-center rounded-full bg-gradient-to-br from-[#e8dfd4] to-[#d4c8b8] font-semibold text-[#5c534a]`}
      >
        S
      </div>
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={compact ? "compact" : `${presence.state}-${imageSrc}`}
        src={imageSrc}
        alt="Shari"
        width={imgDim}
        height={imgDim}
        data-shari-state={compact ? "default" : presence.state}
        onError={() => {
          if (imageSrc !== ASSETS.profile) {
            setImageSrc(ASSETS.profile);
            return;
          }
          onPhotoError();
        }}
        className={`rounded-full object-cover ${compact ? "" : "companion-fade-in transition-opacity duration-700"} ${dim}`}
      />
    );
  };

  if (compact) {
    return (
      <header className="identity-bar identity-bar-compact shrink-0 px-4 py-2.5 sm:px-6">
        <div className="mx-auto flex max-w-xl items-center justify-center gap-3">
          <div
            className="presence-glow shrink-0 rounded-full p-0.5 transition-shadow duration-700"
            style={{ boxShadow: `0 0 0 2px ${ring}55, 0 0 12px ${ring}28` }}
          >
            {avatar("sm")}
          </div>
          <p className="text-base italic leading-snug text-[#6b635a]">{status}</p>
        </div>
      </header>
    );
  }

  return (
    <header className="identity-bar shrink-0 px-4 py-6 text-center sm:py-8">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div
          className="presence-glow rounded-full p-1 transition-shadow duration-700"
          style={{ boxShadow: `0 0 0 4px ${ring}55, 0 0 24px ${ring}33` }}
        >
          {avatar("lg")}
        </div>

        <p className="mt-4 text-2xl font-semibold text-[#1f1c19]">
          Hi, I&apos;m Shari
        </p>
        <p className="mt-0.5 text-base text-[#1e4f4f]">{BRAND.tagline}</p>
        {resumeLine && onResumeClick ? (
          <button
            type="button"
            onClick={onResumeClick}
            className="mt-2 text-lg font-semibold text-[#1e4f4f] underline decoration-[#1e4f4f]/40 underline-offset-4 hover:decoration-[#1e4f4f]"
          >
            {status} →
          </button>
        ) : (
          <>
            <p
              className={`mt-2 text-lg ${
                primaryQuestion
                  ? "font-semibold text-[#1f1c19] not-italic"
                  : "italic text-[#6b635a]"
              }`}
            >
              {status}
            </p>
            {welcomeLine && onDismissWelcome ? (
              <button
                type="button"
                onClick={onDismissWelcome}
                className="mt-1 text-sm text-[#9a8f82] underline decoration-[#9a8f82]/40 underline-offset-2 hover:text-[#6b635a]"
              >
                Not now
              </button>
            ) : null}
          </>
        )}
      </div>
    </header>
  );
}
