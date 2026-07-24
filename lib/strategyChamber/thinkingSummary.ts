/**
 * Member-facing "My Thinking So Far" — only meaningful sections, plain language.
 * Never present tentative content as confirmed. Preserve member wording.
 */

import type { StrategyWorkItem } from "./types";
import { assessDecisionReadiness } from "./intelligence/engine/assessDecisionReadiness";
import {
  classifyStrategicInput,
  formatStanceAwareCopy,
} from "./intelligence/engine/classifyStrategicInput";
import { DECISION_READINESS_LABEL } from "./domainModel";

export type ThinkingSummarySection = {
  id: string;
  label: string;
  body: string | string[];
};

function sameText(a?: string | null, b?: string | null): boolean {
  return Boolean(a?.trim() && b?.trim() && a.trim() === b.trim());
}

function normalizeKey(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function uniqueLines(lines: string[], ...exclude: Array<string | undefined>): string[] {
  const blocked = new Set(
    exclude.filter(Boolean).map((x) => normalizeKey(x!)),
  );
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const key = normalizeKey(t);
    if (blocked.has(key) || seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

function readinessMemberCopy(item: StrategyWorkItem): string | null {
  const { readiness } = assessDecisionReadiness(item);
  if (readiness === "problem_not_yet_clear") {
    return "Still clarifying what you are really deciding";
  }
  if (readiness === "reality_not_yet_understood") {
    return "Still understanding what is happening";
  }
  if (readiness === "more_options_needed") {
    return "Ready to explore directions when you want";
  }
  if (readiness === "tradeoffs_not_evaluated") {
    return "Comparing what each direction would ask of you";
  }
  if (readiness === "risks_not_reviewed") {
    return "Looking carefully at what could go wrong";
  }
  if (readiness === "ready_for_decision") {
    return "Close enough to choose — waiting for your confirmation";
  }
  if (readiness === "ready_for_handoff") {
    return "Direction is clear enough to take a next step";
  }
  if (readiness === "decision_complete") {
    return "You have confirmed a direction";
  }
  // Fallback — never expose raw enum as if it were copy
  return DECISION_READINESS_LABEL[readiness] || null;
}

/**
 * Build summary sections. Empty sections omitted. No duplicate wording.
 */
export function buildThinkingSummary(
  item: StrategyWorkItem,
): ThinkingSummarySection[] {
  const sections: ThinkingSummarySection[] = [];
  const question = item.decisionStatement?.trim();
  const reality = item.currentReality?.trim();

  if (question) {
    sections.push({
      id: "decide",
      label: "What you’re trying to decide",
      body: question,
    });
  }

  if (reality && !sameText(reality, question)) {
    const realityClassified = classifyStrategicInput(reality);
    sections.push({
      id: "happening",
      label: "What seems to be happening",
      // Stance-aware framing — never elevate observation/feeling to fact
      body:
        realityClassified.stance === "fact" && realityClassified.safeToTreatAsFact
          ? reality
          : formatStanceAwareCopy(realityClassified),
    });
  }

  const protect = uniqueLines(
    [
      ...(item.constraints ?? []),
      item.desiredDirection?.trim() &&
      /\bprotect|keep|preserve\b/i.test(item.desiredDirection)
        ? item.desiredDirection.trim()
        : "",
    ].filter(Boolean) as string[],
    question,
    reality,
  );
  if (protect.length) {
    sections.push({
      id: "matters",
      label: "What matters most",
      body: protect,
    });
  } else if (item.desiredDirection?.trim() && !sameText(item.desiredDirection, question)) {
    sections.push({
      id: "matters",
      label: "What matters most",
      body: item.desiredDirection.trim(),
    });
  }

  const known = uniqueLines(
    [...(item.knownFacts ?? [])].filter((f) => {
      const c = classifyStrategicInput(f);
      return c.stance === "fact" && c.safeToTreatAsFact;
    }),
    question,
    reality,
  );
  if (known.length) {
    sections.push({
      id: "known",
      label: "What we know",
      body: known,
    });
  }

  const assumptions = uniqueLines(
    [
      ...(item.assumptions ?? []),
      ...(item.knownFacts ?? []).filter((f) => {
        const c = classifyStrategicInput(f);
        return c.stance === "assumption" || c.stance === "interpretation";
      }),
    ].map((line) => {
      const c = classifyStrategicInput(line);
      if (c.stance === "assumption" || c.stance === "interpretation") {
        return formatStanceAwareCopy(c);
      }
      return line;
    }),
    question,
    reality,
    ...known,
  );
  if (assumptions.length) {
    sections.push({
      id: "assumptions",
      label: "What may still be an assumption",
      body: assumptions,
    });
  }

  const concerns = uniqueLines(
    [...(item.risks ?? [])],
    question,
    reality,
    ...assumptions,
  );
  if (concerns.length) {
    sections.push({
      id: "concerns",
      label: "What concerns you",
      body: concerns,
    });
  }

  const opportunities = uniqueLines(
    [...(item.opportunities ?? [])],
    question,
    reality,
  );
  if (opportunities.length) {
    sections.push({
      id: "opportunity",
      label: "What opportunity you see",
      body: opportunities,
    });
  }

  const limits = uniqueLines(
    [...(item.constraints ?? [])],
    question,
    reality,
    ...protect,
  );
  if (limits.length && !sections.some((s) => s.id === "matters" && Array.isArray(s.body) && s.body.join() === limits.join())) {
    // Only add if distinct from "what matters most"
    if (!sections.some((s) => s.id === "matters")) {
      sections.push({
        id: "limits",
        label: "What limits we need to respect",
        body: limits,
      });
    } else if (protect.join("|") !== limits.join("|")) {
      sections.push({
        id: "limits",
        label: "What limits we need to respect",
        body: limits,
      });
    }
  }

  const observations = uniqueLines(
    [...(item.observations ?? [])].map((obs) =>
      formatStanceAwareCopy(classifyStrategicInput(obs)),
    ),
    question,
    reality,
    ...known,
  );
  // Observations stay tentative — not folded into "what we know"
  const unknownBits: string[] = [];
  if (!reality || sameText(reality, question)) {
    unknownBits.push("What is happening in the current situation");
  }
  if (!item.desiredDirection?.trim() && !item.chosenDirection?.trim()) {
    unknownBits.push("What a good outcome would look like");
  }
  for (const stmt of item.memberStatements ?? []) {
    const classified = classifyStrategicInput(stmt);
    if (classified.stance === "unknown" || classified.stance === "feeling") {
      const line = stmt.trim();
      if (
        line &&
        !sameText(line, question) &&
        !sameText(line, reality) &&
        !unknownBits.some((u) => sameText(u, line))
      ) {
        if (!known.includes(line)) {
          unknownBits.push(formatStanceAwareCopy(classified));
        }
      }
    }
  }
  if (observations.length) {
    for (const obs of observations) {
      if (!unknownBits.some((u) => u.includes(obs) || obs.includes(u))) {
        unknownBits.push(obs);
      }
    }
  }
  if (unknownBits.length) {
    sections.push({
      id: "unknown",
      label: "What is still unknown",
      body: uniqueLines(unknownBits),
    });
  }

  if (item.optionsConsidered?.length) {
    sections.push({
      id: "options",
      label: "Options being considered",
      body: item.optionsConsidered.map((o) => o.title),
    });
  }

  const toTest = uniqueLines(
    [
      ...(item.assumptions ?? []).map((a) => `Assumption to test: ${a}`),
      ...(item.experiments ?? []),
    ],
    question,
  );
  if (toTest.length && (item.assumptions?.length || item.experiments?.length)) {
    sections.push({
      id: "test",
      label: "What may need to be tested",
      body: item.experiments?.length
        ? uniqueLines(item.experiments, question)
        : toTest.slice(0, 3),
    });
  }

  const readiness = readinessMemberCopy(item);
  if (readiness) {
    sections.push({
      id: "readiness",
      label: "Current readiness",
      body: readiness,
    });
  }

  return sections;
}
