/**
 * Presentation layer — formats brain judgment for UI. No reasoning.
 */

import type {
  CompanionJudgmentResult,
  CompanionProposal,
  DayMode,
  MorningPresenceResult,
} from "@/lib/companionBrain";
import { formatMorningPresencePlain } from "@/lib/companionBrain";
import type { PlanDayItem } from "@/lib/planMyDay/types";
import { isPlanItemActive } from "@/lib/planMyDay/planDayItems";
import { FOCUS_CAP, READY_CAP } from "./curateLivingBoard";

/** Gateway partnership copy — recommendation, not approval. */
export const GATEWAY_CONFIRM_PROMPT =
  "Does this feel like the right direction for today?";
export const GATEWAY_YES_FEELS_RIGHT = "Yes — This feels right";
export const GATEWAY_ADJUST_TOGETHER = "Adapt My Day";
export const GATEWAY_NOT_RIGHT_NOW = "Not Right Now";

export type PlanDayOrientationPresentation = {
  /** Morning Presence — Shari noticing before guidance */
  morningPresence: MorningPresenceResult;
  /** Plain companion line — accessibility / legacy */
  shariMessage: string;
  /** One invitation — reduces thinking */
  invitation: string;
  /** Compact preview of judgment before confirm */
  proposalPreview: string[];
  /** Gentle confirm question before actions */
  confirmPrompt: string | null;
  /** Primary confirmation label */
  primaryConfirmLabel: string;
  /** Collaborative reshape — not rejection */
  adjustTogetherLabel: string;
  /** Gentle deferral without disappointing the companion */
  deferLabel: string;
  dayMode: DayMode;
  /** Hyperfocus / celebration — minimal surface */
  minimalSurface: boolean;
  /** Whether confirming materializes proposals */
  willMaterialize: boolean;
};

const SYSTEM_READOUT_RE =
  /^(?:Here'?s today|Today) — (.+) energy, (.+) motivation\.?$/i;

function shariObservationFromCapacity(
  energy: string,
  motivation: string,
): string {
  const e = energy.toLowerCase().trim();
  const m = motivation.toLowerCase().trim();

  if (
    (e === "high" || e === "medium-high") &&
    (m === "excited" || m === "focused")
  ) {
    return "You've got real energy today — let's use it well.";
  }
  if (e === "high") {
    return "You're coming in with strong energy today. I don't want to overload that.";
  }
  if (e === "medium-high" || e === "medium") {
    if (m === "excited" || m === "focused") {
      return "Today has some spark in it. Let's give it a shape.";
    }
    return "There's good energy here today. Let's shape it carefully.";
  }
  if (m === "excited" || m === "focused") {
    return "Today has some spark in it. Let's give it a shape.";
  }
  if (m === "overwhelmed" || m === "scattered") {
    return "A lot is pulling at you today. I'll keep the shape small.";
  }
  if (e === "low") {
    return "Today's a quieter kind of day. I'll keep things honest and small.";
  }
  return "Let's start from what's actually true right now.";
}

/**
 * One observation only — never a summary, report, or multi-paragraph dump.
 */
export function formatSingleShariMessage(
  judgment: CompanionJudgmentResult,
): string {
  const { orientation, confidence, cycleState } = judgment;

  if (cycleState === "protected") {
    return (
      orientation.paragraphs[0] ??
      "You're in deep work. I won't replan in the middle of that."
    );
  }

  const primary = orientation.paragraphs[0];
  const readout = primary?.match(SYSTEM_READOUT_RE);
  if (readout) {
    return shariObservationFromCapacity(readout[1]!, readout[2]!);
  }

  if (primary) return primary;

  if (confidence.encouragement?.trim()) {
    return confidence.encouragement;
  }

  return "Let's start from what's actually true right now.";
}

export function proposalPreviewLabels(
  judgment: CompanionJudgmentResult,
): string[] {
  return judgment.proposals.slice(0, 3).map((p) => p.label);
}

export function gatewayConfirmPrompt(
  judgment: CompanionJudgmentResult,
): string | null {
  if (judgment.cycleState === "protected") return null;
  if (judgment.dayMode === "celebration") return null;
  if (judgment.proposals.length === 0) return null;
  return GATEWAY_CONFIRM_PROMPT;
}

export function formatInvitation(judgment: CompanionJudgmentResult): string {
  const { dayMode, proposals, permission, cycleState, orientationOnly } =
    judgment;

  if (cycleState === "protected") {
    return "I'll be here when you're ready to come up for air.";
  }
  if (dayMode === "celebration") {
    return "Today is yours — the win gets to be the whole story.";
  }
  if (dayMode === "recovery" || dayMode === "survival") {
    return "I think today needs to stay gentle.";
  }
  if (orientationOnly) {
    return "One thing — or we pause here. Both are fine.";
  }
  if (permission.summaryCount > 0 && proposals.length === 0) {
    return "I've already set a few things aside for you.";
  }
  const n = proposals.length;
  if (n === 0) {
    return "I don't have a task list waiting — I have space.";
  }
  if (n === 1) {
    return "I think there's one thing worth your attention today.";
  }
  return `I think there are ${n} things worth your attention today.`;
}

/** Stale judgments (e.g. HMR) may predate Morning Presence */
function resolveMorningPresence(
  judgment: CompanionJudgmentResult,
): MorningPresenceResult {
  const presence = judgment.morningPresence;
  if (presence?.lines?.length) return presence;

  const fallback = formatSingleShariMessage(judgment);
  return {
    lead: null,
    lines: fallback
      ? [fallback]
      : ["Let's start from what's actually true right now."],
  };
}

export function primaryConfirmLabel(judgment: CompanionJudgmentResult): string {
  if (judgment.cycleState === "protected") return "Continue";
  if (judgment.dayMode === "celebration") return "Enjoy today";
  if (
    judgment.proposals.length > 0 &&
    judgment.materializeAllowed
  ) {
    return GATEWAY_YES_FEELS_RIGHT;
  }
  return "I'm ready";
}

export function presentPlanDayOrientation(
  judgment: CompanionJudgmentResult,
): PlanDayOrientationPresentation {
  const willMaterialize =
    judgment.cycleState !== "protected" &&
    judgment.proposals.length > 0 &&
    judgment.materializeAllowed;

  const morningPresence = resolveMorningPresence(judgment);

  return {
    morningPresence,
    shariMessage: formatMorningPresencePlain(morningPresence),
    invitation: formatInvitation(judgment),
    proposalPreview: proposalPreviewLabels(judgment),
    confirmPrompt: gatewayConfirmPrompt(judgment),
    primaryConfirmLabel: primaryConfirmLabel(judgment),
    adjustTogetherLabel: GATEWAY_ADJUST_TOGETHER,
    deferLabel: GATEWAY_NOT_RIGHT_NOW,
    dayMode: judgment.dayMode,
    minimalSurface:
      judgment.cycleState === "protected" ||
      judgment.dayMode === "celebration" ||
      judgment.dayMode === "hyperfocus",
    willMaterialize,
  };
}

export function proposalDurationLabel(proposal: CompanionProposal): string | null {
  if (!proposal.durationMinutes) return null;
  return `${proposal.durationMinutes} min`;
}

export function dayModeAtmosphereClass(dayMode: DayMode): string {
  return `plan-day-atmosphere plan-day-atmosphere--${dayMode}`;
}

export function shouldSkipOrientation(
  sessionPhase: "orienting" | "living" | "flexible",
  openItemId?: string | null,
  hasMeaningfulPlanToday?: boolean,
): boolean {
  if (openItemId) return true;
  if (hasMeaningfulPlanToday) return true;
  return sessionPhase === "living";
}
export type LivingBoardPartition = {
  focus: PlanDayItem[];
  ready: PlanDayItem[];
  holding: PlanDayItem[];
  holdingCount: number;
  momentumLabel: string | null;
};

/** Living Board grouping — presentation only. */
export function partitionLivingBoard(
  items: PlanDayItem[],
  momentumLabel: string | null,
): LivingBoardPartition {
  const active = items.filter(isPlanItemActive);
  const momentumKey = momentumLabel?.trim().toLowerCase() ?? "";

  function momentumFirst(list: PlanDayItem[]): PlanDayItem[] {
    if (!momentumKey) return list;
    return [...list].sort((a, b) => {
      const aMatch = a.title.toLowerCase().includes(momentumKey);
      const bMatch = b.title.toLowerCase().includes(momentumKey);
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
  }

  const held = items.filter((i) => !i.done && i.column === "parked");

  return {
    focus: momentumFirst(
      active.filter((i) => i.column === "today" || i.column === "doing"),
    ).slice(0, FOCUS_CAP),
    ready: momentumFirst(active.filter((i) => i.column === "ready")).slice(
      0,
      READY_CAP,
    ),
    holding: held,
    holdingCount: held.length,
    momentumLabel,
  };
}

export function livingBoardSubtitle(
  judgment: CompanionJudgmentResult,
  confirmed: boolean,
): string | null {
  if (!confirmed) return null;
  if (judgment.momentum.label) {
    return `If one thing matters: ${judgment.momentum.label}`;
  }
  if (judgment.dayMode === "celebration") {
    return "Nothing else is required today.";
  }
  if (judgment.dayMode === "recovery" || judgment.dayMode === "survival") {
    return "Small is honest today.";
  }
  return null;
}
