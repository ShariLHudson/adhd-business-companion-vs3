/**
 * Founder-facing recognition reporting (aggregate, privacy-safe).
 * Ready for server sync — currently reads local sent log + store shape.
 */

import type { RecognitionEventType } from "./types";
import { getRecognitionStore } from "./recognitionStore";

export type FounderRecognitionReport = {
  generatedAt: string;
  upcomingBirthdays: number;
  upcomingAnniversaries: number;
  eventsSentLast30Days: Partial<Record<RecognitionEventType, number>>;
  /** Most common milestone keys celebrated. */
  topMilestones: { milestoneKey: string; count: number }[];
  /** Event types ranked by frequency. */
  mostCommonMilestoneTypes: { type: RecognitionEventType; count: number }[];
  notes: string;
};

export function buildFounderRecognitionReport(
  now = new Date(),
): FounderRecognitionReport {
  const store = getRecognitionStore();
  const since = now.getTime() - 30 * 86_400_000;

  const eventsSentLast30Days: Partial<Record<RecognitionEventType, number>> =
    {};
  const typeCounts = new Map<RecognitionEventType, number>();

  for (const entry of store.sentLog) {
    if (new Date(entry.at).getTime() < since) continue;
    eventsSentLast30Days[entry.type] =
      (eventsSentLast30Days[entry.type] ?? 0) + 1;
    typeCounts.set(entry.type, (typeCounts.get(entry.type) ?? 0) + 1);
  }

  const milestoneCounts = new Map<string, number>();
  for (const entry of store.sentLog) {
    milestoneCounts.set(
      entry.milestoneKey,
      (milestoneCounts.get(entry.milestoneKey) ?? 0) + 1,
    );
  }

  const topMilestones = [...milestoneCounts.entries()]
    .map(([milestoneKey, count]) => ({ milestoneKey, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const mostCommonMilestoneTypes = [...typeCounts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const upcomingBirthdays = store.birthday ? 1 : 0;
  const upcomingAnniversaries = store.personalDates.filter(
    (d) => d.kind === "anniversary",
  ).length;

  return {
    generatedAt: now.toISOString(),
    upcomingBirthdays,
    upcomingAnniversaries,
    eventsSentLast30Days,
    topMilestones,
    mostCommonMilestoneTypes,
    notes:
      "Local preview — connect server-side user profiles for org-wide upcoming dates.",
  };
}
