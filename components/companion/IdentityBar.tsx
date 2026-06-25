"use client";

import { useEffect, useState } from "react";
import { PRESENCE_LINES, type EmotionalState } from "@/lib/companionEmotions";
import { BRAND } from "@/lib/companionUi";
import type { AppSection } from "@/lib/companionUi";
import type { RecognitionMoment } from "@/lib/recognition/types";
import type { RecoveryLevel } from "@/lib/recovery-intelligence/types";
import { useVisualMode } from "@/lib/useVisualMode";
import { getMemberSinceIso } from "@/lib/shariMemberSince";
import { useCompanionPresence } from "@/lib/useCompanionPresence";
import { ShariPortrait } from "@/components/companion/ShariPortrait";

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
  calmHome?: boolean;
  photoError: boolean;
  logoError: boolean;
  onPhotoError: () => void;
  onLogoError: () => void;
  compact?: boolean;
  resumeLine?: string | null;
  onResumeClick?: () => void;
  userBirthday?: { month: number; day: number } | null;
  recognitionMoment?: RecognitionMoment | null;
  recoveryLevel?: RecoveryLevel | null;
  focusMode?: boolean;
  recognitionWin?: boolean;
  welcomeLine?: string | null;
  onDismissWelcome?: () => void;
  primaryQuestion?: string | null;
  welcomeBack?: boolean;
  workspacePanel?: AppSection | null;
  workspaceActiveBeside?: boolean;
  isThinking?: boolean;
};

export function IdentityBar({
  emotion,
  photoError,
  onPhotoError,
  resumeLine,
  onResumeClick,
  compact = false,
  calmHome = false,
  userBirthday = null,
  recognitionMoment = null,
  recoveryLevel = null,
  focusMode = false,
  recognitionWin = false,
  welcomeLine = null,
  onDismissWelcome,
  primaryQuestion = null,
  welcomeBack = false,
  workspacePanel = null,
  workspaceActiveBeside = false,
  isThinking = false,
}: IdentityBarProps) {
  const effectiveWelcome = calmHome ? null : welcomeLine;
  const effectivePrimary =
    calmHome && welcomeBack
      ? "Welcome back"
      : calmHome
        ? null
        : primaryQuestion;
  const status = effectivePrimary
    ? effectivePrimary
    : resumeLine
      ? resumeLine
      : effectiveWelcome
        ? effectiveWelcome
        : emotion === "unclear"
          ? "Tell me how I can help"
          : (PRESENCE_LINES[emotion] ?? "I'm here with you");
  const visualMode = useVisualMode();
  const ring =
    visualMode === "off"
      ? "#b8a98f"
      : visualMode === "meaning"
        ? "#1e4f4f"
        : RING[emotion] ?? "#d4a574";

  const [memberSince, setMemberSince] = useState<string | null>(null);

  useEffect(() => {
    setMemberSince(getMemberSinceIso());
  }, []);

  const presence = useCompanionPresence({
    compact,
    calmHome,
    emotion,
    userBirthday,
    recognitionMoment: calmHome ? null : recognitionMoment,
    recoveryLevel: calmHome ? null : recoveryLevel,
    focusMode: calmHome ? false : focusMode,
    recognitionWin: calmHome ? false : recognitionWin,
    memberSince,
    workspacePanel,
    workspaceActiveBeside,
    isThinking,
  });

  if (photoError) {
    const dim = compact ? "h-10 w-10 text-sm" : "h-24 w-24 text-2xl";
    const fallback = (
      <div
        className={`flex ${dim} items-center justify-center rounded-full bg-gradient-to-br from-[#e8dfd4] to-[#d4c8b8] font-semibold text-[#5c534a]`}
      >
        S
      </div>
    );

    if (compact) {
      return (
        <header className="identity-bar identity-bar-compact shrink-0 px-4 py-2.5 sm:px-6">
          <div className="mx-auto flex max-w-xl items-center justify-center gap-3">
            <div
              className="presence-glow shrink-0 rounded-full p-0.5"
              style={{ boxShadow: `0 0 0 2px ${ring}55, 0 0 12px ${ring}28` }}
            >
              {fallback}
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
            className="presence-glow rounded-full p-1"
            style={{ boxShadow: `0 0 0 4px ${ring}55, 0 0 24px ${ring}33` }}
          >
            {fallback}
          </div>
          <p className="mt-4 text-2xl font-semibold text-[#1f1c19]">
            Hi, I&apos;m Shari
          </p>
          <p className="mt-0.5 text-base text-[#1e4f4f]">{BRAND.tagline}</p>
          <p className="mt-2 text-lg italic text-[#6b635a]">{status}</p>
        </div>
      </header>
    );
  }

  if (compact) {
    return (
      <header className="identity-bar identity-bar-compact shrink-0 px-4 py-2.5 sm:px-6">
        <div className="mx-auto flex max-w-xl items-center justify-center gap-3">
          <div
            className="presence-glow shrink-0 rounded-full p-0.5 transition-shadow duration-700"
            style={{ boxShadow: `0 0 0 2px ${ring}55, 0 0 12px ${ring}28` }}
          >
            <ShariPortrait
              presence={presence}
              size="compact"
              ringColor={ring}
              onError={onPhotoError}
            />
          </div>
          <p className="text-base italic leading-snug text-[#6b635a]">
            {isThinking && presence.thinkingMessage
              ? presence.thinkingMessage
              : status}
          </p>
        </div>
      </header>
    );
  }

  return (
    <header className="identity-bar shrink-0 px-4 py-6 text-center sm:py-8">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <ShariPortrait
          presence={presence}
          size="standard"
          ringColor={ring}
          onError={onPhotoError}
        />

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
                effectivePrimary || calmHome
                  ? "font-semibold text-[#1f1c19] not-italic"
                  : "italic text-[#6b635a]"
              }`}
            >
              {isThinking && presence.thinkingMessage
                ? presence.thinkingMessage
                : status}
            </p>
            {effectiveWelcome && onDismissWelcome ? (
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
