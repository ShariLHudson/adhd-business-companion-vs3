/**
 * Contextual fulfill lines for Universal Access — never vague placeholders.
 */

import type { UniversalCapabilityId } from "./detectUniversalCapabilityRequest";

const CAPABILITY_ACK: Record<UniversalCapabilityId, string> = {
  "clear-my-mind": "Let's clear your mind together.",
  "visual-thinking": "Let's open Visual Thinking beside us.",
  "focus-timer": "Starting your focus timer.",
  calendar: "I'll open your calendar.",
  projects: "Opening your projects.",
  journal: "Your journal is ready.",
  "evidence-vault": "Opening your Evidence Vault.",
  "destination-gallery": "Opening the Destination Gallery.",
  "decision-compass": "Let's open Decision Compass.",
  "plan-my-day": "Let's open Plan My Day.",
  breathe: "Let's breathe together — follow along on screen.",
  "peaceful-places": "Opening Peaceful Places.",
  "google-workspace": "Opening Google Workspace.",
  "content-create": "Let's open Create.",
  strategies: "Opening Strategies.",
  "saved-work": "Opening your saved work.",
  templates: "Opening templates.",
  "client-avatars": "Opening Client Avatars.",
  "momentum-games": "Opening Momentum Games.",
  "spin-wheel": "Let's give it a spin.",
};

export function ackForUniversalCapability(
  capabilityId: UniversalCapabilityId,
): string {
  return CAPABILITY_ACK[capabilityId] ?? "I can do that.";
}
