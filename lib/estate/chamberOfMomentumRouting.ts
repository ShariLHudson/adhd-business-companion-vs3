/**
 * Chamber of Momentum™ — intent routing (Phase 2–3).
 * Members describe what they need; the system routes internally.
 *
 * @see docs/protocols/CHAMBER_OF_MOMENTUM_ROUTING_AND_EXPERIENCE_ALIGNMENT_PHASE2.md
 * @see docs/protocols/CHAMBER_OF_MOMENTUM_ENTRY_EXPERIENCE_SPECIFICATION_PHASE3.md
 * @see docs/protocols/CHAMBER_OF_MOMENTUM_INTELLIGENCE_DECISION_LOGIC_SPECIFICATION_PHASE5.md
 * @see docs/protocols/CHAMBER_OF_MOMENTUM_DEMO_EXPERIENCE_AND_VISUAL_ROOM_SPECIFICATION_PHASE7.md
 */

import type { AppSection } from "@/lib/companionUi";
import { assessChamberMomentum } from "./chamberOfMomentumIntelligence";
import { CHAMBER_OF_MOMENTUM_ROOM_META } from "./chamber/chamberOfMomentumRoomRegistry";

export const CHAMBER_MOMENTUM_SESSION_INTENT_KEY =
  "chamber-momentum-pending-intent";

export type ChamberMomentumIntent =
  | "learn"
  | "build"
  | "execute"
  | "idea"
  | "plan";

export type ChamberUnsureOption =
  | "clear-my-mind"
  | "quick-capture"
  | "small-first-step";

export const CHAMBER_WELCOME_TITLE = CHAMBER_OF_MOMENTUM_ROOM_META.title;

export const CHAMBER_WELCOME_SUBTITLE = CHAMBER_OF_MOMENTUM_ROOM_META.subtitle;

export const CHAMBER_ENTRY_PROMPT =
  "What would help you move forward today?";

export const CHAMBER_UNSURE_HEADING = "Not sure where to start?";

export const CHAMBER_UNSURE_PROMPT =
  "That's okay. Let's figure out the easiest next step.";

export type ChamberEntryOption = {
  id: ChamberMomentumIntent;
  emoji: string;
  label: string;
  hint: string;
};

export const CHAMBER_ENTRY_OPTIONS: readonly ChamberEntryOption[] = [
  {
    id: "idea",
    emoji: "💡",
    label: "I have an idea",
    hint: "Capture and explore ideas.",
  },
  {
    id: "build",
    emoji: "🌪",
    label: "I feel stuck",
    hint: "Get unstuck and find the next step.",
  },
  {
    id: "plan",
    emoji: "📋",
    label: "I need a plan",
    hint: "Create structure.",
  },
  {
    id: "learn",
    emoji: "📚",
    label: "I want to learn",
    hint: "Build knowledge and skills.",
  },
  {
    id: "execute",
    emoji: "🚀",
    label: "I want to work on a project",
    hint: "Move an existing goal forward.",
  },
] as const;

export type ChamberUnsureEntryOption = {
  id: ChamberUnsureOption;
  label: string;
  hint: string;
};

export const CHAMBER_UNSURE_OPTIONS: readonly ChamberUnsureEntryOption[] = [
  {
    id: "clear-my-mind",
    label: "Clear My Mind",
    hint: "Unload what's swirling — no sorting required.",
  },
  {
    id: "quick-capture",
    label: "Quick Brain Capture",
    hint: "Park one thought and keep moving.",
  },
  {
    id: "small-first-step",
    label: "Small First Step",
    hint: "What's one tiny step that would help right now?",
  },
] as const;

/** Map member intent to the existing internal shell section. */
export function chamberMomentumIntentSection(
  intent: ChamberMomentumIntent,
): AppSection {
  switch (intent) {
    case "learn":
      return "momentum-institute";
    case "execute":
      return "chamber-project-entry";
    case "idea":
      return "evidence-bank";
    case "plan":
    case "build":
    default:
      return "momentum-builder";
  }
}

export function chamberUnsureOptionSection(
  option: ChamberUnsureOption,
): AppSection {
  switch (option) {
    case "clear-my-mind":
    case "quick-capture":
      return "brain-dump";
    case "small-first-step":
      return "momentum-builder";
  }
}

/** Classify natural-language momentum needs for demo routing. */
export function classifyChamberMomentumIntent(
  text: string,
): ChamberMomentumIntent | null {
  return assessChamberMomentum(text)?.intent ?? null;
}

export function isChamberUnsurePhrase(text: string): boolean {
  return /\bi don'?t know\b/i.test(text.trim());
}

export function stageChamberMomentumIntent(intent: ChamberMomentumIntent): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CHAMBER_MOMENTUM_SESSION_INTENT_KEY, intent);
  } catch {
    /* quota */
  }
}

export function consumeChamberMomentumIntent(): ChamberMomentumIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CHAMBER_MOMENTUM_SESSION_INTENT_KEY);
    sessionStorage.removeItem(CHAMBER_MOMENTUM_SESSION_INTENT_KEY);
    if (
      raw === "learn" ||
      raw === "build" ||
      raw === "execute" ||
      raw === "idea" ||
      raw === "plan"
    ) {
      return raw;
    }
    return null;
  } catch {
    return null;
  }
}

export function peekChamberMomentumIntent(): ChamberMomentumIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CHAMBER_MOMENTUM_SESSION_INTENT_KEY);
    if (
      raw === "learn" ||
      raw === "build" ||
      raw === "execute" ||
      raw === "idea" ||
      raw === "plan"
    ) {
      return raw;
    }
    return null;
  } catch {
    return null;
  }
}
