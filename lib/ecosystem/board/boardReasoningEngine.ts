// Founder Ecosystem — Phase 5 Board Reasoning Engine.
//
// Selects advisors, gathers their (internal) perspectives, resolves conflicts,
// and produces ONE unified response — what the founder actually sees. The
// advisors never speak individually; the board speaks once, as Shari.

import type { ID } from "../models";
import type {
  AdvisorId,
  AdvisorPerspective,
  BoardResponse,
  Level,
} from "./advisorTypes";
import { routeAdvisors } from "./advisorRouter";
import type {
  FounderIntelligence,
  FounderPattern,
  FounderRisk,
  PatternType,
  RiskType,
} from "../intelligence/intelligenceTypes";

const findRisk = (intel: FounderIntelligence, t: RiskType): FounderRisk | undefined =>
  intel.risks.find((r) => r.type === t);
const findPattern = (
  intel: FounderIntelligence,
  t: PatternType,
): FounderPattern | undefined => intel.patterns.find((p) => p.type === t);

// Capacity is "low" when overwhelm or sustained low energy is showing up.
function lowCapacity(intel: FounderIntelligence): boolean {
  return (
    Boolean(findRisk(intel, "repeated-overwhelm")) ||
    (findPattern(intel, "low-energy-checkins")?.severity ?? "low") !== "low"
  );
}

const lvl = (s: Level) => (s === "high" ? 3 : s === "medium" ? 2 : 1);
const fromAvg = (n: number): Level => (n >= 2.5 ? "high" : n >= 1.5 ? "medium" : "low");

// ---- Per-advisor perspective builders (internal) ------------------------
const BUILDERS: Record<
  AdvisorId,
  (intel: FounderIntelligence) => AdvisorPerspective
> = {
  ceo: (intel) => {
    const switching = findPattern(intel, "project-switching");
    const momentum = intel.recommendations.find((r) => /momentum/i.test(r.text));
    if (switching) {
      return {
        advisor: "ceo",
        observation: "Attention is spread across several projects.",
        recommendation:
          "Choose the one that matters most right now and let the rest wait — one direction beats five.",
        confidence: "medium",
        sourceEventIds: switching.sourceEventIds,
      };
    }
    return {
      advisor: "ceo",
      observation: momentum?.reason ?? "One project tends to carry your momentum.",
      recommendation:
        momentum?.text ?? "Anchor the week to your single most important outcome.",
      confidence: "medium",
      sourceEventIds: momentum?.sourceEventIds ?? [],
    };
  },
  marketing: (intel) => {
    const risk = findRisk(intel, "no-marketing-activity");
    return {
      advisor: "marketing",
      observation: risk?.label ?? "Visibility is the quiet lever here.",
      recommendation:
        risk?.suggestedAction ??
        "Turn one real client question into a single post — visibility without a new plan.",
      confidence: risk ? "medium" : "low",
      sourceEventIds: risk?.sourceEventIds ?? [],
    };
  },
  sales: (intel) => {
    const risk = findRisk(intel, "no-sales-activity");
    return {
      advisor: "sales",
      observation: risk?.label ?? "Revenue comes from warm conversations.",
      recommendation:
        risk?.suggestedAction ??
        "Message one warm lead today — one touch keeps the pipeline alive.",
      confidence: risk ? "high" : "low",
      sourceEventIds: risk?.sourceEventIds ?? [],
    };
  },
  operations: (intel) => {
    const docPattern = findPattern(intel, "document-incomplete");
    return {
      advisor: "operations",
      observation:
        docPattern?.label ?? "Some of this work repeats — it's systemizable.",
      recommendation:
        "Write the steps down once as a checklist so future-you doesn't rebuild it.",
      confidence: docPattern ? "medium" : "low",
      sourceEventIds: docPattern?.sourceEventIds ?? [],
    };
  },
  productivity: (intel) => {
    const next = intel.recommendations.find((r) => /schedule|block|next/i.test(r.text));
    return {
      advisor: "productivity",
      observation: "Momentum comes from one small, concrete step.",
      recommendation:
        next?.text ?? "Pick the single most important thing and protect 25 minutes for it.",
      confidence: "high",
      sourceEventIds: next?.sourceEventIds ?? [],
    };
  },
  accountability: (intel) => {
    const unfinished = findPattern(intel, "unfinished-tasks");
    return {
      advisor: "accountability",
      observation:
        unfinished?.label ?? "Closing an open loop frees more energy than starting a new one.",
      recommendation:
        "Finish one thing you already started before opening anything new.",
      confidence: unfinished ? "medium" : "low",
      sourceEventIds: unfinished?.sourceEventIds ?? [],
    };
  },
  wellness: (intel) => {
    const overwhelm = findRisk(intel, "repeated-overwhelm");
    const low = lowCapacity(intel);
    return {
      advisor: "wellness",
      // Workload / energy / capacity ONLY — never a diagnosis.
      observation: low
        ? "Capacity looks stretched this week."
        : "Capacity looks okay right now.",
      recommendation: low
        ? "Make today smaller — one focused block is enough; the rest can wait."
        : "There's room for one meaningful block today.",
      confidence: low ? "high" : "low",
      sourceEventIds: overwhelm?.sourceEventIds ?? [],
    };
  },
};

// ---- Synthesis: many perspectives → one response ------------------------
function synthesize(
  primary: AdvisorPerspective,
  perspectives: AdvisorPerspective[],
  intel: FounderIntelligence,
): { message: string; rationale: string } {
  const capacityLow = lowCapacity(intel);
  const support = perspectives.find(
    (p) => p.advisor !== primary.advisor && p.confidence !== "low",
  );

  // Conflict resolution: when capacity is low, pace beats push — the wellness
  // view moderates the primary, even if the primary wants more output.
  const lead =
    capacityLow && primary.advisor !== "wellness"
      ? `Let's keep today small. ${primary.recommendation}`
      : primary.recommendation;

  const supportClause =
    support && support.advisor !== "wellness"
      ? ` And while you're at it: ${lowerFirst(support.recommendation)}`
      : capacityLow
        ? " One focused block is plenty today — you don't have to do it all."
        : "";

  const message = `${lead}${supportClause}`;
  const rationale = `Primary: ${primary.advisor}. Capacity ${
    capacityLow ? "low → paced" : "ok"
  }. Combined ${perspectives.map((p) => p.advisor).join(", ")}.`;
  return { message, rationale };
}

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

// ---- Public entry point -------------------------------------------------
export function deliberate(
  message: string,
  intel: FounderIntelligence,
): BoardResponse {
  const routing = routeAdvisors(message, intel);
  const ids: AdvisorId[] = [routing.primary, ...routing.secondary];
  const perspectives = ids.map((id) => BUILDERS[id](intel));
  const primary = perspectives[0]!;
  const { message: unified, rationale } = synthesize(primary, perspectives, intel);
  const confidence = fromAvg(
    perspectives.reduce((s, p) => s + lvl(p.confidence), 0) / perspectives.length,
  );

  const sourceEventIds: ID[] = [
    ...new Set(perspectives.flatMap((p) => p.sourceEventIds)),
  ];
  void sourceEventIds;

  return {
    message: unified,
    primaryAdvisor: routing.primary,
    secondaryAdvisors: routing.secondary,
    perspectives,
    rationale,
    confidence,
  };
}
