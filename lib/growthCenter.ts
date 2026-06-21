/**
 * Growth Center — home for progress, impact, confidence, and reflection.
 * Phase 1: Wins + Evidence timeline, search, and summary cards.
 */

import {
  getEvidenceDashboardStats,
  getEvidenceEntries,
  type EvidenceEntry,
} from "./evidenceBankStore";
import {
  getConfidenceDashboardStats,
} from "./confidenceVaultStore";
import { getJourneyDashboardStats } from "./myJourneyStore";
import {
  buildWeeklyWins,
  getAllWinMoments,
  type WeeklyWinMoment,
} from "./weeklyWins";

export type GrowthFilter = "all" | "wins" | "evidence";

export type GrowthTimelineKind = "win" | "evidence";

export type GrowthTimelineItem = {
  id: string;
  kind: GrowthTimelineKind;
  ts: string;
  dateLabel: string;
  title: string;
  subtitle?: string;
  icon: string;
};

export type GrowthSummary = {
  weekLabel: string;
  winCount: number;
  evidenceTotal: number;
  problemsSolved: number;
  thingsImproved: number;
  confidenceTotal: number;
  confidenceFavorites: number;
  journeyTotal: number;
  journeyChapters: number;
};

export type GrowthTimelineGroup = {
  dateLabel: string;
  items: GrowthTimelineItem[];
};

function timelineDateLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const itemDay = new Date(d);
  itemDay.setHours(0, 0, 0, 0);
  if (itemDay.getTime() === today.getTime()) return "Today";
  if (itemDay.getTime() === yesterday.getTime()) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric" });
}

function winToTimelineItem(moment: WeeklyWinMoment): GrowthTimelineItem {
  return {
    id: moment.id,
    kind: "win",
    ts: moment.ts,
    dateLabel: timelineDateLabel(moment.ts),
    title: moment.whatHappened,
    icon: moment.icon,
  };
}

function evidenceToTimelineItem(entry: EvidenceEntry): GrowthTimelineItem {
  const subtitle =
    entry.whyItMattered.trim() ||
    entry.whatProblemSolved.trim() ||
    entry.whatImproved.trim() ||
    undefined;
  return {
    id: entry.id,
    kind: "evidence",
    ts: entry.createdAt,
    dateLabel: timelineDateLabel(entry.createdAt),
    title: entry.whatHappened,
    subtitle,
    icon: "📈",
  };
}

export function getGrowthSummary(): GrowthSummary {
  const wins = buildWeeklyWins();
  const winCount = wins.stats.reduce((sum, stat) => sum + stat.count, 0);
  const evidence = getEvidenceDashboardStats();
  const confidence = getConfidenceDashboardStats();
  const journey = getJourneyDashboardStats();
  return {
    weekLabel: wins.weekLabel,
    winCount,
    evidenceTotal: evidence.totalEntries,
    problemsSolved: evidence.problemsSolved,
    thingsImproved: evidence.thingsImproved,
    confidenceTotal: confidence.total,
    confidenceFavorites: confidence.favorites,
    journeyTotal: journey.total,
    journeyChapters: journey.lifeChapters,
  };
}

export function buildGrowthTimeline(
  filter: GrowthFilter = "all",
): GrowthTimelineGroup[] {
  const items: GrowthTimelineItem[] = [];

  if (filter === "all" || filter === "wins") {
    items.push(...getAllWinMoments().map(winToTimelineItem));
  }
  if (filter === "all" || filter === "evidence") {
    items.push(...getEvidenceEntries().map(evidenceToTimelineItem));
  }

  items.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

  const groups = new Map<string, GrowthTimelineItem[]>();
  for (const item of items) {
    const list = groups.get(item.dateLabel) ?? [];
    list.push(item);
    groups.set(item.dateLabel, list);
  }

  return Array.from(groups.entries()).map(([dateLabel, groupItems]) => ({
    dateLabel,
    items: groupItems,
  }));
}

export function searchGrowthItems(
  query: string,
  filter: GrowthFilter = "all",
): GrowthTimelineItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const matches: GrowthTimelineItem[] = [];

  if (filter === "all" || filter === "wins") {
    for (const moment of getAllWinMoments()) {
      if (moment.whatHappened.toLowerCase().includes(q)) {
        matches.push(winToTimelineItem(moment));
      }
    }
  }

  if (filter === "all" || filter === "evidence") {
    for (const entry of getEvidenceEntries()) {
      const haystack = [
        entry.whatHappened,
        entry.whyItMattered,
        entry.whatImproved,
        entry.whatMovedForward,
        entry.whatProblemSolved,
        entry.whoBenefited,
        entry.whatThisProves,
        entry.category,
      ]
        .join(" ")
        .toLowerCase();
      if (haystack.includes(q)) {
        matches.push(evidenceToTimelineItem(entry));
      }
    }
  }

  return matches.sort(
    (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime(),
  );
}

export function hasGrowthData(): boolean {
  const summary = getGrowthSummary();
  return (
    summary.winCount > 0 ||
    summary.evidenceTotal > 0 ||
    summary.confidenceTotal > 0 ||
    summary.journeyTotal > 0
  );
}
