/**
 * Gather user health signals from intelligence stores and conversation.
 */

import { getActivationStore } from "@/lib/activation/activationStore";
import { getCognitiveLoadStore } from "@/lib/cognitive-load/loadStore";
import { getDayDesignerStore } from "@/lib/day-designer/dayStore";
import { getLoopStore } from "@/lib/loop-intelligence/loopStore";
import { getOpportunityStore } from "@/lib/opportunity-intelligence/opportunityStore";
import { getRecognitionStore } from "@/lib/recognition/recognitionStore";
import { getRelationshipStore } from "@/lib/relationship-intelligence/relationshipStore";
import { getProjects } from "@/lib/companionStore";
import type { UserHealthInput } from "./types";

const MS_DAY = 86_400_000;

const OVERWHELM_RE =
  /\b(overwhelm|too much|can't cope|burned out|burnt out|exhausted|drained)\b/i;
const STUCK_RE =
  /\b(stuck|frozen|can't start|procrastinat|avoiding|paralyz)\b/i;
const WIN_RE =
  /\b(finished|completed|shipped|posted|published|got it done|made progress|win)\b/i;

function countPatternInSamples(
  samples: { at: string }[],
  textFn: (s: unknown) => string,
  re: RegExp,
  sinceMs: number,
): number {
  let n = 0;
  for (const s of samples) {
    if (new Date(s.at).getTime() < sinceMs) continue;
    if (re.test(textFn(s))) n += 1;
  }
  return n;
}

export function daysSinceLastActivity(now = new Date()): number | null {
  const store = getRecognitionStore();
  const last = store.lastConversationStartAt ?? store.firstConversationAt;
  if (!last) return null;
  const diff = now.getTime() - new Date(last).getTime();
  return Math.max(0, Math.floor(diff / MS_DAY));
}

export function countRecentDismissals(now = new Date()): number {
  const day = now.toISOString().slice(0, 10);
  let n = 0;

  const cog = getCognitiveLoadStore();
  if (cog.offerDismissedOn === day) n += 1;

  const act = getActivationStore();
  if (act.offerDismissedOn === day) n += 1;

  const loop = getLoopStore();
  if (loop.offerDismissedOn === day) n += 1;
  n += Object.values(loop.dismissedLoopTypes).filter((d) => d === day).length;

  const dayDesigner = getDayDesignerStore();
  if (dayDesigner.dismissedOn === day) n += 1;

  const opp = getOpportunityStore();
  if (opp.offerDismissedOn === day) n += 1;
  n += opp.dismissedOpportunityIds.length;

  const rel = getRelationshipStore();
  n += Object.values(rel.dismissedNames).filter((d) => d === day).length;

  return n;
}

export function gatherUserHealthInput(
  partial: UserHealthInput = {},
): UserHealthInput {
  const now = partial.now ?? new Date();
  const since7d = now.getTime() - 7 * MS_DAY;
  const recognition = getRecognitionStore();
  const activation = getActivationStore();
  const loop = getLoopStore();
  const dayDesigner = getDayDesignerStore();

  const activationSamples = activation.founderSamples.filter(
    (s) => new Date(s.at).getTime() >= since7d,
  );
  const loopSnapshots = loop.snapshots.filter(
    (s) => new Date(s.createdAt).getTime() >= since7d,
  );

  const overwhelmFromActivation = activationSamples.filter((s) =>
    /\b(overwhelm|frozen|stuck)\b/i.test(s.state),
  ).length;
  const stuckFromActivation = activationSamples.filter((s) =>
    /\b(stuck|frozen|hesitant)\b/i.test(s.state),
  ).length;

  const text = partial.text ?? "";
  const overwhelmLanguageCount =
    partial.overwhelmLanguageCount ??
    overwhelmFromActivation +
      (OVERWHELM_RE.test(text) ? 1 : 0) +
      countPatternInSamples(
        activation.founderSamples,
        (s) => (s as { suggestedNextStep?: string }).suggestedNextStep ?? "",
        OVERWHELM_RE,
        since7d,
      );

  const stuckLanguageCount =
    partial.stuckLanguageCount ??
    stuckFromActivation +
      (STUCK_RE.test(text) ? 1 : 0) +
      loopSnapshots.length;

  const winLanguageCount =
    partial.winLanguageCount ??
    (WIN_RE.test(text) ? 1 : 0) +
      recognition.sentLog.filter((e) => new Date(e.at).getTime() >= since7d)
        .length;

  return {
    ...partial,
    now,
    daysSinceLastActivity:
      partial.daysSinceLastActivity ?? daysSinceLastActivity(now),
    recentDismissalCount:
      partial.recentDismissalCount ?? countRecentDismissals(now),
    dayDesignerPlansCount:
      partial.dayDesignerPlansCount ?? dayDesigner.plans.length,
    recognitionMomentsRecent:
      partial.recognitionMomentsRecent ??
      recognition.sentLog.filter((e) => new Date(e.at).getTime() >= since7d)
        .length,
    opportunityDismissalCount:
      partial.opportunityDismissalCount ??
      getOpportunityStore().dismissedOpportunityIds.length,
    overwhelmLanguageCount,
    stuckLanguageCount,
    winLanguageCount,
    conversationStarts:
      partial.conversationStarts ?? recognition.conversationStarts,
    stalledProjectCount:
      partial.stalledProjectCount ??
      getProjects().filter(
        (p) =>
          p.status !== "completed" &&
          (p.status === "paused" || p.status === "not-started"),
      ).length,
  };
}
