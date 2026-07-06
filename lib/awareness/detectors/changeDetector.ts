import type { AwarenessChange, AwarenessConfidence, AwarenessSignal, ChangeKind } from "../types";
import { SAMPLE_PRIOR_SIGNALS } from "../sample";

function confidence(score: number, rationale: string): AwarenessConfidence {
  const level = score >= 80 ? "high" : score >= 60 ? "medium" : score >= 40 ? "low" : "exploratory";
  return { level, score, rationale };
}

function classifyChange(current: number, prior: number): ChangeKind {
  const delta = current - prior;
  if (prior === 0 && current > 0) return "emerging";
  if (current === 0 && prior > 0) return "missing";
  if (delta >= 15) return "growing";
  if (delta <= -15) return "declining";
  if (Math.abs(delta) <= 3 && prior > 0) return "stable";
  if (delta >= 5) return "recovered";
  if (delta <= -5) return "dormant";
  return "stable";
}

function matchPrior(signal: AwarenessSignal) {
  return SAMPLE_PRIOR_SIGNALS.find(
    (p) => p.domain === signal.domain || p.id.replace("prior-", "sig-") === signal.id,
  );
}

export function detectChange(signal: AwarenessSignal): AwarenessChange | null {
  const prior = matchPrior(signal);
  if (signal.metric === undefined) {
    if (signal.domain === "weak_signal") {
      return {
        id: `chg-${signal.id}`,
        signalId: signal.id,
        kind: "emerging",
        title: signal.title,
        summary: "Weak signal — not yet in prior baseline.",
        confidence: confidence(45, "Emerging qualitative signal"),
      };
    }
    return null;
  }

  const priorMetric = prior?.metric ?? signal.metric;
  const kind = classifyChange(signal.metric, priorMetric);
  const delta = signal.metric - priorMetric;

  if (kind === "stable" && Math.abs(delta) < 5) return null;

  return {
    id: `chg-${signal.id}`,
    signalId: signal.id,
    kind,
    title: `${signal.title} — ${kind}`,
    summary: `Moved from ${priorMetric} to ${signal.metric} (${delta >= 0 ? "+" : ""}${delta}).`,
    delta,
    confidence: confidence(
      Math.min(95, 50 + Math.abs(delta)),
      `Compared to prior awareness baseline`,
    ),
  };
}

export function detectChanges(signals: AwarenessSignal[]): AwarenessChange[] {
  return signals.map(detectChange).filter((c): c is AwarenessChange => c !== null);
}

export function isUnexpectedChange(change: AwarenessChange): boolean {
  return change.kind === "unexpected" || change.kind === "emerging" || change.kind === "missing";
}
