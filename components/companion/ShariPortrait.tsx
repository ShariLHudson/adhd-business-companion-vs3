"use client";

import { useEffect, useState } from "react";
import { ASSETS } from "@/lib/companionUi";
import type { CompanionPresenceResolved } from "@/lib/companionPresence";

type ShariPortraitProps = {
  presence: Pick<CompanionPresenceResolved, "src" | "shariImageState" | "animationState" | "expression">;
  alt?: string;
  size?:
    | "intimate"
    | "standard"
    | "compact"
    | "sidebar"
    | "in-room"
    | "presence"
    | "companion";
  ringColor?: string;
  className?: string;
  onError?: () => void;
};

const SIZE_CLASS = {
  intimate:
    "h-[7.25rem] w-[7.25rem] sm:h-[7.75rem] sm:w-[7.75rem] ring-[3px]",
  standard: "h-28 w-28 ring-4",
  compact: "h-10 w-10",
  sidebar: "h-16 w-16 ring-2",
  "in-room": "h-11 w-11 sm:h-12 sm:w-12",
  presence:
    "h-14 w-14 sm:h-[3.75rem] sm:w-[3.75rem] ring-2",
  companion:
    "h-[8.25rem] w-[8.25rem] sm:h-[8.75rem] sm:w-[8.75rem] ring-2",
} as const;

/**
 * Shared Shari portrait — real photography, subtle thinking presence only.
 */
export function ShariPortrait({
  presence,
  alt = "Shari",
  size = "standard",
  ringColor,
  className = "",
  onError,
}: ShariPortraitProps) {
  const [src, setSrc] = useState(presence.src);
  const thinking = presence.animationState === "thinking";
  const listening = presence.animationState === "listening";
  const intimate = size === "intimate";
  const compact = size === "compact";
  const companion = size === "companion";
  const inRoom = size === "in-room" || size === "presence" || companion;

  useEffect(() => {
    setSrc(presence.src);
  }, [presence.src]);

  const motionClass = thinking
    ? "companion-presence-thinking"
    : listening
      ? "companion-presence-listening"
      : "";

  const imgClass = inRoom
    ? `companion-fade-in rounded-full object-cover transition-opacity duration-700 motion-reduce:transition-none ${SIZE_CLASS[companion ? "companion" : size === "presence" ? "presence" : "in-room"]} ${
        companion
          ? "ring-2 ring-white/75 shadow-none"
          : "shadow-[0_2px_12px_rgba(47,38,31,0.08)] ring-2 ring-white/80"
      } ${motionClass}`
    : compact
      ? `rounded-full object-cover ${SIZE_CLASS.compact}`
      : `companion-fade-in rounded-full object-cover shadow-md transition-opacity duration-700 motion-reduce:transition-none ${SIZE_CLASS[size]} ring-white/90 ${
          intimate
            ? "shadow-[0_6px_24px_rgba(47,38,31,0.12)] ring-white/95"
            : size === "sidebar"
              ? "shadow-[0_4px_18px_rgba(47,38,31,0.10)]"
              : ""
        } ${motionClass}`;

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={thinking ? "thinking" : `${presence.shariImageState}-${src}`}
      src={src}
      alt={alt}
      data-shari-state={presence.shariImageState}
      data-companion-expression={presence.expression}
      data-companion-animation={presence.animationState}
      onError={() => {
        if (src !== ASSETS.profile) {
          setSrc(ASSETS.profile);
          return;
        }
        onError?.();
      }}
      className={`${imgClass} ${className}`}
    />
  );

  if (compact || inRoom) {
    return image;
  }

  return (
    <div
      className={`presence-glow rounded-full p-1 transition-shadow duration-700 ${
        thinking
          ? "companion-presence-glow-thinking"
          : listening
            ? "companion-presence-glow-listening"
            : ""
      }`}
      style={
        ringColor
          ? {
              boxShadow: `0 0 0 ${intimate ? 3 : 4}px ${ringColor}55, 0 0 ${intimate ? 18 : 24}px ${ringColor}33`,
            }
          : undefined
      }
    >
      {image}
    </div>
  );
}
