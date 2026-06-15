/**
 * Explainable momentum insights.
 */

import { blockerLabel, builderLabel } from "./momentumSignals";
import type { MomentumSnapshot } from "./types";

export function explainMomentum(snapshot: MomentumSnapshot): string[] {
  const lines: string[] = [];
  if (snapshot.momentumBuilders.length > 0) {
    lines.push(
      `Builders: ${snapshot.momentumBuilders.map(builderLabel).join(", ")}`,
    );
  }
  if (snapshot.momentumBlockers.length > 0) {
    lines.push(
      `Blockers: ${snapshot.momentumBlockers.map(blockerLabel).join(", ")}`,
    );
  }
  if (snapshot.wins.length > 0) {
    lines.push(
      `Recent movement: ${snapshot.wins
        .slice(0, 3)
        .map((w) => w.label)
        .join("; ")}`,
    );
  }
  if (!lines.length) {
    lines.push("Limited signal — momentum may still be present in small steps.");
  }
  return lines;
}

export function momentumLevelLabel(level: MomentumSnapshot["momentumLevel"]): string {
  const labels: Record<MomentumSnapshot["momentumLevel"], string> = {
    stalled: "Stalled",
    restarting: "Restarting",
    building: "Building",
    steady: "Steady",
    strong: "Strong",
  };
  return labels[level];
}

export function buildMomentumInsight(snapshot: MomentumSnapshot): string {
  return explainMomentum(snapshot).join(" · ");
}
