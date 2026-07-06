import type { AwarenessChange, AwarenessPattern, AwarenessSignal } from "../types";

export function compareToBaseline(
  current: AwarenessSignal[],
  prior: AwarenessSignal[],
): { matched: number; unmatched: number } {
  const priorDomains = new Set(prior.map((p) => p.domain));
  const matched = current.filter((c) => priorDomains.has(c.domain)).length;
  return { matched, unmatched: current.length - matched };
}

export function detectPatterns(
  signals: AwarenessSignal[],
  changes: AwarenessChange[],
): AwarenessPattern[] {
  const byDomain = new Map<string, AwarenessSignal[]>();
  for (const signal of signals) {
    const list = byDomain.get(signal.domain) ?? [];
    list.push(signal);
    byDomain.set(signal.domain, list);
  }

  const patterns: AwarenessPattern[] = [];

  for (const [domain, domainSignals] of byDomain) {
    if (domainSignals.length < 2) continue;
    const domainChanges = changes.filter((c) =>
      domainSignals.some((s) => s.id === c.signalId),
    );
    const repeated = domainChanges.filter((c) => c.kind === "repeated" || c.kind === "stable");
    if (domainSignals.length >= 2 || repeated.length > 0) {
      patterns.push({
        id: `pat-${domain}`,
        domain: domain as AwarenessPattern["domain"],
        title: `Repeated ${domain.replace(/_/g, " ")} signals`,
        occurrences: domainSignals.length,
        changeKind: domainChanges[0]?.kind ?? "repeated",
        summary: `${domainSignals.length} related observations in this cycle.`,
        signalIds: domainSignals.map((s) => s.id),
      });
    }
  }

  const growing = changes.filter((c) => c.kind === "growing" || c.kind === "emerging");
  if (growing.length >= 2) {
    patterns.push({
      id: "pat-growing-cluster",
      domain: "growing_opportunity",
      title: "Growing cluster",
      occurrences: growing.length,
      changeKind: "growing",
      summary: "Multiple signals trending upward together.",
      signalIds: growing.map((c) => c.signalId),
    });
  }

  return patterns;
}
