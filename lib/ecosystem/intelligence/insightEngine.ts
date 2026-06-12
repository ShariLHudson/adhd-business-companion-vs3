// Founder Ecosystem — Phase 4 Insight Engine.
// Turns patterns + event aggregates into plain-English BUSINESS observations.
// No diagnosis, no medical/mental-health conclusions — productivity only.

import type { FounderEvent, ID } from "../events";
import type { FounderInsight, FounderPattern } from "./intelligenceTypes";
import { MARKETING_RE, eventText, hourOf, weekday } from "./signals";

function mode<T extends string | number>(items: T[]): T | null {
  if (items.length === 0) return null;
  const counts = new Map<T, number>();
  for (const i of items) counts.set(i, (counts.get(i) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]![0];
}
function partOfDay(hour: number): string {
  if (hour < 12) return "the morning";
  if (hour < 17) return "the afternoon";
  return "the evening";
}

export function generateInsights(
  events: FounderEvent[],
  patterns: FounderPattern[],
): FounderInsight[] {
  const out: FounderInsight[] = [];

  // When do focus sessions actually complete?
  const focusDone = events.filter((e) => e.type === "focus.completed");
  if (focusDone.length >= 3) {
    const h = mode(focusDone.map((e) => hourOf(e.ts)));
    if (h !== null) {
      out.push({
        id: "ins-focus-timing",
        text: `Your focus sessions land best in ${partOfDay(h)}.`,
        category: "timing",
        sourceEventIds: focusDone.map((e) => e.id),
      });
    }
  }

  // Which weekday does marketing work cluster on?
  const marketing = events.filter((e) => MARKETING_RE.test(eventText(e)));
  if (marketing.length >= 3) {
    const day = mode(marketing.map((e) => weekday(e.ts)));
    if (day) {
      out.push({
        id: "ins-marketing-day",
        text: `You tend to work on marketing most ${day}s.`,
        category: "timing",
        basedOnPatternType: "marketing-activity",
        sourceEventIds: marketing.map((e) => e.id),
      });
    }
  }

  // Where does completed work concentrate?
  const completions = events.filter(
    (e) =>
      (e.type === "task.completed" ||
        e.type === "focus.completed" ||
        e.type === "document.exported") &&
      e.refs?.projectId,
  );
  if (completions.length >= 3) {
    const proj = mode(completions.map((e) => e.refs!.projectId!));
    if (proj) {
      const title = projectTitle(events, proj) ?? "one project";
      out.push({
        id: "ins-top-project",
        text: `Most of your completed work is connected to ${title}.`,
        category: "project",
        sourceEventIds: completions
          .filter((e) => e.refs?.projectId === proj)
          .map((e) => e.id),
      });
    }
  }

  // Behavioral observation from the abandonment pattern.
  const abandon = patterns.find((p) => p.type === "focus-abandonment");
  if (abandon) {
    out.push({
      id: "ins-abandonment",
      text: "Focus sessions are easier for you to start than to finish — shorter blocks may stick better.",
      category: "focus",
      basedOnPatternType: "focus-abandonment",
      sourceEventIds: abandon.sourceEventIds,
    });
  }

  return out;
}

function projectTitle(events: FounderEvent[], projectId: ID): string | null {
  const created = events.find(
    (e) => e.type === "project.created" && e.refs?.projectId === projectId,
  );
  const t = created?.data?.title;
  return typeof t === "string" ? `the ${t} project` : null;
}
