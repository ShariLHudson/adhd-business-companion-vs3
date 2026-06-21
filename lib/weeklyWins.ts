/**
 * Wins This Week — encouragement and progress for the current calendar week only.
 * Prior weeks are archived in history and never shown on Today.
 */

import {
  getBrainDumps,
  getMomentumEvents,
  type MomentumEvent,
} from "./companionStore";
import { loadDecisionCompassSession } from "./decisionCompassSessionStore";
import { getActiveSavedWork } from "./savedWorkStore";

export type WeeklyWinStat = {
  id: string;
  label: string;
  count: number;
  icon: string;
};

export type WeeklyWinsSnapshot = {
  weekKey: string;
  weekLabel: string;
  stats: WeeklyWinStat[];
};

export type WeeklyWinsHistoryEntry = WeeklyWinsSnapshot;

/** Individual promotable moment — "what happened" for Wins This Week → Evidence Bank. */
export type WeeklyWinMoment = {
  id: string;
  whatHappened: string;
  ts: string;
  icon: string;
  sourceWinId: string;
};

const HISTORY_KEY = "companion-weekly-wins-history-v1";
const ARCHIVE_CURSOR_KEY = "companion-weekly-wins-archive-cursor-v1";

export function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diff);
  return d;
}

export function weekKeyForDate(date = new Date()): string {
  return startOfWeekMonday(date).toISOString().slice(0, 10);
}

export function isInWeek(iso: string, weekKey: string): boolean {
  const start = new Date(`${weekKey}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t < end.getTime();
}

function weekLabelForKey(weekKey: string): string {
  const start = new Date(`${weekKey}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const sameMonth = start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${start.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })} – ${end.getDate()}`;
  }
  return `${start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} – ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

function readHistory(): WeeklyWinsHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WeeklyWinsHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHistory(entries: WeeklyWinsHistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 52)));
  } catch {
    /* noop */
  }
}

function readArchiveCursor(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ARCHIVE_CURSOR_KEY);
  } catch {
    return null;
  }
}

function writeArchiveCursor(weekKey: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ARCHIVE_CURSOR_KEY, weekKey);
  } catch {
    /* noop */
  }
}

function countDecisionsForWeek(weekKey: string): number {
  const decisions = getActiveSavedWork().filter((w) => {
    const isDecision =
      w.artifactType === "Decision" || w.tags.includes("decision-compass");
    return isDecision && isInWeek(w.updatedAt, weekKey);
  }).length;

  const session = loadDecisionCompassSession();
  const sessionCounts =
    session?.complete &&
    isInWeek(session.lastTouchedAt, weekKey) &&
    decisions === 0;

  return decisions + (sessionCounts ? 1 : 0);
}

function buildStatsForWeek(
  weekKey: string,
  events: MomentumEvent[],
): WeeklyWinStat[] {
  const weekEvents = events.filter((e) => isInWeek(e.ts, weekKey));

  const decisionCount = countDecisionsForWeek(weekKey);
  const projectsAdvanced = weekEvents.filter((e) => e.type === "move").length;
  const tasksCompleted = weekEvents.filter((e) => e.type === "complete").length;
  const focusSessions = weekEvents.filter(
    (e) => e.type === "start" && /focus|pomodoro|timer/i.test(e.label),
  ).length;
  const ideasCaptured =
    weekEvents.filter((e) => e.type === "capture").length +
    getBrainDumps().filter(
      (e) => !e.done && isInWeek(e.createdAt, weekKey),
    ).length;
  const plansCreated = getActiveSavedWork().filter((w) => {
    const blob = `${w.artifactType} ${w.title}`.toLowerCase();
    return /plan|marketing|workshop|sop/.test(blob) && isInWeek(w.createdAt, weekKey);
  }).length;
  const followedThrough = weekEvents.filter(
    (e) =>
      e.type === "resilience" ||
      /avoid|stuck|return|follow.?through|unstuck/i.test(e.label),
  ).length;

  const stats: WeeklyWinStat[] = [];
  if (decisionCount > 0) {
    stats.push({
      id: "decisions",
      label: decisionCount === 1 ? "Made a decision" : "Made decisions",
      count: decisionCount,
      icon: "🧭",
    });
  }
  if (projectsAdvanced > 0) {
    stats.push({
      id: "projects",
      label:
        projectsAdvanced === 1 ? "Advanced a project" : "Advanced projects",
      count: projectsAdvanced,
      icon: "📁",
    });
  }
  if (tasksCompleted > 0) {
    stats.push({
      id: "tasks",
      label: tasksCompleted === 1 ? "Completed a task" : "Completed tasks",
      count: tasksCompleted,
      icon: "✅",
    });
  }
  if (plansCreated > 0) {
    stats.push({
      id: "plans",
      label: plansCreated === 1 ? "Created a plan" : "Created plans",
      count: plansCreated,
      icon: "✨",
    });
  }
  if (ideasCaptured > 0) {
    stats.push({
      id: "ideas",
      label: ideasCaptured === 1 ? "Captured an idea" : "Captured ideas",
      count: ideasCaptured,
      icon: "💡",
    });
  }
  if (focusSessions > 0) {
    stats.push({
      id: "focus",
      label:
        focusSessions === 1
          ? "Completed a focus session"
          : "Completed focus sessions",
      count: focusSessions,
      icon: "🎯",
    });
  }
  if (followedThrough > 0) {
    stats.push({
      id: "follow-through",
      label: "Followed through on something you were avoiding",
      count: followedThrough,
      icon: "💪",
    });
  }

  return stats;
}

export function formatWeeklyWinLine(stat: WeeklyWinStat): string {
  switch (stat.id) {
    case "decisions":
      return `Made ${stat.count} decision${stat.count === 1 ? "" : "s"}`;
    case "projects":
      return `Advanced ${stat.count} project${stat.count === 1 ? "" : "s"}`;
    case "tasks":
      return `Completed ${stat.count} task${stat.count === 1 ? "" : "s"}`;
    case "plans":
      return `Created ${stat.count} plan${stat.count === 1 ? "" : "s"}`;
    case "ideas":
      return `Captured ${stat.count} idea${stat.count === 1 ? "" : "s"}`;
    case "focus":
      return `Completed ${stat.count} focus session${stat.count === 1 ? "" : "s"}`;
    case "follow-through":
      return stat.count === 1
        ? "Followed through on something you were avoiding"
        : `Followed through ${stat.count} times on things you were avoiding`;
    default:
      return `${stat.count} ${stat.label}`;
  }
}

/** Archive the previous week once when a new calendar week begins. */
export function archivePriorWeekIfNeeded(now = new Date()): void {
  const currentKey = weekKeyForDate(now);
  const cursor = readArchiveCursor();
  if (cursor === currentKey) return;

  const events = getMomentumEvents(600);
  const history = readHistory();

  if (cursor && cursor !== currentKey) {
    const alreadyArchived = history.some((entry) => entry.weekKey === cursor);
    if (!alreadyArchived) {
      const stats = buildStatsForWeek(cursor, events);
      if (stats.length > 0) {
        history.unshift({
          weekKey: cursor,
          weekLabel: weekLabelForKey(cursor),
          stats,
        });
        writeHistory(history);
      }
    }
  }

  writeArchiveCursor(currentKey);
}

export function buildWeeklyWins(now = new Date()): WeeklyWinsSnapshot {
  archivePriorWeekIfNeeded(now);
  const weekKey = weekKeyForDate(now);
  const events = getMomentumEvents(600);
  return {
    weekKey,
    weekLabel: weekLabelForKey(weekKey),
    stats: buildStatsForWeek(weekKey, events),
  };
}

export function getWeeklyWinsHistory(): WeeklyWinsHistoryEntry[] {
  archivePriorWeekIfNeeded();
  return readHistory();
}

function momentumWinLabel(event: MomentumEvent): string | null {
  switch (event.type) {
    case "complete":
      return event.label.replace(/^Win:\s*/i, "").trim() || "Completed something meaningful";
    case "move":
      return event.label.trim() || "Advanced a project";
    case "capture":
      return event.label.trim() || "Captured an idea";
    case "resilience":
      return event.label.trim() || "Followed through on something hard";
    case "start":
      if (/focus|pomodoro|timer/i.test(event.label)) {
        return event.label.trim() || "Completed a focus session";
      }
      return null;
    default:
      return null;
  }
}

function momentumWinIcon(event: MomentumEvent): string {
  switch (event.type) {
    case "complete":
      return "✅";
    case "move":
      return "📁";
    case "capture":
      return "💡";
    case "resilience":
      return "💪";
    case "start":
      return "🎯";
    default:
      return "🌟";
  }
}

/** Individual win moments this week — for Save to Evidence Bank. */
export function getWeeklyWinMoments(now = new Date()): WeeklyWinMoment[] {
  archivePriorWeekIfNeeded(now);
  const weekKey = weekKeyForDate(now);
  const events = getMomentumEvents(600).filter((e) => isInWeek(e.ts, weekKey));
  const moments: WeeklyWinMoment[] = [];

  for (const event of events) {
    const label = momentumWinLabel(event);
    if (!label) continue;
    moments.push({
      id: `momentum-${event.id}`,
      whatHappened: label,
      ts: event.ts,
      icon: momentumWinIcon(event),
      sourceWinId: event.id,
    });
  }

  const session = loadDecisionCompassSession();
  if (
    session?.complete &&
    session.decision?.trim() &&
    isInWeek(session.lastTouchedAt, weekKey)
  ) {
    moments.push({
      id: `decision-${session.lastTouchedAt}`,
      whatHappened: `Made a decision: ${session.decision}`,
      ts: session.lastTouchedAt,
      icon: "🧭",
      sourceWinId: `decision-${session.lastTouchedAt}`,
    });
  }

  return moments.sort(
    (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime(),
  );
}

/** All win moments — for Growth timeline (not limited to current week). */
export function getAllWinMoments(): WeeklyWinMoment[] {
  const events = getMomentumEvents(600);
  const moments: WeeklyWinMoment[] = [];

  for (const event of events) {
    const label = momentumWinLabel(event);
    if (!label) continue;
    moments.push({
      id: `momentum-${event.id}`,
      whatHappened: label,
      ts: event.ts,
      icon: momentumWinIcon(event),
      sourceWinId: event.id,
    });
  }

  const session = loadDecisionCompassSession();
  if (session?.complete && session.decision?.trim()) {
    moments.push({
      id: `decision-${session.lastTouchedAt}`,
      whatHappened: `Made a decision: ${session.decision}`,
      ts: session.lastTouchedAt,
      icon: "🧭",
      sourceWinId: `decision-${session.lastTouchedAt}`,
    });
  }

  return moments.sort(
    (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime(),
  );
}
