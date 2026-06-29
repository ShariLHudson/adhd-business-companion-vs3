/**
 * Executive debate mode — internal only; never exposed to member by default.
 */

import type {
  DebateRound,
  DisciplineContribution,
  ExecutiveDisciplineId,
} from "./types";

export function runExecutiveDebate(
  contributions: DisciplineContribution[],
): DebateRound[] {
  if (contributions.length < 2) return [];

  const round1: DebateRound = {
    round: 1,
    positions: contributions.map((c) => ({
      disciplineId: c.disciplineId,
      stance: c.internalRecommendation,
      confidence: c.confidence,
    })),
  };

  const finance = contributions.find((c) => c.disciplineId === "finance");
  const marketing = contributions.find((c) => c.disciplineId === "marketing");

  if (finance && marketing) {
    round1.tension = "Revenue growth vs margin protection";
    return [
      round1,
      {
        round: 2,
        positions: [
          {
            disciplineId: "finance",
            stance: "Stage financial risk — measure before scaling.",
            confidence: "high",
          },
          {
            disciplineId: "marketing",
            stance: "Small test cohort before full rollout.",
            confidence: "high",
          },
          {
            disciplineId: "business-strategy",
            stance: "Choose the constraint that matters most this quarter.",
            confidence: "medium",
          },
        ],
        tension: "Resolved toward staged experiment",
      },
    ];
  }

  const strategy = contributions.find((c) => c.disciplineId === "business-strategy");
  if (strategy && contributions.length >= 3) {
    round1.tension = "Scope vs speed";
    return [round1];
  }

  return [round1];
}

export function debateSummary(rounds: DebateRound[]): string | undefined {
  if (rounds.length === 0) return undefined;
  const last = rounds[rounds.length - 1];
  return last.tension ?? "Perspectives aligned";
}
