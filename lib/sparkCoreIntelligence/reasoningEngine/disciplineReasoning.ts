/**
 * Discipline conflict resolution, recommendations, tradeoffs, risks.
 */

import type { DisciplineId } from "@/lib/sparkResponseIntelligence/types";

import type {
  ConfidenceLevel,
  DisciplinePosition,
  RankedRecommendation,
  ReasoningMode,
  Risk,
  Tradeoff,
} from "./types";

export function buildDisciplinePositions(
  disciplines: DisciplineId[],
  message: string,
  mode: ReasoningMode,
): DisciplinePosition[] {
  const lower = message.toLowerCase();

  return disciplines.map((id) => {
    if (id === "finance" && /\b(price|pricing|prices|raise|raising)\b/.test(lower)) {
      return {
        disciplineId: id,
        recommendation: "Protect margin unless volume gain is proven",
        confidence: "medium" as ConfidenceLevel,
        certaintyKind: "recommendation" as const,
      };
    }
    if (id === "marketing" && /\b(price|pricing|prices|raise|raising)\b/.test(lower)) {
      return {
        disciplineId: id,
        recommendation: "Test price with segment before broad change",
        confidence: "medium" as ConfidenceLevel,
        certaintyKind: "recommendation" as const,
      };
    }
    if (id === "marketing") {
      return {
        disciplineId: id,
        recommendation: "Clarify audience and message before tactics",
        confidence: "medium" as ConfidenceLevel,
        certaintyKind: "recommendation" as const,
      };
    }
    if (id === "research") {
      return {
        disciplineId: id,
        recommendation: "Verify claims with current sources",
        confidence: "medium" as ConfidenceLevel,
        certaintyKind: "fact" as const,
      };
    }
    return {
      disciplineId: id,
      recommendation: `Apply ${id.replace("-", " ")} lens to: ${message.slice(0, 50)}`,
      confidence: "medium" as ConfidenceLevel,
      certaintyKind: "opinion" as const,
    };
  });
}

export function resolveDisciplineConflicts(
  positions: DisciplinePosition[],
): string | undefined {
  const finance = positions.find((p) => p.disciplineId === "finance");
  const marketing = positions.find((p) => p.disciplineId === "marketing");

  if (
    finance &&
    marketing &&
    finance.recommendation.includes("margin") &&
    marketing.recommendation.includes("Test price")
  ) {
    return "Balance margin protection with a small, measured price test on your warmest segment.";
  }

  if (positions.length <= 1) return undefined;
  return undefined;
}

export function rankRecommendations(
  positions: DisciplinePosition[],
  mode: ReasoningMode,
  conflictResolved?: string,
): RankedRecommendation[] {
  if (conflictResolved) {
    return [
      {
        rank: 1,
        text: conflictResolved,
        rationale: "Reconciles discipline perspectives",
        certaintyKind: "recommendation",
      },
    ];
  }

  if (positions.length === 0) {
    if (mode === "quick_answer") {
      return [
        {
          rank: 1,
          text: "Answer directly from established knowledge",
          rationale: "Simple question — no discipline stack needed",
          certaintyKind: "fact",
        },
      ];
    }
    return [];
  }

  const primary = positions[0];
  const ranked: RankedRecommendation[] = [
    {
      rank: 1,
      text: primary.recommendation,
      rationale: `Primary lens: ${primary.disciplineId}`,
      certaintyKind: primary.certaintyKind,
    },
  ];

  if (positions[1]) {
    ranked.push({
      rank: 2,
      text: positions[1].recommendation,
      rationale: `Alternative: ${positions[1].disciplineId}`,
      certaintyKind: positions[1].certaintyKind,
    });
  }

  return ranked;
}

export function analyzeTradeoffs(message: string, mode: ReasoningMode): Tradeoff[] {
  const lower = message.toLowerCase();
  if (mode !== "decision_support" && !/\b(price|pricing|prices)\b/.test(lower)) {
    return [];
  }

  if (/\b(price|pricing|prices|raise)\b/.test(lower)) {
    return [
      {
        dimension: "Revenue vs conversion",
        optionA: "Raise price — protect margin",
        optionB: "Hold price — maximize volume",
        note: "Test on a small segment before rolling out",
      },
    ];
  }

  return [];
}

export function identifyRisks(mode: ReasoningMode, message: string): Risk[] {
  const risks: Risk[] = [];
  const lower = message.toLowerCase();

  if (mode === "executive_board_reasoning") {
    risks.push({
      description: "High-stakes decision — verify assumptions before committing",
      severity: "high",
    });
  }

  if (/\b(launch|hire|invest)\b/.test(lower)) {
    risks.push({
      description: "Irreversible or costly commitment — stage the decision",
      severity: "medium",
    });
  }

  if (mode === "research_reasoning") {
    risks.push({
      description: "Stale or unverified data may mislead",
      severity: "medium",
    });
  }

  return risks;
}

export function weightEvidence(
  known: { weight: number }[],
): number {
  if (known.length === 0) return 0;
  return known.reduce((sum, k) => sum + k.weight, 0) / known.length;
}
