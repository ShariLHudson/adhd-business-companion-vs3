import { Spark } from "@/lib/spark";

import type { NormalizePhasePayload, ObservePhasePayload, OvernightObservation } from "../types";

function mapSparkToObservations(
  sparkResult: ReturnType<typeof Spark.observe>,
  signalIds: string[],
): OvernightObservation[] {
  const observations: OvernightObservation[] = [];

  for (const pattern of sparkResult.patterns) {
    observations.push({
      id: `obs-pattern-${pattern.id}`,
      kind: "pattern",
      title: pattern.title,
      summary: pattern.summary,
      signalIds,
      confidence: pattern.confidence.score,
    });
  }

  for (const theme of sparkResult.themes) {
    observations.push({
      id: `obs-theme-${theme.id}`,
      kind: "theme",
      title: theme.title,
      summary: theme.summary,
      signalIds,
      confidence: 70,
    });
  }

  for (const finding of sparkResult.findings.slice(0, 3)) {
    const lower = `${finding.title} ${finding.summary}`.toLowerCase();
    const kind = lower.includes("risk")
      ? "risk"
      : lower.includes("opportunity")
        ? "opportunity"
        : "change";
    observations.push({
      id: `obs-finding-${finding.id}`,
      kind,
      title: finding.title,
      summary: finding.summary,
      signalIds,
      confidence: finding.confidence.score,
    });
  }

  if (observations.length === 0) {
    observations.push({
      id: "obs-sample-restart",
      kind: "theme",
      title: "Recurring ADHD restart struggle",
      summary: "Members need shame-free return before productivity prompts.",
      signalIds,
      confidence: 88,
    });
  }

  return observations;
}

export function runObservePhase(input: NormalizePhasePayload): ObservePhasePayload {
  const signalIds = input.signals.map((s) => s.id);
  const sparkResult = Spark.observe();
  const observations = mapSparkToObservations(sparkResult, signalIds);

  return {
    observations,
    patternCount: sparkResult.patterns.length,
    themeCount: sparkResult.themes.length,
  };
}
