"use client";

import type { RecognitionPlannedEffect } from "@/lib/recognition/types";

type CelebrationEffectsProps = {
  effect: RecognitionPlannedEffect | null;
  onDismiss?: () => void;
};

/** Subtle, dismissible celebration visuals — never blocking. */
export function CelebrationEffects({ effect, onDismiss }: CelebrationEffectsProps) {
  if (!effect) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-3"
      aria-hidden
    >
      <div className="pointer-events-auto relative w-full max-w-md">
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="absolute -right-1 -top-1 z-10 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-[#6b635a] shadow-sm hover:bg-white"
            aria-label="Dismiss celebration effects"
          >
            ×
          </button>
        ) : null}

        {effect === "confetti" ? <ConfettiLayer /> : null}
        {effect === "fireworks" ? <FireworksLayer /> : null}
        {effect === "birthday_cake" ? <CandlesLayer /> : null}
        {effect === "balloons" ? <BalloonsLayer /> : null}
        {effect === "celebration_banner" ? <BannerLayer /> : null}
      </div>
    </div>
  );
}

function ConfettiLayer() {
  return (
    <div className="recognition-confetti h-16 w-full overflow-hidden rounded-b-xl opacity-80">
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="recognition-confetti-piece"
          style={{
            left: `${8 + i * 7}%`,
            animationDelay: `${i * 0.12}s`,
            background:
              i % 3 === 0 ? "#1e4f4f" : i % 3 === 1 ? "#d4a574" : "#9a6fb0",
          }}
        />
      ))}
    </div>
  );
}

function FireworksLayer() {
  return (
    <div className="flex h-14 items-end justify-center gap-6 opacity-70">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="recognition-firework"
          style={{ animationDelay: `${i * 0.35}s` }}
        />
      ))}
    </div>
  );
}

function CandlesLayer() {
  return (
    <div className="flex h-12 items-end justify-center gap-2 opacity-90">
      {["🕯️", "🎂", "🕯️"].map((emoji, i) => (
        <span key={i} className="recognition-candle text-xl">
          {emoji}
        </span>
      ))}
    </div>
  );
}

function BalloonsLayer() {
  return (
    <div className="flex h-14 items-end justify-center gap-3 opacity-85">
      {["🎈", "🎈", "🎈"].map((emoji, i) => (
        <span
          key={i}
          className="recognition-balloon text-2xl"
          style={{ animationDelay: `${i * 0.2}s` }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}

function BannerLayer() {
  return (
    <div className="recognition-banner rounded-xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/10 px-4 py-2 text-center text-sm font-semibold text-[#1e4f4f]">
      ✨ A moment worth marking ✨
    </div>
  );
}
