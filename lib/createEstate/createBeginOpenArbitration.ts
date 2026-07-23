/**
 * Shared Create begin → Anywhere-Origin open arbitration.
 * Keeps type-specific mapping (Workshop → event_plan) while forceNew / clarify /
 * continue decisions stay in one place for every guided type.
 */

import { isForceNewCreationRequest } from "@/lib/universalCreationEntrypoint/forceNewIntent";
import { launchFromCreate } from "@/lib/universalWorkEngine";
import type { AnywhereOriginResolution } from "@/lib/universalWorkEngine/launch/types";
import { EVENT_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema";
import { BUSINESS_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/businessPlanMap";
import { MARKETING_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/marketingPlanMap";
import { FACEBOOK_COMMUNITY_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/facebookCommunityMap";
import { isForceNewCreateSessionArmed } from "./forceNewCreateSession";
import type { CreateBeginOutcome } from "./resolveCreateBeginOutcome";

export type GuidedBeginOpenOutcome =
  | {
      kind: "open_new";
      outcome: Extract<CreateBeginOutcome, { kind: "open" }>;
      resolution: AnywhereOriginResolution;
    }
  | {
      kind: "continue_existing";
      workId: string;
      outcome: Extract<CreateBeginOutcome, { kind: "open" }>;
      resolution: AnywhereOriginResolution;
      continueLabel: string;
    }
  | {
      kind: "clarify";
      outcome: Extract<CreateBeginOutcome, { kind: "open" }>;
      resolution: AnywhereOriginResolution;
      reply: string;
      continueLabel: string;
      startNewLabel: string;
    }
  | {
      kind: "skip_anywhere";
      outcome: Extract<CreateBeginOutcome, { kind: "open" }>;
    };

function candidateWorkTypeId(
  outcome: Extract<CreateBeginOutcome, { kind: "open" }>,
): string | null {
  if (outcome.isFacebookCommunityDomain) return FACEBOOK_COMMUNITY_WORK_TYPE_ID;
  if (outcome.isMarketingPlanDomain) return MARKETING_PLAN_WORK_TYPE_ID;
  if (outcome.isBusinessPlanDomain) return BUSINESS_PLAN_WORK_TYPE_ID;
  if (outcome.isEventDomain) return EVENT_PLAN_WORK_TYPE_ID;
  return null;
}

export function shouldForceNewCreateBegin(input: {
  text: string;
  forceNewArmed?: boolean;
}): boolean {
  return (
    Boolean(input.forceNewArmed) ||
    isForceNewCreateSessionArmed() ||
    isForceNewCreationRequest(input.text)
  );
}

export function ambiguityContinueLabel(artifactType: string): string {
  const label = artifactType.trim() || "work";
  return `Continue Existing ${label}`;
}

export function ambiguityStartNewLabel(artifactType: string): string {
  const label = artifactType.trim() || "work";
  return `Start New ${label}`;
}

/**
 * Resolve guided Begin after type confirm — forceNew, continue, or clarify with actions.
 */
export function resolveGuidedBeginOpen(input: {
  outcome: Extract<CreateBeginOutcome, { kind: "open" }>;
  forceNewArmed?: boolean;
  /** Injected for tests */
  launch?: typeof launchFromCreate;
}): GuidedBeginOpenOutcome {
  const { outcome } = input;
  const workTypeId = candidateWorkTypeId(outcome);
  if (!workTypeId) {
    return { kind: "skip_anywhere", outcome };
  }

  const forceNew = shouldForceNewCreateBegin({
    text: outcome.text,
    forceNewArmed: input.forceNewArmed,
  });

  const launch = input.launch ?? launchFromCreate;
  const resolution = launch({
    originalUserMessage: outcome.text,
    candidateWorkTypeId: workTypeId,
    forceNew,
  });

  if (resolution.decision === "clarify") {
    return {
      kind: "clarify",
      outcome,
      resolution,
      reply: resolution.reply,
      continueLabel: ambiguityContinueLabel(outcome.artifactType),
      startNewLabel: ambiguityStartNewLabel(outcome.artifactType),
    };
  }

  if (
    resolution.decision === "continue_existing" &&
    resolution.workId &&
    !forceNew
  ) {
    return {
      kind: "continue_existing",
      workId: resolution.workId,
      outcome,
      resolution,
      continueLabel: ambiguityContinueLabel(outcome.artifactType),
    };
  }

  return {
    kind: "open_new",
    outcome,
    resolution,
  };
}

/** Workshop must resolve to Event Plan domain — never SOP. */
export function assertWorkshopNotSop(artifactType: string): boolean {
  const t = artifactType.trim().toLowerCase();
  if (t.includes("workshop")) {
    return t !== "sop" && !t.includes("standard operating");
  }
  return true;
}
