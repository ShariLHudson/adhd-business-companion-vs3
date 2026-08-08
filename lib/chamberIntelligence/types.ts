/**
 * Chamber Intelligence — I-1 types.
 *
 * Deep, per-expert intelligence records. These are compiled DIGESTS of the
 * markdown Expert Intelligence Profiles (docs/visual-spark-studios/
 * Chamber-Member-Intelligence/Expert-Intelligence-Profiles/), not a
 * replacement for them — the markdown remains the human source of truth
 * (see docs/estate/CHAMBER_INTELLIGENCE_SYSTEM_ARCHITECTURE.md §6 and
 * __tests__/profileDrift.test.ts, which enforces the two stay in sync).
 *
 * This is explicitly NOT a Knowledge Finger runtime. "Finger" concepts —
 * reasoning pattern, questions, research triggers — live here as fields on
 * the expert's own record, per the architecture doc §2/§12. There is no
 * separate Finger registry, activation path, or engine.
 */

import type { ChamberExpertId } from "@/lib/chamberExpertise/types";

/**
 * "When this expert helps, what do they notice that others miss?" —
 * expanded from the single-sentence registry field into selectable facets.
 */
export type ExpertThinkingPattern = {
  /** One-line signature move — matches chamberExpertRegistry's expertThinkingPattern. */
  summary: string;
  /** What this expert sees that others miss. */
  notices: readonly string[];
  /** What it actively looks for and often finds. */
  finds: readonly string[];
  /** What it builds/protects as a result. */
  creates: readonly string[];
  /** Absences it checks for — the "missing handoff" class of noticing. */
  checksForMissing: readonly string[];
};

export type ExpertFramework = {
  id: string;
  name: string;
  /** Per-expert, open-ended vocabulary (e.g. "positioning", "SOP creation"). Not an enum — the structure must grow without a schema change. */
  category: string;
  purpose: string;
  /** Situational triggers — when this framework earns its place this turn. Never applied by default. */
  whenToUse: readonly string[];
  /** How Spark explains it in plain language. */
  sparkExplanation: string;
  /** Required: how this framework changes for an ADHD founder. */
  adhdApplication: string;
  example: string;
};

export type ExpertQuestion = {
  id: string;
  text: string;
  /** What asking this question is meant to reveal or unblock. */
  reveals: string;
};

export type AdhdTranslation = {
  id: string;
  /** The conventional recommendation this replaces. */
  traditional: string;
  /** Why it tends to fail for an ADHD founder — specialty-specific, never a generic ADHD statement. */
  whyItFails: string;
  /** What Spark offers instead. */
  sparkAdaptation: string;
  whyBetter: string;
  /** Triggers so this is applied only when relevant — never dumped by default. */
  appliesWhen: readonly string[];
};

export type ExpertKnowledgeSources = {
  /** Topics in this domain that go stale and may need current information. */
  volatileTopics: readonly string[];
  /** Types of sources this expert trusts. Types, not URLs — no fetching in I-1/I-2. */
  trustedSourceTypes: readonly string[];
  /** What counts as enough evidence to move forward. */
  evidenceStandard: string;
  /** Situational triggers for handing off to the EXISTING research capability (Estate Brain). Never a second research engine. */
  researchTriggers: readonly string[];
};

/** The deep intelligence record for one Chamber expert. */
export type ChamberExpertIntelligence = {
  id: ChamberExpertId;
  thinkingPattern: ExpertThinkingPattern;
  frameworks: readonly ExpertFramework[];
  signatureQuestions: readonly ExpertQuestion[];
  adhdTranslations: readonly AdhdTranslation[];
  knowledgeSources: ExpertKnowledgeSources;
  /** Source of truth for humans; checked for drift in tests. */
  profilePath: string;
};

/**
 * V2-2 adds "co-primary" — used when Chamber Activation V2 (feature-
 * flagged) determines two experts are both genuinely central to a
 * request. Gets the same full-depth selection as "primary" (see
 * selectExpertContribution.ts's `isPrimary` check), under its own,
 * smaller per-expert budget so two co-primary contributions plus the
 * mandatory header/footer/bridge still fit the 550-token whole-hint cap.
 */
export type ChamberIntelligenceRole = "primary" | "supporting" | "co-primary";

export type SelectionContext = {
  userText: string;
  role: ChamberIntelligenceRole;
};

/** What the selection layer decided to surface for one expert, this turn. */
export type SelectedExpertContribution = {
  expertId: ChamberExpertId;
  role: ChamberIntelligenceRole;
  thinkingFacets: readonly string[];
  frameworks: readonly ExpertFramework[];
  question?: ExpertQuestion;
  adhdTranslations: readonly AdhdTranslation[];
  researchSuggested: boolean;
  /** Estimated token cost of this contribution alone (~4 chars/token). */
  estimatedTokens: number;
};
