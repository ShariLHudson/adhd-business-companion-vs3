"use client";

import { useEffect, useState } from "react";
import { PRESENCE_LINES, type EmotionalState } from "@/lib/companionEmotions";
import { ASSETS, BRAND } from "@/lib/companionUi";

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

// The photo rotates through every image that exists here. To add more, drop
// JPGs into public/images/shari/ named shari-1.jpg, shari-2.jpg, … and they
// auto-join the rotation. Missing ones are skipped automatically.
const CANDIDATES = [
  ASSETS.profile, // /shari.jpg — always present
  "/images/shari/shari-1.jpg",
  "/images/shari/shari-2.jpg",
  "/images/shari/shari-3.jpg",
  "/images/shari/shari-4.jpg",
  "/images/shari/shari-5.jpg",
  "/images/shari/shari-6.jpg",
  "/images/shari/shari-7.jpg",
  "/images/shari/shari-8.jpg",
];

type IdentityBarProps = {
  emotion: EmotionalState;
  photoError: boolean;
  logoError: boolean;
  onPhotoError: () => void;
  onLogoError: () => void;
  /** Slim header once chat is underway — conversation owns the screen. */
  compact?: boolean;
  // Soft re-entry when unfinished work exists — one line only, no extra card.
  resumeLine?: string | null;
  // If memory exists, it MUST be actionable — clicking resumes the work.
  onResumeClick?: () => void;
};

export function IdentityBar({
  emotion,
  photoError,
  onPhotoError,
  resumeLine,
  onResumeClick,
  compact = false,
}: IdentityBarProps) {
  // At rest the line simply invites; once there's a felt sense it reflects it.
  const status = resumeLine
    ? resumeLine
    : emotion === "unclear"
      ? "Tell me how I can help"
      : (PRESENCE_LINES[emotion] ?? "I'm here with you");
  const ring = RING[emotion] ?? "#d4a574";

  // Discover which candidate images actually exist, then rotate through them.
  const [valid, setValid] = useState<string[]>([ASSETS.profile]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let alive = true;
    const found = new Set<string>();
    let pending = CANDIDATES.length;
    const finalize = () => {
      if (!alive) return;
      const ordered = CANDIDATES.filter((c) => found.has(c));
      setValid(ordered.length ? ordered : [ASSETS.profile]);
    };
    CANDIDATES.forEach((src) => {
      const img = new window.Image();
      img.onload = () => {
        found.add(src);
        if (--pending === 0) finalize();
      };
      img.onerror = () => {
        if (--pending === 0) finalize();
      };
      img.src = src;
    });
    return () => {
      alive = false;
    };
  }, []);

  // Gentle auto-rotate when there's more than one photo (idle welcome only).
  useEffect(() => {
    if (compact || valid.length < 2) return;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % valid.length);
    }, 9000);
    return () => window.clearInterval(id);
  }, [valid, compact]);

  const src = valid[idx % valid.length] ?? ASSETS.profile;

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
        key={src}
        src={src}
        alt="Shari"
        width={imgDim}
        height={imgDim}
        onError={() => {
          if (src === ASSETS.profile) onPhotoError();
        }}
        className={`companion-fade-in rounded-full object-cover transition-opacity duration-700 ${dim}`}
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
          <p className="mt-2 text-lg italic text-[#6b635a]">{status}</p>
        )}
      </div>
    </header>
  );
}
