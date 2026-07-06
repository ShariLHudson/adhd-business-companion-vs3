import type { CollectPhasePayload, NormalizePhasePayload, NormalizedSignal } from "../types";

function dedupeKey(signal: { source: string; title: string; refId?: string }): string {
  return `${signal.source}:${signal.refId ?? signal.title.toLowerCase().replace(/\s+/g, "-")}`;
}

function categorize(source: string): string {
  switch (source) {
    case "research":
    case "ai-news":
    case "technology":
    case "competitors":
      return "intelligence";
    case "companion":
    case "customer-feedback":
      return "member-voice";
    case "mission":
    case "founder":
    case "decision-vault":
      return "founder-ops";
    case "postcraft":
    case "gohighlevel":
      return "growth";
    case "analytics":
      return "metrics";
    default:
      return "general";
  }
}

export function runNormalizePhase(input: CollectPhasePayload): NormalizePhasePayload {
  const seen = new Set<string>();
  const normalized: NormalizedSignal[] = [];
  let duplicatesRemoved = 0;

  for (const signal of input.signals) {
    const key = dedupeKey(signal);
    if (seen.has(key)) {
      duplicatesRemoved += 1;
      continue;
    }
    seen.add(key);
    normalized.push({
      ...signal,
      category: categorize(signal.source),
      dedupeKey: key,
      relationshipIds: signal.missionIds.map((m) => `rel-${m}-${signal.id}`),
      sparkReady: true,
    });
  }

  return { signals: normalized, duplicatesRemoved };
}
