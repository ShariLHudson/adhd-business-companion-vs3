import type {
  ExperimentMetricRow,
  ExperimentPendingAction,
  ExperimentRecommendation,
} from "./types";

export function buildPendingActions(
  experiments: ExperimentMetricRow[],
): ExperimentPendingAction[] {
  const actions: ExperimentPendingAction[] = [];

  for (const e of experiments) {
    if (e.status === "idea") {
      actions.push({
        id: `act-start-${e.id}`,
        experimentId: e.id,
        experimentTitle: e.title,
        action: "Move to testing and define first milestone",
      });
    } else if (e.status === "testing") {
      actions.push({
        id: `act-result-${e.id}`,
        experimentId: e.id,
        experimentTitle: e.title,
        action: "Record result and mark successful or failed",
      });
    } else if (e.status === "failed" && !e.result.trim()) {
      actions.push({
        id: `act-review-${e.id}`,
        experimentId: e.id,
        experimentTitle: e.title,
        action: "Document failure notes and decide follow-up experiment",
      });
    }
  }

  return actions.slice(0, 10);
}

export function buildExperimentRecommendations(
  experiments: ExperimentMetricRow[],
): ExperimentRecommendation[] {
  const recs: ExperimentRecommendation[] = [];
  const finished = experiments.filter((e) => e.success !== null);
  const successful = finished.filter((e) => e.success === true);
  const failed = finished.filter((e) => e.success === false);

  const tagSuccess = new Map<string, { ok: number; total: number }>();
  for (const e of finished) {
    for (const tag of e.tags) {
      const row = tagSuccess.get(tag) ?? { ok: 0, total: 0 };
      row.total += 1;
      if (e.success) row.ok += 1;
      tagSuccess.set(tag, row);
    }
  }

  const topTag = [...tagSuccess.entries()]
    .filter(([, v]) => v.total >= 2)
    .sort((a, b) => b[1].ok / b[1].total - a[1].ok / a[1].total)[0];

  if (topTag && topTag[1].ok / topTag[1].total >= 0.6) {
    recs.push({
      id: "rec-double-down",
      title: `Run another ${topTag[0]} experiment`,
      rationale: `${Math.round((topTag[1].ok / topTag[1].total) * 100)}% success rate in this area — iterate while momentum is high.`,
      priority: "high",
    });
  }

  const stuckTesting = experiments.filter(
    (e) => e.status === "testing" && e.durationDays > 14,
  );
  if (stuckTesting.length) {
    recs.push({
      id: "rec-unblock-testing",
      title: "Unblock long-running tests",
      rationale: `${stuckTesting.length} experiment(s) in testing for 2+ weeks — pick one to finish or park.`,
      priority: "high",
    });
  }

  if (failed.length >= 2) {
    const pattern = failed
      .flatMap((e) => e.tags)
      .reduce(
        (acc, t) => {
          acc[t] = (acc[t] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );
    const weakTag = Object.entries(pattern).sort((a, b) => b[1] - a[1])[0];
    if (weakTag) {
      recs.push({
        id: "rec-review-failures",
        title: `Review ${weakTag[0]} experiment failures`,
        rationale: `${weakTag[1]} failed experiment(s) tagged "${weakTag[0]}" — narrow scope before retrying.`,
        priority: "medium",
      });
    }
  }

  const highCompletion = [...experiments]
    .filter((e) => e.completionRate >= 80 && e.success === true)
    .sort((a, b) => b.completionRate - a.completionRate)[0];
  if (highCompletion) {
    recs.push({
      id: "rec-scale-winner",
      title: `Scale learnings from "${highCompletion.title}"`,
      rationale: "High completion and success — document playbook and apply to next project.",
      priority: "medium",
    });
  }

  if (recs.length === 0 && experiments.some((e) => e.status === "idea")) {
    recs.push({
      id: "rec-start-one",
      title: "Start your highest-priority idea experiment",
      rationale: "Several ideas queued — pick one with clear expected outcome and begin testing.",
      priority: "low",
    });
  }

  return recs.slice(0, 5);
}

export function detectBottlenecks(experiments: ExperimentMetricRow[]): string[] {
  const notes: string[] = [];

  const slow = experiments.filter(
    (e) =>
      e.avgDaysPerMilestone !== null && e.avgDaysPerMilestone > 7 && e.success === null,
  );
  if (slow.length) {
    notes.push(
      `${slow.length} experiment(s) averaging >7 days per milestone — check scope or blockers.`,
    );
  }

  const lowCompletion = experiments.filter(
    (e) => e.status === "testing" && e.completionRate < 40,
  );
  if (lowCompletion.length) {
    notes.push(
      `${lowCompletion.length} in-progress experiment(s) below 40% milestone completion.`,
    );
  }

  const costly = experiments.filter((e) => e.estimatedCostUsd > 1);
  if (costly.length) {
    notes.push(
      `High API cost on ${costly.map((e) => e.title).slice(0, 2).join(", ")} — batch guidance queries.`,
    );
  }

  return notes.slice(0, 5);
}
