// Founder Ecosystem — Phase 4 Risk Engine.
// Surfaces potential founder risks with an explainable, supportive suggested
// action. Business/productivity only — never medical, legal, or financial.

import type { FounderEvent, ID } from "../events";
import type { FounderRisk } from "./intelligenceTypes";
import {
  MARKETING_RE,
  SALES_RE,
  OVERWHELM_RE,
  asStr,
  daysAgoFrom,
  eventText,
} from "./signals";

export function detectRisks(
  events: FounderEvent[],
  now: string = new Date().toISOString(),
): FounderRisk[] {
  const out: FounderRisk[] = [];
  const sorted = events.slice().sort((a, b) => (a.ts < b.ts ? -1 : 1));

  // Stalled projects: active, but no activity in 10+ days.
  const completedProjects = new Set(
    events
      .filter((e) => e.type === "project.completed" && e.refs?.projectId)
      .map((e) => e.refs!.projectId!),
  );
  for (const created of events.filter(
    (e) => e.type === "project.created" && e.refs?.projectId,
  )) {
    const pid = created.refs!.projectId!;
    if (completedProjects.has(pid)) continue;
    const touches = events.filter((e) => e.refs?.projectId === pid);
    const lastTs = touches.map((e) => e.ts).sort().slice(-1)[0]!;
    if (daysAgoFrom(now, lastTs) >= 10) {
      out.push({
        id: `risk-stalled-${pid}`,
        type: "project-stalled",
        label: `"${asStr(created.data?.title) || "A project"}" has gone quiet`,
        severity: daysAgoFrom(now, lastTs) >= 21 ? "high" : "medium",
        detectedAt: now,
        relatedProjectIds: [pid],
        suggestedAction:
          "Open it for two minutes and set one tiny next step — momentum beats a plan.",
        sourceEventIds: touches.map((e) => e.id),
      });
    }
  }

  // No sales activity in 14 days.
  const salesEvents = events.filter((e) => SALES_RE.test(eventText(e)));
  const lastSales = salesEvents.map((e) => e.ts).sort().slice(-1)[0];
  if (!lastSales || daysAgoFrom(now, lastSales) >= 14) {
    out.push({
      id: "risk-no-sales",
      type: "no-sales-activity",
      label: "No sales activity in the last two weeks",
      severity: "medium",
      detectedAt: now,
      relatedProjectIds: [],
      suggestedAction:
        "List 3 warm leads and message one today — one touch keeps the pipeline alive.",
      sourceEventIds: salesEvents.slice(-3).map((e) => e.id),
    });
  }

  // No marketing activity in 10 days.
  const mktEvents = events.filter((e) => MARKETING_RE.test(eventText(e)));
  const lastMkt = mktEvents.map((e) => e.ts).sort().slice(-1)[0];
  if (!lastMkt || daysAgoFrom(now, lastMkt) >= 10) {
    out.push({
      id: "risk-no-marketing",
      type: "no-marketing-activity",
      label: "No marketing activity in the last 10 days",
      severity: "low",
      detectedAt: now,
      relatedProjectIds: [],
      suggestedAction:
        "Turn one recent client question into a single post — visibility without a new plan.",
      sourceEventIds: mktEvents.slice(-3).map((e) => e.id),
    });
  }

  // Repeated overwhelm in the last 7 days.
  const overwhelm = events.filter(
    (e) =>
      e.type === "painpoint.observed" &&
      OVERWHELM_RE.test(eventText(e)) &&
      daysAgoFrom(now, e.ts) <= 7,
  );
  if (overwhelm.length >= 3) {
    out.push({
      id: "risk-overwhelm",
      type: "repeated-overwhelm",
      label: "Overwhelm has come up several times this week",
      severity: overwhelm.length >= 5 ? "high" : "medium",
      detectedAt: now,
      relatedProjectIds: [
        ...new Set(
          overwhelm.map((e) => e.refs?.projectId).filter((x): x is ID => Boolean(x)),
        ),
      ],
      suggestedAction:
        "Make the week smaller: clear your head, then protect one focused block.",
      sourceEventIds: overwhelm.map((e) => e.id),
    });
  }

  // Unfinished priorities: many open tasks piling up.
  const done = new Set(
    events
      .filter((e) => e.type === "task.completed" && e.refs?.taskId)
      .map((e) => e.refs!.taskId!),
  );
  const openTasks = events.filter(
    (e) => e.type === "task.created" && e.refs?.taskId && !done.has(e.refs.taskId),
  );
  if (openTasks.length >= 5) {
    out.push({
      id: "risk-unfinished",
      type: "unfinished-priorities",
      label: `${openTasks.length} tasks are still open`,
      severity: openTasks.length >= 10 ? "high" : "medium",
      detectedAt: now,
      relatedProjectIds: [
        ...new Set(
          openTasks.map((e) => e.refs?.projectId).filter((x): x is ID => Boolean(x)),
        ),
      ],
      suggestedAction:
        "Pick the three that matter most today and let the rest wait.",
      sourceEventIds: openTasks.map((e) => e.id),
    });
  }

  // Overdue tasks (only when a due date was recorded).
  const overdue = events.filter(
    (e) =>
      e.type === "task.created" &&
      e.refs?.taskId &&
      !done.has(e.refs.taskId) &&
      asStr(e.data?.dueDate) &&
      asStr(e.data?.dueDate) < now,
  );
  for (const e of overdue) {
    out.push({
      id: `risk-overdue-${e.refs!.taskId}`,
      type: "task-overdue",
      label: `"${asStr(e.data?.title) || "A task"}" is past its due date`,
      severity: "medium",
      detectedAt: now,
      relatedProjectIds: e.refs?.projectId ? [e.refs.projectId] : [],
      suggestedAction: "Do the 2-minute version now, or reschedule it honestly.",
      sourceEventIds: [e.id],
    });
  }

  // Keep `sorted` referenced for clarity of intent (chronological scan).
  void sorted;
  return out;
}
