/**
 * Decision Compass V2 — multi-perspective recommendation report.
 * V2.1 — synthesized companion voice (no raw transcript dumps).
 */

import { optionLabels } from "./decisionCompass";
import type { PersistedDecisionCompassSession } from "./decisionCompassSessionStore";
import { buildVisualThinkingSnapshot } from "./decisionCompassSessionAuthority";
import {
  buildDecisionMapView,
  primaryReasonsForRecommendation,
  type DecisionMapViewModel,
} from "./decisionMapView";
import {
  synthesizeAdvantage,
  synthesizeAlternativePaths,
  synthesizeConcern,
  synthesizeMotivation,
  synthesizeOverallSummary,
  synthesizeQuestions,
  synthesizeWhatWeNotice,
} from "./decisionReportSynthesis";

export const REPORT_DISCLAIMER =
  "This is a thinking tool, not a final answer. Use it to clarify — not to override your judgment.";

export const NON_AUTHORITATIVE_PREFIXES = [
  "Based on the information available so far",
  "The discussion currently suggests",
  "The evidence appears to indicate",
] as const;

export type DecisionRecommendationReport = {
  whatWeNotice: string[];
  potentialAdvantages: string[];
  potentialConcerns: string[];
  questionsWorthConsidering: string[];
  alternativePaths: string[];
  overallDirection: {
    choice: string;
    headline: string;
    summary: string;
    qualifier: string;
  } | null;
  disclaimer: string;
  dimensionsConsidered: string[];
};

const DIMENSION_LABELS: Record<string, string> = {
  freedom: "Time and energy",
  growth: "Business growth",
  stress: "Stress and sustainability",
  alignment: "Long-term fit",
  clearer: "Clarity and next steps",
  momentum: "Momentum",
  values: "Values alignment",
  relief: "Emotional relief",
  "future-me": "Future You",
};

function uniqueNonEmpty(items: string[], limit = 6): string[] {
  return [...new Set(items.map((s) => s.trim()).filter(Boolean))].slice(0, limit);
}

function leadingSide(vm: DecisionMapViewModel): "A" | "B" | null {
  const rec = vm.recommendation;
  if (!rec) return null;
  const a = vm.optionA.label.toLowerCase();
  const b = vm.optionB.label.toLowerCase();
  const c = rec.choice.toLowerCase();
  if (c === a || c.includes(a.slice(0, 10))) return "A";
  if (c === b || c.includes(b.slice(0, 10))) return "B";
  return null;
}

export function buildDecisionRecommendationReport(
  session: PersistedDecisionCompassSession | null,
): DecisionRecommendationReport | null {
  if (!session?.recommendation) return null;

  const vm = buildDecisionMapView(session);
  const vt = buildVisualThinkingSnapshot(session);
  const rec = session.recommendation;
  const side = leadingSide(vm);
  const winBranch = side === "A" ? vm.optionA : side === "B" ? vm.optionB : null;
  const otherBranch = side === "A" ? vm.optionB : side === "B" ? vm.optionA : null;

  const dimensionsConsidered = vt.tradeoffs.map(
    (t) => DIMENSION_LABELS[t.dimension] ?? t.dimension,
  );

  const whatWeNotice = uniqueNonEmpty(
    synthesizeWhatWeNotice({
      decision: session.decision,
      optionA: session.optionA,
      optionB: session.optionB,
      motivationCount: vt.motivations.length,
      concernCount: vt.concerns.length,
      dimensions: dimensionsConsidered,
    }),
  );

  const rawAdvantages = [
    ...(winBranch?.benefits ?? []),
    ...(winBranch?.reasons ?? []),
    ...vt.motivations,
    winBranch?.successPicture ?? "",
  ].filter(Boolean);

  const potentialAdvantages = uniqueNonEmpty(
    rawAdvantages.map((raw) =>
      synthesizeAdvantage(raw, winBranch?.label ?? rec.choice),
    ),
  );

  const rawConcerns = uniqueNonEmpty([
    ...(winBranch?.concerns ?? []),
    ...(otherBranch?.concerns ?? []),
    ...vt.concerns,
  ]);

  const potentialConcerns = uniqueNonEmpty(
    rawConcerns.map((raw) => synthesizeConcern(raw)),
  );

  const hasCostConcern = rawConcerns.some((c) => /\bcost\b/i.test(c));

  const questionsWorthConsidering = synthesizeQuestions(
    dimensionsConsidered,
    hasCostConcern,
  );

  const alternativePaths = uniqueNonEmpty(
    synthesizeAlternativePaths({
      optionA: session.optionA,
      optionB: session.optionB,
      recommendedChoice: rec.choice,
      recommendedLabel: winBranch?.label ?? rec.choice,
      otherLabel: otherBranch?.label ?? session.optionB,
    }),
  );

  return {
    whatWeNotice,
    potentialAdvantages,
    potentialConcerns,
    questionsWorthConsidering,
    alternativePaths,
    overallDirection: {
      choice: rec.choice,
      headline: rec.headline,
      summary: synthesizeOverallSummary(
        rec.choice,
        rec.headline,
        rec.summary,
      ),
      qualifier: NON_AUTHORITATIVE_PREFIXES[0],
    },
    disclaimer: REPORT_DISCLAIMER,
    dimensionsConsidered: uniqueNonEmpty(dimensionsConsidered, 8),
  };
}

export function reportSummaryForChat(
  session: PersistedDecisionCompassSession | null,
): string | undefined {
  const report = buildDecisionRecommendationReport(session);
  if (!report?.overallDirection) return undefined;
  const lines = [
    `RECOMMENDATION REPORT (synthesized observations — do not ask user to repeat raw answers):`,
    `${report.overallDirection.qualifier}, the Compass leans toward **${report.overallDirection.choice}**.`,
    report.potentialAdvantages[0]
      ? `Leading advantages (interpreted): ${report.potentialAdvantages.slice(0, 2).join("; ")}`
      : null,
    report.potentialConcerns[0]
      ? `Key concerns (interpreted): ${report.potentialConcerns.slice(0, 2).join("; ")}`
      : null,
    report.disclaimer,
  ].filter(Boolean);
  return lines.join("\n");
}

/** @internal tests */
export function reportUsesNonAuthoritativeLanguage(
  report: DecisionRecommendationReport,
): boolean {
  const blob = [
    report.overallDirection?.qualifier ?? "",
    report.overallDirection?.summary ?? "",
    report.disclaimer,
  ].join(" ");
  return NON_AUTHORITATIVE_PREFIXES.some((p) =>
    blob.toLowerCase().includes(p.toLowerCase().slice(0, 12)),
  );
}

/** Collect raw user answer strings for synthesis tests. */
export function rawUserAnswersFromSession(
  session: PersistedDecisionCompassSession,
): string[] {
  const vt = buildVisualThinkingSnapshot(session);
  const { a, b } = optionLabels(session.answers);
  const items: string[] = [];
  for (const val of Object.values(session.answers)) {
    if (val?.trim() && val !== "A" && val !== "B") items.push(val.trim());
  }
  for (const m of vt.motivations) items.push(m);
  for (const c of vt.concerns) items.push(c);
  if (a) items.push(a);
  if (b) items.push(b);
  return items.filter((s) => s.length >= 6);
}
