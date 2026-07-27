/**
 * Client Avatar research context — the avatar-specific *configuration* of the
 * shared contextual-research core. Prompt copy ("Shari", "their ideal client",
 * the Chamber/Board guardrail) lives here as config; the assembly, per-area
 * accumulation, and append-only mechanics live in
 * `lib/research/contextualResearchCore`.
 *
 * This module keeps its original public API so the builder and existing tests
 * are unaffected — it now delegates to the shared core.
 */

import {
  buildResearchAutoPrompt,
  buildResearchSystemPrompt,
  type ResearchContext,
  type ResearchPersonaConfig,
} from "@/lib/research/contextualResearchCore";

// Re-export the shared mechanics under their established names so existing
// importers (IdealClientBuilder, tests) keep working unchanged.
export {
  appendResearchToAnswer,
  customFieldId,
  researchThreadKey,
  describeResearchArea,
  appendToResearchArea,
  setResearchAreaValue,
  collectAddableResponses,
  addResponseToAnswer,
  addSessionToAnswer,
  type ResearchAreaField,
  type ResearchAreaData,
  type ResearchMessageLike,
  type ResearchAdditionResult,
} from "@/lib/research/contextualResearchCore";

export type AvatarResearchContext = {
  questionLabel: string;
  /** The current answer for this question, if any. */
  currentAnswer?: string;
  /** Relevant prior answers already captured, e.g. { "Who they help": "…" }. */
  priorAnswers?: Array<{ label: string; value: string }>;
  /** Avatar name / draft identity, if available. */
  avatarName?: string;
};

/** The avatar voice/guardrails — the config passed to the shared prompt builder. */
const AVATAR_RESEARCH_CONFIG: ResearchPersonaConfig = {
  intro: [
    "You are Shari, helping an ADHD founder think through ONE question about",
    "their ideal client so they can write their own answer, in their own words.",
  ],
  nameLinePrefix: "Client name/label: ",
  priorsHeader: "What they've already said about this client:",
  draftLabel: "Their current draft answer:",
  emptyDraftText: "(empty so far)",
  guidance: [
    "Help them explore and think it through: offer a few concrete angles,",
    "examples, and possible wording they could adapt. Keep replies short, warm,",
    "and concrete. Do NOT write the whole answer for them or call it final — they",
    "decide what to keep. Never mention menus, tools, the Chamber, or the Board.",
    "Stay entirely on this one question.",
  ],
};

function toSharedContext(ctx: AvatarResearchContext): ResearchContext {
  return {
    questionLabel: ctx.questionLabel,
    currentAnswer: ctx.currentAnswer,
    priorAnswers: ctx.priorAnswers,
    entityName: ctx.avatarName,
  };
}

/** Scoped system prompt — the assistant helps think through ONE question. */
export function buildAvatarResearchSystemPrompt(
  ctx: AvatarResearchContext,
): string {
  return buildResearchSystemPrompt(AVATAR_RESEARCH_CONFIG, toSharedContext(ctx));
}

/** The automatic first request, sent for the member so they need not type it. */
export function buildAvatarResearchAutoPrompt(
  ctx: AvatarResearchContext,
): string {
  return buildResearchAutoPrompt(toSharedContext(ctx));
}
