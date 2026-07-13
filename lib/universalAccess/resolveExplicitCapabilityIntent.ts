/**
 * Intent-first capability resolution (#183 Universal Access).
 * Member intent and explicit commands always beat current room/page.
 */

import type { AppSection } from "@/lib/companionUi";
import { detectOpenSectionRequest } from "@/lib/pendingAction";
import {
  detectUniversalCapabilityRequest,
  type UniversalCapabilityId,
  type UniversalCapabilityRequest,
} from "./detectUniversalCapabilityRequest";
import { pickUniversalAccessFulfillLine } from "./universalAccessStandard";

const SECTION_TO_CAPABILITY: Partial<
  Record<AppSection, { id: UniversalCapabilityId; nav?: string; ackSeed: number }>
> = {
  "time-block": { id: "calendar", nav: "create", ackSeed: 2 },
  "brain-dump": { id: "clear-my-mind", nav: "clear-my-mind", ackSeed: 1 },
  "content-generator": { id: "content-create", nav: "create", ackSeed: 0 },
  projects: { id: "projects", nav: "create", ackSeed: 3 },
  "saved-work": { id: "saved-work", nav: "saved-work", ackSeed: 1 },
  "templates-library": { id: "templates", nav: "templates", ackSeed: 2 },
  playbook: { id: "strategies", nav: "playbook", ackSeed: 3 },
  "focus-audio": { id: "peaceful-places", nav: "focus", ackSeed: 3 },
  breathe: { id: "breathe", ackSeed: 2 },
  "client-avatars": { id: "client-avatars", nav: "create", ackSeed: 0 },
  "visual-focus": { id: "visual-thinking", nav: "visual-thinking", ackSeed: 0 },
  "focus-timer": { id: "focus-timer", nav: "focus", ackSeed: 1 },
  "growth-journal": { id: "journal", nav: "journal", ackSeed: 0 },
  "evidence-bank": { id: "evidence-vault", nav: "evidence-bank", ackSeed: 1 },
  "the-gallery": { id: "destination-gallery", nav: "create", ackSeed: 2 },
  "destination-gallery": { id: "destination-gallery", nav: "create", ackSeed: 2 },
  "decision-compass": { id: "decision-compass", nav: "create", ackSeed: 0 },
  "plan-my-day": { id: "plan-my-day", nav: "plan-my-day", ackSeed: 1 },
  "quick-recharge": { id: "momentum-games", nav: "focus", ackSeed: 1 },
  "spin-wheel": { id: "spin-wheel", nav: "focus", ackSeed: 2 },
};

/**
 * Resolve an explicit capability launch from member text.
 * Order: universal detector → open-section phrases → null.
 * Soft chatter without open/start intent returns null.
 */
export function resolveExplicitCapabilityIntent(
  text: string,
): UniversalCapabilityRequest | null {
  /** #184 Spark Visual Engine + #183 Universal Access — visual views first. */
  const universal = detectUniversalCapabilityRequest(text);
  if (universal) return universal;

  const section = detectOpenSectionRequest(text);
  if (!section) return null;

  const mapped = SECTION_TO_CAPABILITY[section];
  if (!mapped) return null;

  return {
    capabilityId: mapped.id,
    section,
    nav: mapped.nav,
    ack: pickUniversalAccessFulfillLine(mapped.ackSeed),
  };
}

/** True when text is an explicit capability / workspace open (intent-first). */
export function isExplicitCapabilityIntent(text: string): boolean {
  return resolveExplicitCapabilityIntent(text) !== null;
}
