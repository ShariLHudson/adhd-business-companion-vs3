// Founder Ecosystem — Phase 4 Pattern Engine.
// Scans the event stream for RECURRING behaviors (≥ a small threshold) and
// returns explainable FounderPattern objects. Business/productivity only.

import type { FounderEvent, ID } from "../events";
import type { FounderPattern, PatternType } from "./intelligenceTypes";
import {
  MARKETING_RE,
  SALES_RE,
  PROCRASTINATION_RE,
  LOW_ENERGY_RE,
  eventText,
  severityFromFrequency,
} from "./signals";

const MIN_FREQUENCY = 2; // "recurring" = seen at least twice

function build(
  type: PatternType,
  label: string,
  matched: FounderEvent[],
): FounderPattern | null {
  if (matched.length < MIN_FREQUENCY) return null;
  const sorted = matched.slice().sort((a, b) => (a.ts < b.ts ? -1 : 1));
  const projectIds = [
    ...new Set(
      matched.map((e) => e.refs?.projectId).filter((x): x is ID => Boolean(x)),
    ),
  ];
  return {
    id: `pat-${type}`,
    type,
    label,
    firstSeen: sorted[0]!.ts,
    lastSeen: sorted[sorted.length - 1]!.ts,
    frequency: matched.length,
    severity: severityFromFrequency(matched.length),
    relatedProjectIds: projectIds,
    sourceEventIds: matched.map((e) => e.id),
  };
}

export function detectPatterns(events: FounderEvent[]): FounderPattern[] {
  const out: (FounderPattern | null)[] = [];

  // Unfinished tasks: created but never completed.
  const completedTasks = new Set(
    events
      .filter((e) => e.type === "task.completed" && e.refs?.taskId)
      .map((e) => e.refs!.taskId!),
  );
  out.push(
    build(
      "unfinished-tasks",
      "Tasks started but not finished",
      events.filter(
        (e) =>
          e.type === "task.created" &&
          e.refs?.taskId &&
          !completedTasks.has(e.refs.taskId),
      ),
    ),
  );

  // Time-block cancellations: created but never completed.
  const completedBlocks = new Set(
    events
      .filter((e) => e.type === "timeblock.completed" && e.refs?.timeBlockId)
      .map((e) => e.refs!.timeBlockId!),
  );
  out.push(
    build(
      "timeblock-cancellations",
      "Scheduled time blocks that didn't happen",
      events.filter(
        (e) =>
          e.type === "timeblock.created" &&
          e.refs?.timeBlockId &&
          !completedBlocks.has(e.refs.timeBlockId),
      ),
    ),
  );

  // Focus abandonment: started but no completion after it (per start).
  const focusStarts = events.filter((e) => e.type === "focus.started");
  const focusCompletes = events.filter((e) => e.type === "focus.completed");
  const abandoned = focusStarts.filter(
    (s) => !focusCompletes.some((c) => c.ts > s.ts && c.ts < addHours(s.ts, 4)),
  );
  out.push(build("focus-abandonment", "Focus sessions left unfinished", abandoned));

  // Document incomplete: created but never exported/finished.
  const exportedDocs = new Set(
    events
      .filter((e) => e.type === "document.exported" && e.refs?.documentId)
      .map((e) => e.refs!.documentId!),
  );
  out.push(
    build(
      "document-incomplete",
      "Documents started without finishing",
      events.filter(
        (e) =>
          e.type === "document.created" &&
          e.refs?.documentId &&
          !exportedDocs.has(e.refs.documentId),
      ),
    ),
  );

  // Project switching: project context changing between consecutive events.
  const projTouches = events
    .filter((e) => e.refs?.projectId)
    .sort((a, b) => (a.ts < b.ts ? -1 : 1));
  const switches: FounderEvent[] = [];
  for (let i = 1; i < projTouches.length; i++) {
    if (projTouches[i]!.refs!.projectId !== projTouches[i - 1]!.refs!.projectId) {
      switches.push(projTouches[i]!);
    }
  }
  out.push(build("project-switching", "Switching between projects often", switches));

  // Low-energy check-ins.
  out.push(
    build(
      "low-energy-checkins",
      "Frequent low-energy days",
      events.filter(
        (e) => e.type === "painpoint.observed" && LOW_ENERGY_RE.test(eventText(e)),
      ),
    ),
  );

  // Procrastination language (in chat).
  out.push(
    build(
      "procrastination-language",
      "Procrastination showing up in your words",
      events.filter(
        (e) => e.type === "chat.coaching" && PROCRASTINATION_RE.test(eventText(e)),
      ),
    ),
  );

  // Marketing activity (recurring focus area).
  out.push(
    build(
      "marketing-activity",
      "Regular marketing work",
      events.filter((e) => MARKETING_RE.test(eventText(e))),
    ),
  );

  // Sales activity (recurring focus area).
  out.push(
    build(
      "sales-activity",
      "Regular sales work",
      events.filter((e) => SALES_RE.test(eventText(e))),
    ),
  );

  return out.filter((p): p is FounderPattern => p !== null);
}

function addHours(ts: string, h: number): string {
  return new Date(new Date(ts).getTime() + h * 3600000).toISOString();
}
