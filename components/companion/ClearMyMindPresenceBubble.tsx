"use client";

import type { CompanionPresenceResolved } from "@/lib/companionPresence";

type Props = {
  presence: CompanionPresenceResolved;
  /** Override service bubble (e.g. Shari's acknowledgment copy). */
  message?: string | null;
  className?: string;
};

/** Quiet companion speech — never loading UI. */
export function ClearMyMindPresenceBubble({
  presence,
  message,
  className = "",
}: Props) {
  if (!message) return null;

  return (
    <p
      className={`companion-fade-in text-sm leading-relaxed italic text-[#6b635a] ${className}`}
      role="status"
      aria-live="polite"
      data-companion-speech={presence.speechBubbleState}
    >
      {message}
    </p>
  );
}
