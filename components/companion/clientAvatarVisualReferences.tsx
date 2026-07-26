"use client";

import type { ReactNode } from "react";
import type { ClientAvatarVisualReferenceId } from "@/lib/clientAvatarVisualReferences";

/**
 * Estate-style symbolic archetype emblems — one cohesive line style
 * (currentColor, stroke 1.5, round joins) on a 24×24 canvas, so they inherit
 * the teal ink of ClientAvatarMark. Each depicts an object / context of a way
 * of working — never a person's face or an emoji. When no archetype is chosen,
 * a neutral estate dossier emblem is shown (never initials as the default).
 */
const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Neutral default — an estate dossier folder. */
const DEFAULT_GLYPH: ReactNode = (
  <>
    <path
      d="M4.5 7.7a1.5 1.5 0 0 1 1.5-1.5h3.1l1.5 2h7.9a1.5 1.5 0 0 1 1.5 1.5v7.8a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5Z"
      {...S}
    />
    <path d="M4.5 11.4h15" {...S} />
  </>
);

const GLYPHS: Record<ClientAvatarVisualReferenceId, ReactNode> = {
  // Coach or advisor — a guiding lantern.
  coach: (
    <>
      <path d="M9.5 5c0-1 1-1.6 2.5-1.6S14.5 4 14.5 5" {...S} />
      <rect x="8" y="6" width="8" height="11.5" rx="2" {...S} />
      <path d="M8.4 9.2h7.2" {...S} />
      <path d="M12 11c-1 .9-1 2.1 0 3 1-.9 1-2.1 0-3Z" {...S} />
      <path d="M10.3 19.2h3.4" {...S} />
    </>
  ),
  // Consultant — a leather portfolio.
  consultant: (
    <>
      <rect x="4" y="8" width="16" height="11" rx="2" {...S} />
      <path d="M9 8V6.6A1.6 1.6 0 0 1 10.6 5h2.8A1.6 1.6 0 0 1 15 6.6V8" {...S} />
      <path d="M4 12.6h16" {...S} />
      <rect x="10.8" y="11.4" width="2.4" height="2.6" rx="0.6" {...S} />
    </>
  ),
  // Author — an open book.
  author: (
    <>
      <path
        d="M12 6.6C10.4 5.7 8.3 5.3 6.4 5.5A1 1 0 0 0 5.5 6.5v10.4c1.9-.2 4.5.1 6.5 1.1 2-1 4.6-1.3 6.5-1.1V6.5a1 1 0 0 0-.9-1c-1.9-.2-4 .2-5.6 1.1Z"
        {...S}
      />
      <path d="M12 6.6V18" {...S} />
    </>
  ),
  // Speaker — a lectern with a microphone.
  speaker: (
    <>
      <path d="M8.5 9h7l-1.4 5.2h-4.2Z" {...S} />
      <path d="M12 14.2v5.3" {...S} />
      <path d="M8.6 19.5h6.8" {...S} />
      <circle cx="12" cy="5.4" r="1.5" {...S} />
      <path d="M12 6.9v2" {...S} />
    </>
  ),
  // Service business — a service bell.
  service: (
    <>
      <path d="M5.5 15.5a6.5 6.5 0 0 1 13 0Z" {...S} />
      <path d="M4.2 15.5h15.6" {...S} />
      <path d="M4.6 18h14.8" {...S} />
      <path d="M12 9V7.2" {...S} />
      <circle cx="12" cy="6" r="1" {...S} />
    </>
  ),
  // Creative founder — an easel with canvas.
  creative: (
    <>
      <path d="M7 20 9 6.5h6L17 20" {...S} />
      <path d="M12 6.5V4.4" {...S} />
      <rect x="8.3" y="7.2" width="7.4" height="6.4" rx="0.6" {...S} />
      <path d="M8.6 16h6.8" {...S} />
    </>
  ),
  // Entrepreneur — a compass.
  entrepreneur: (
    <>
      <circle cx="12" cy="12" r="8" {...S} />
      <path d="M12 6 13.6 12 12 18 10.4 12Z" {...S} />
      <circle cx="12" cy="12" r="1" {...S} />
    </>
  ),
  // Online business builder — a laptop.
  online: (
    <>
      <rect x="6" y="6" width="12" height="8" rx="1.2" {...S} />
      <path d="M8.4 8.6h7.2" {...S} />
      <path d="M4 17.5h16l-1.1-2.2a1 1 0 0 0-.9-.6H6a1 1 0 0 0-.9.6Z" {...S} />
    </>
  ),
  // Hands-on maker — maker tools (wrench + hammer).
  maker: (
    <>
      <path
        d="M13.8 6.7a3.4 3.4 0 0 0-4.3 4.2l-4.1 4.1a1.4 1.4 0 0 0 2 2l4.1-4.1a3.4 3.4 0 0 0 4.2-4.3l-1.9 1.9-1.7-.4-.4-1.7Z"
        {...S}
      />
      <path d="M14.5 14.5 18.5 18.5" {...S} />
    </>
  ),
  // Community or nonprofit leader — a gathering table.
  community: (
    <>
      <circle cx="12" cy="12" r="3.6" {...S} />
      <circle cx="12" cy="5.4" r="1.4" {...S} />
      <circle cx="12" cy="18.6" r="1.4" {...S} />
      <circle cx="5.4" cy="12" r="1.4" {...S} />
      <circle cx="18.6" cy="12" r="1.4" {...S} />
    </>
  ),
};

/**
 * Renders the chosen archetype emblem, or the neutral estate dossier default
 * when no archetype is selected.
 */
export function ClientAvatarVisualGlyph({
  referenceId,
  px,
}: {
  referenceId?: ClientAvatarVisualReferenceId;
  px: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={px}
      height={px}
      aria-hidden="true"
      focusable="false"
    >
      {referenceId ? GLYPHS[referenceId] : DEFAULT_GLYPH}
    </svg>
  );
}
