/**
 * Chamber of Momentum™ — intent routing (Phase 2).
 * Members describe what they need; the system routes internally.
 *
 * @see docs/protocols/CHAMBER_OF_MOMENTUM_ROUTING_AND_EXPERIENCE_ALIGNMENT_PHASE2.md
 */

import type { AppSection } from "@/lib/companionUi";

export const CHAMBER_MOMENTUM_SESSION_INTENT_KEY =
  "chamber-momentum-pending-intent";

export type ChamberMomentumIntent =
  | "learn"
  | "build"
  | "execute"
  | "idea"
  | "plan";

export const CHAMBER_ENTRY_PROMPT =
  "What would help you move forward today?";

export type ChamberEntryOption = {
  id: ChamberMomentumIntent;
  label: string;
  hint: string;
};

export const CHAMBER_ENTRY_OPTIONS: readonly ChamberEntryOption[] = [
  {
    id: "idea",
    label: "I have an idea",
    hint: "Capture momentum from a spark of inspiration.",
  },
  {
    id: "build",
    label: "I feel stuck",
    hint: "Conversation-first coaching — one step at a time.",
  },
  {
    id: "plan",
    label: "I need a plan",
    hint: "Shape today's path and name the next honest step.",
  },
  {
    id: "learn",
    label: "I want to learn",
    hint: "Knowledge Cards™, drawers, and capability building.",
  },
  {
    id: "execute",
    label: "I need to work on a project",
    hint: "Projects, tasks, next actions, and plans.",
  },
] as const;

export const CHAMBER_INTERNAL_ACCESS_OPTIONS = [
  { id: "learn" as const, label: "Learn Momentum" },
  { id: "build" as const, label: "Build Momentum" },
  { id: "execute" as const, label: "Manage Projects" },
] as const;

/** Map member intent to the existing internal shell section. */
export function chamberMomentumIntentSection(
  intent: ChamberMomentumIntent,
): AppSection {
  switch (intent) {
    case "learn":
      return "momentum-institute";
    case "execute":
      return "projects";
    case "idea":
    case "plan":
    case "build":
    default:
      return "momentum-builder";
  }
}

/** Classify natural-language momentum needs for demo routing. */
export function classifyChamberMomentumIntent(
  text: string,
): ChamberMomentumIntent | null {
  const t = text.trim();
  if (!t) return null;

  if (
    /\b(?:teach me|i want to learn|how do i improve|learn something|help me learn|want to learn)\b/i.test(
      t,
    )
  ) {
    return "learn";
  }

  if (
    /\b(?:finish my|complete (?:this )?project|work on (?:a )?project|break (?:this )?down|help me finish|need to finish)\b/i.test(
      t,
    )
  ) {
    return "execute";
  }

  if (
    /\b(?:overwhelm(?:ed)?|stuck|don'?t know where to start|need help moving forward|feel stuck|i need a plan|need a plan)\b/i.test(
      t,
    )
  ) {
    return "build";
  }

  if (/\bi have an idea\b/i.test(t)) return "idea";

  return null;
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
