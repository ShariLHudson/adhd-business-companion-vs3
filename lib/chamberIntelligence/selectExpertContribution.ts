/**
 * Chamber Intelligence Selection Layer — I-2.
 *
 * Answers: given an activated expert and this specific request, WHICH
 * facets, frameworks, ADHD translations, and question — if any — actually
 * earn a place in the hint, under a hard token budget?
 *
 * This is deliberately a thin, rule-based selector reusing the same
 * tokenizer/matcher as resolveChamberExpertActivation.ts
 * (lib/chamberExpertise/textMatch.ts) — NOT a second scoring engine, NOT a
 * Knowledge Finger runtime. It never decides WHO is relevant (that's
 * resolveChamberExpertActivation.ts); it only decides WHAT, from an
 * already-activated expert's own record, is worth including.
 *
 * Core rule: nothing is included by default. A framework, translation, or
 * research flag must match a trigger in the request — see
 * docs/estate/CHAMBER_INTELLIGENCE_SYSTEM_ARCHITECTURE.md §12 "no
 * knowledge dumping".
 */

import { anyPhraseMatches, estimateTokens, tokenize } from "@/lib/chamberExpertise/textMatch";
import { chamberIntelligenceForExpert } from "./intelligenceRegistry";
import type {
  AdhdTranslation,
  ChamberIntelligenceRole,
  ExpertFramework,
  ExpertQuestion,
  ExpertThinkingPattern,
  SelectedExpertContribution,
} from "./types";

export type SelectExpertContributionInput = {
  expertId: import("@/lib/chamberExpertise/types").ChamberExpertId;
  userText: string;
  role: ChamberIntelligenceRole;
};

/**
 * Hard per-role token budgets — see architecture doc §3 "Prompt budget".
 * `"co-primary"` (V2-2) is deliberately smaller than `"primary"` even
 * though it gets the same full-depth selection treatment (see
 * `isPrimary` below) — two co-primary contributions must fit alongside
 * the mandatory header/footer/bridge inside the same 550-token whole-hint
 * cap that a single primary + several supporting lines shares today.
 */
export const CHAMBER_INTELLIGENCE_BUDGET_TOKENS: Record<ChamberIntelligenceRole, number> = {
  primary: 220,
  supporting: 90,
  "co-primary": 150,
};

/** Whole-hint cap across primary + all supporting experts + collaboration bridge + guardrails. */
export const CHAMBER_INTELLIGENCE_TOTAL_BUDGET_TOKENS = 550;

function pickThinkingFacets(pattern: ExpertThinkingPattern, max: number): string[] {
  // Deterministic, fixed order: what it notices first, then what it
  // creates — the most informative combination for a short hint.
  const ordered = [...pattern.notices.slice(0, 1), ...pattern.creates.slice(0, 1), ...pattern.finds.slice(0, 1)];
  return ordered.slice(0, max);
}

function frameworkRenderText(fw: ExpertFramework): string {
  return `${fw.name}: ${fw.sparkExplanation} (ADHD: ${fw.adhdApplication})`;
}

function adhdRenderText(t: AdhdTranslation): string {
  return `Instead of "${t.traditional}" — ${t.sparkAdaptation}`;
}

function questionRenderText(q: ExpertQuestion): string {
  return q.text;
}

type Candidate = {
  tokens: number;
  apply: () => void;
};

/**
 * Select what this expert should contribute to this turn's hint, reading
 * only its OWN record (read-only retrieval — never copies the whole
 * profile). Returns null when the expert has no migrated intelligence
 * module yet (graceful per-expert fallback during migration).
 */
export function selectExpertContribution(
  input: SelectExpertContributionInput,
): SelectedExpertContribution | null {
  const intelligence = chamberIntelligenceForExpert(input.expertId);
  if (!intelligence) return null;

  const textWords = tokenize(input.userText ?? "");
  const budget = CHAMBER_INTELLIGENCE_BUDGET_TOKENS[input.role];
  // Co-primary (V2-2) gets the same full-depth facet/framework/question
  // selection as primary — the decision table's whole point is that
  // neither co-primary expert is "lighter" than the other. Only the
  // token budget differs (smaller, so two fit under the whole-hint cap).
  const isPrimary = input.role === "primary" || input.role === "co-primary";

  const facetCandidates = pickThinkingFacets(intelligence.thinkingPattern, isPrimary ? 2 : 1);

  const matchedFrameworks = intelligence.frameworks.filter((fw) =>
    anyPhraseMatches(fw.whenToUse, textWords),
  );
  const matchedAdhd = intelligence.adhdTranslations.filter((t) =>
    anyPhraseMatches(t.appliesWhen, textWords),
  );
  const question = isPrimary ? intelligence.signatureQuestions[0] : undefined;
  const researchSuggested = anyPhraseMatches(intelligence.knowledgeSources.researchTriggers, textWords);

  // Assemble under budget, highest-value first. Facets are mandatory and
  // essentially free; everything else must match a trigger AND fit.
  let runningTokens = estimateTokens(facetCandidates.join("; "));
  const frameworks: ExpertFramework[] = [];
  const adhdTranslations: AdhdTranslation[] = [];
  let selectedQuestion: ExpertQuestion | undefined;

  const maxFrameworks = isPrimary ? 2 : 1;
  const maxAdhd = isPrimary ? 2 : 1;

  // Priority order: framework #1, adhd #1, framework #2 (primary only),
  // question (primary only), adhd #2 (primary only). Stop at first item
  // that would overflow the budget — deterministic, no reordering to cram
  // in smaller items later.
  const priorityQueue: Candidate[] = [];

  if (matchedFrameworks[0]) {
    const fw = matchedFrameworks[0];
    priorityQueue.push({
      tokens: estimateTokens(frameworkRenderText(fw)),
      apply: () => frameworks.push(fw),
    });
  }
  if (matchedAdhd[0]) {
    const t = matchedAdhd[0];
    priorityQueue.push({
      tokens: estimateTokens(adhdRenderText(t)),
      apply: () => adhdTranslations.push(t),
    });
  }
  if (maxFrameworks > 1 && matchedFrameworks[1]) {
    const fw = matchedFrameworks[1];
    priorityQueue.push({
      tokens: estimateTokens(frameworkRenderText(fw)),
      apply: () => frameworks.push(fw),
    });
  }
  if (question) {
    priorityQueue.push({
      tokens: estimateTokens(questionRenderText(question)),
      apply: () => {
        selectedQuestion = question;
      },
    });
  }
  if (maxAdhd > 1 && matchedAdhd[1]) {
    const t = matchedAdhd[1];
    priorityQueue.push({
      tokens: estimateTokens(adhdRenderText(t)),
      apply: () => adhdTranslations.push(t),
    });
  }

  for (const candidate of priorityQueue) {
    if (runningTokens + candidate.tokens > budget) break;
    candidate.apply();
    runningTokens += candidate.tokens;
  }

  return {
    expertId: input.expertId,
    role: input.role,
    thinkingFacets: facetCandidates,
    frameworks,
    question: selectedQuestion,
    adhdTranslations,
    researchSuggested,
    estimatedTokens: runningTokens,
  };
}
