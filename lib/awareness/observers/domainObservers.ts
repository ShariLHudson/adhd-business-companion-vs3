import type { AwarenessConfidence, AwarenessObservation, AwarenessSignal } from "../types";

function confidence(score: number, rationale: string): AwarenessConfidence {
  const level = score >= 80 ? "high" : score >= 60 ? "medium" : score >= 40 ? "low" : "exploratory";
  return { level, score, rationale };
}

export function observeSignal(signal: AwarenessSignal): AwarenessObservation {
  const metricNote =
    signal.metric !== undefined
      ? `Current reading: ${signal.metric}.`
      : "Qualitative shift detected.";

  const shouldAct =
    signal.domain === "growing_opportunity" ||
    signal.domain === "operational_bottleneck" ||
    (signal.metric ?? 0) >= 75;

  const shouldWatch = !shouldAct || signal.domain === "weak_signal" || signal.domain === "research_change";

  return {
    id: `obs-${signal.id}`,
    signalId: signal.id,
    domain: signal.domain,
    title: signal.title,
    summary: signal.summary,
    whatChanged: `${signal.title} — ${metricNote}`,
    whyNoticed: `Observed via ${signal.source.replace(/_/g, " ")}.`,
    whyItMatters: domainImpact(signal),
    whoIsAffected: whoAffected(signal),
    shouldAct,
    shouldWatch,
    confidence: confidence(signal.metric ?? 55, `Source: ${signal.source}`),
  };
}

export function observeSignals(signals: AwarenessSignal[]): AwarenessObservation[] {
  return signals.map(observeSignal);
}

function domainImpact(signal: AwarenessSignal): string {
  const map: Partial<Record<AwarenessSignal["domain"], string>> = {
    mission_movement: "Affects mission pace and what appears on the executive desk.",
    growing_opportunity: "May deserve mission or opportunity attention.",
    founder_behavior: "Affects founder energy and decision quality.",
    repeated_problem: "Repeated friction costs time and confidence.",
    research_change: "May shift product or content direction.",
    operational_bottleneck: "Slows execution until simplified or automated.",
    marketing_momentum: "Affects reach and launch timing.",
    product_momentum: "Affects member experience and revenue path.",
    weak_signal: "Early pattern — worth watching before acting.",
    customer_behavior: "Affects member trust and product priorities.",
    learning_opportunity: "Strengthens capability when addressed calmly.",
  };
  return map[signal.domain] ?? "Worth tracking in executive awareness.";
}

function whoAffected(signal: AwarenessSignal): string {
  if (signal.domain === "customer_behavior") return "Members and customer-facing teams.";
  if (signal.domain === "founder_behavior" || signal.domain === "repeated_problem") {
    return "Founder time and executive focus.";
  }
  if (signal.missionId) return `Mission: ${signal.missionId}.`;
  return "Company-wide executive view.";
}
