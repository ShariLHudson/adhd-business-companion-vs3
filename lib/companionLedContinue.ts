/**
 * Companion-Led Continue — one intelligent entry point for calm home.
 *
 * Philosophy: the companion chooses where to resume; navigation stays secondary.
 * Priority (highest first):
 *   1. Unfinished conversation
 *   2. Active project
 *   3. Visual Thinking session
 *   4. Plan My Day (only when actively planning)
 *   5. Document / artifact in progress
 *   6. Research / decision sessions
 *   7. Other unfinished workspaces
 */

import type { LastActivity } from "./companionStore";
import { getLastActivity } from "./companionStore";
import {
  buildContinuityManifest,
  HOME_RESUME_CONTINUITY_TYPES,
  type ContinuityItemType,
  type ContinuityManifestItem,
} from "./continuityManifest";
import { getDayDesignerSession } from "./day-designer/dayStore";
import { homeResumeFromContinuityItem, type HomeResumeItem } from "./homeResumeItem";
import { buildResumeWorkSignals } from "./resumeWorkSignals";
import { evaluateResumeWorkEligibility } from "./resumeWorkEligibility";
import { memoryCueFromLastActivity } from "./homeMemoryCue";
import { isPhase1OnboardingActive } from "./phase1Onboarding";

export type CompanionContinueKind =
  | "conversation"
  | "project"
  | "visual-thinking"
  | "plan-my-day"
  | "document"
  | "research"
  | "workspace";

export type CompanionContinueOption = {
  id: string;
  kind: CompanionContinueKind;
  title: string;
  subtitle: string;
  priority: number;
  lastTouchedAt: string;
  homeResumeItem?: HomeResumeItem;
  conversationCue?: string;
};

export type CompanionContinueResolution =
  | { mode: "onboarding" }
  | { mode: "single"; option: CompanionContinueOption }
  | { mode: "choose"; options: CompanionContinueOption[] }
  | { mode: "empty"; prompt: string };

const EMPTY_PROMPT = "What would help most right now?";

const PRIORITY: Record<CompanionContinueKind, number> = {
  conversation: 1,
  project: 2,
  "visual-thinking": 3,
  "plan-my-day": 4,
  document: 5,
  research: 6,
  workspace: 7,
};

function continuityKind(type: ContinuityItemType): CompanionContinueKind {
  switch (type) {
    case "project":
      return "project";
    case "visual-focus-map":
      return "visual-thinking";
    case "create-draft":
    case "create-saved-for-later":
      return "document";
    case "decision-compass":
    case "strategy-apply":
      return "research";
    default:
      return "workspace";
  }
}

function manifestToOption(item: ContinuityManifestItem): CompanionContinueOption {
  const homeItem = homeResumeFromContinuityItem(item);
  return {
    id: item.id,
    kind: continuityKind(item.type),
    title: item.title,
    subtitle: item.nextStep ?? "Continue where you left off",
    priority: PRIORITY[continuityKind(item.type)],
    lastTouchedAt: item.lastTouchedAt,
    homeResumeItem: homeItem,
  };
}


function conversationOption(act: LastActivity): CompanionContinueOption | null {
  if (act.kind !== "chat" || !act.title?.trim()) return null;
  const cue = memoryCueFromLastActivity(act);
  if (!cue) return null;
  return {
    id: `conversation:${act.title.trim().toLowerCase()}`,
    kind: "conversation",
    title: act.title.trim(),
    subtitle: "Pick up our conversation",
    priority: PRIORITY.conversation,
    lastTouchedAt: act.ts,
    conversationCue: cue,
  };
}

function planMyDayOption(): CompanionContinueOption | null {
  const session = getDayDesignerSession();
  if (!session || session.step === "complete" || session.step === "idle") {
    return null;
  }
  return {
    id: "plan-my-day:active",
    kind: "plan-my-day",
    title: "Today's Planning",
    subtitle: "Continue shaping your day",
    priority: PRIORITY["plan-my-day"],
    lastTouchedAt: session.startedAt ?? new Date().toISOString(),
    homeResumeItem: {
      id: "plan-my-day:active",
      kind: "workspace",
      title: "Today's Planning",
      typeLabel: "Plan My Day",
      lastAction: "Continue planning your day",
      nextStep: "Continue planning your day",
      ts: session.startedAt ?? new Date().toISOString(),
      activityId: "plan-my-day",
    },
  };
}

function listEligibleWorkspaceOptions(): CompanionContinueOption[] {
  const manifest = buildContinuityManifest();
  const candidates = manifest.items.filter((item) =>
    HOME_RESUME_CONTINUITY_TYPES.has(item.type),
  );

  const signals = buildResumeWorkSignals(candidates);
  const eligibleIds = new Set(
    signals
      .filter((signal) => evaluateResumeWorkEligibility(signal).eligible)
      .map((signal) => signal.id),
  );

  return candidates
    .filter((item) => eligibleIds.has(item.id))
    .map(manifestToOption);
}

function sortOptions(options: CompanionContinueOption[]): CompanionContinueOption[] {
  return [...options].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return b.lastTouchedAt.localeCompare(a.lastTouchedAt);
  });
}

function dedupeOptions(
  options: CompanionContinueOption[],
): CompanionContinueOption[] {
  const seen = new Set<string>();
  const out: CompanionContinueOption[] = [];
  for (const option of options) {
    const key = `${option.kind}:${option.title.trim().toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(option);
  }
  return out;
}

/** Resolve what calm-home Continue should offer — companion-led, not navigation-led. */
export function resolveCompanionContinue(options?: {
  onboardingActive?: boolean;
}): CompanionContinueResolution {
  if (options?.onboardingActive ?? isPhase1OnboardingActive()) {
    return { mode: "onboarding" };
  }

  const collected: CompanionContinueOption[] = [];

  const last = getLastActivity();
  if (last) {
    const conv = conversationOption(last);
    if (conv) collected.push(conv);
  }

  const plan = planMyDayOption();
  if (plan) collected.push(plan);

  collected.push(...listEligibleWorkspaceOptions());

  const options_ = sortOptions(dedupeOptions(collected));
  if (options_.length === 0) {
    return { mode: "empty", prompt: EMPTY_PROMPT };
  }
  if (options_.length === 1) {
    return { mode: "single", option: options_[0] };
  }
  return { mode: "choose", options: options_.slice(0, 4) };
}

export const COMPANION_CONTINUE_BUTTON_LABEL = "Continue Where I Left Off";
