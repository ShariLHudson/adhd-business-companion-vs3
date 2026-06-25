/**
 * Momentum Intelligence™ — chain reaction, not urgency.
 * @see constitution.ts — generateMomentumAction
 */

import type {
  AssembledContext,
  CompanionCandidate,
  DayMode,
  MomentumAction,
} from "./types";

function scoreCandidate(
  c: CompanionCandidate,
  dayMode: DayMode,
  energy: AssembledContext["capacity"]["energy"],
): number {
  const unlock = c.unlockScore * 0.3;
  const fit = c.fitScore * 0.25;
  const compound = (c.themes.includes("unlock") ? 0.25 : 0.1) * 0.25;
  const energyFit =
    energy === "low" && (c.estimatedMinutes ?? 30) <= 20 ? 0.2 : 0.1;
  const creative =
    dayMode === "creative" && c.themes.includes("explore") ? 0.3 : 0;
  return unlock + fit + compound + energyFit + creative;
}

function pickTop(
  candidates: CompanionCandidate[],
  ctx: AssembledContext,
): CompanionCandidate | null {
  if (!candidates.length) return null;
  const sorted = [...candidates].sort(
    (a, b) => scoreCandidate(b, ctx.dayMode, ctx.capacity.energy) -
      scoreCandidate(a, ctx.dayMode, ctx.capacity.energy),
  );
  return sorted[0] ?? null;
}

export function generateMomentumAction(ctx: AssembledContext): MomentumAction {
  if (ctx.cycleState === "protected") {
    return {
      candidateId: null,
      label: null,
      kind: "none",
      reason: "Flow protection — no replan during hyperfocus.",
    };
  }

  switch (ctx.dayMode) {
    case "celebration":
      return {
        candidateId: null,
        label: null,
        kind: "none",
        reason: "Celebration day — accomplishment stands alone.",
      };
    case "recovery":
      return {
        candidateId: null,
        label: null,
        kind: "none",
        reason: "Recovery day — space before tasks.",
      };
    case "creative": {
      return {
        candidateId: "exploration-block",
        label: "Exploration block — capture and cluster ideas",
        kind: "explorationBlock",
        durationMinutes: 45,
        reason: "Creative energy respected — explore before committing.",
      };
    }
    case "health": {
      const health = ctx.candidates.find((c) =>
        c.themes.includes("health"),
      );
      if (health) {
        return {
          candidateId: health.id,
          label: health.label,
          kind: "action",
          reason: "Health is the plan today.",
        };
      }
      return {
        candidateId: null,
        label: "Rest and attend scheduled care",
        kind: "action",
        reason: "Health day — body leads.",
      };
    }
    case "family": {
      const courtesy = ctx.candidates.find((c) =>
        c.themes.includes("courtesy"),
      );
      if (courtesy) {
        return {
          candidateId: courtesy.id,
          label: courtesy.label,
          kind: "action",
          reason: "One professional courtesy, then family.",
        };
      }
      return {
        candidateId: null,
        label: "Notify and reschedule commitments",
        kind: "action",
        reason: "Family first — minimal business courtesy.",
      };
    }
    case "survival": {
      const light = pickTop(
        ctx.candidates.filter((c) => (c.estimatedMinutes ?? 60) <= 15),
        ctx,
      );
      if (light) {
        return {
          candidateId: light.id,
          label: light.label,
          kind: "action",
          reason: "Optional low-cognitive anchor — survival mode.",
        };
      }
      return {
        candidateId: null,
        label: null,
        kind: "none",
        reason: "Survival mode — no required anchor.",
      };
    }
    default: {
      const top = pickTop(ctx.candidates, ctx);
      if (!top) {
        return {
          candidateId: null,
          label: null,
          kind: "none",
          reason: "No candidates — orientation only.",
        };
      }
      return {
        candidateId: top.id,
        label: top.label,
        kind: top.themes.includes("explore") ? "explorationBlock" : "action",
        durationMinutes: top.estimatedMinutes,
        reason: `Highest unlock fit: ${top.label}`,
      };
    }
  }
}
