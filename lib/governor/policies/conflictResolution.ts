import type { GovernorConflict, IncomingRecommendation } from "../types";

export function resolveConflicts(items: IncomingRecommendation[]): GovernorConflict[] {
  const conflicts: GovernorConflict[] = [];
  const bySource = new Map<string, IncomingRecommendation[]>();

  for (const item of items) {
    const list = bySource.get(item.source) ?? [];
    list.push(item);
    bySource.set(item.source, list);
  }

  for (const [source, group] of bySource) {
    if (group.length < 2) continue;
    const sorted = [...group].sort((a, b) => b.leverageScore - a.leverageScore);
    const winner = sorted[0];
    conflicts.push({
      id: `conflict-${source}`,
      competingIds: sorted.map((s) => s.id),
      winnerId: winner.id,
      explanation: `${sorted.length} ${source} recommendations competed — selected highest leverage without exaggeration.`,
    });
  }

  const topTwo = items.slice(0, 2);
  if (topTwo.length === 2 && Math.abs(topTwo[0].leverageScore - topTwo[1].leverageScore) <= 5) {
    conflicts.push({
      id: "conflict-cross-system",
      competingIds: topTwo.map((t) => t.id),
      winnerId: topTwo[0].id,
      explanation: `Close scores (${topTwo[0].systemLabel} vs ${topTwo[1].systemLabel}) — Governor chose one primary to protect attention.`,
    });
  }

  return conflicts.slice(0, 5);
}

export function dedupeByConflict(
  items: IncomingRecommendation[],
  conflicts: GovernorConflict[],
): IncomingRecommendation[] {
  const losers = new Set<string>();
  for (const conflict of conflicts) {
    for (const id of conflict.competingIds) {
      if (id !== conflict.winnerId) losers.add(id);
    }
  }
  return items.filter((i) => !losers.has(i.id));
}
