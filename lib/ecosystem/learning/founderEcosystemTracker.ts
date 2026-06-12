// Founder Ecosystem — Phase 15 Tracking Module.
// Records automation lifecycle, outcomes, time saved, and tool usage with
// project/document/goal correlation.

import type { EventStore } from "../eventStore";
import { ev, type EventRefs, type FounderEvent, type NewEvent } from "../events";
import type { ID } from "../models";
import type { AutomationLifecycle, AutomationTrackRecord, TrackContext } from "./learningTypes";

const AUTOMATION_TYPES = new Set([
  "automation.suggested",
  "automation.approved",
  "automation.executed",
  "automation.rejected",
  "automation.dismissed",
  "automation.edited",
]);

type AutomationPayload = {
  automationId: ID;
  title: string;
  tool: string;
  actionType: string;
  timeSavedMinutes?: number;
  ok?: boolean;
};

function lifecycleFromType(type: string): AutomationLifecycle | null {
  const suffix = type.replace("automation.", "");
  if (
    suffix === "suggested" ||
    suffix === "approved" ||
    suffix === "executed" ||
    suffix === "rejected" ||
    suffix === "dismissed" ||
    suffix === "edited"
  ) {
    return suffix;
  }
  return null;
}

function refsFromContext(ctx?: TrackContext): EventRefs | undefined {
  if (!ctx?.projectId && !ctx?.documentId) return undefined;
  return { projectId: ctx.projectId, documentId: ctx.documentId };
}

function basePayload(
  automationId: ID,
  title: string,
  tool: string,
  actionType: string,
): AutomationPayload {
  return { automationId, title, tool, actionType };
}

/** Build a track event without emitting — useful in tests and batch replay. */
export function buildAutomationTrackEvent(
  founderId: ID,
  lifecycle: AutomationLifecycle,
  automationId: ID,
  title: string,
  tool: string,
  actionType: string,
  ctx?: TrackContext & { timeSavedMinutes?: number; ok?: boolean },
): NewEvent {
  const refs = refsFromContext(ctx);
  const payload = basePayload(automationId, title, tool, actionType);
  switch (lifecycle) {
    case "suggested":
      return ev.automationSuggested(founderId, automationId, title, tool, actionType, refs);
    case "approved":
      return ev.automationApproved(founderId, automationId, title, tool, actionType, refs);
    case "executed":
      return ev.automationExecuted(founderId, automationId, title, tool, actionType, {
        timeSavedMinutes: ctx?.timeSavedMinutes,
        ok: ctx?.ok,
        refs,
      });
    case "rejected":
      return ev.automationRejected(founderId, automationId, title, tool, actionType, refs);
    case "dismissed":
      return ev.automationDismissed(founderId, automationId, title, tool, actionType, refs);
    case "edited":
      return ev.automationEdited(founderId, automationId, title, tool, actionType, refs);
  }
}

export function trackOutcome(
  founderId: ID,
  outcome: "project.completed" | "document.created" | "task.finished",
  label: string,
  ctx?: TrackContext,
): NewEvent {
  const refs = refsFromContext(ctx);
  switch (outcome) {
    case "project.completed":
      return {
        founderId,
        type: "project.completed",
        refs: { projectId: ctx?.projectId },
        data: { title: label, goalLabel: ctx?.goalLabel },
      };
    case "document.created":
      return ev.documentCreated(
        founderId,
        ctx?.documentId ?? `doc-${Date.now()}`,
        "document",
        label,
        ctx?.projectId,
      );
    case "task.finished":
      return ev.taskCompleted(founderId, `task-${Date.now()}`, ctx?.projectId);
  }
}

export function trackTimeSaved(
  founderId: ID,
  minutes: number,
  source: string,
  ctx?: TrackContext,
): NewEvent {
  return ev.learningTimeSaved(founderId, minutes, source, refsFromContext(ctx));
}

export function trackToolUsage(
  founderId: ID,
  tool: string,
  action: string,
  ctx?: TrackContext & { ok?: boolean },
): NewEvent {
  return {
    founderId,
    type: "assisted_action.accepted",
    refs: refsFromContext(ctx),
    data: { tool, action, ok: ctx?.ok ?? true },
  };
}

/** Parse automation lifecycle rows from the event log. */
export function parseAutomationRecords(events: FounderEvent[]): AutomationTrackRecord[] {
  const rows: AutomationTrackRecord[] = [];
  for (const e of events) {
    if (!AUTOMATION_TYPES.has(e.type)) continue;
    const lifecycle = lifecycleFromType(e.type);
    if (!lifecycle) continue;
    const d = e.data as Partial<AutomationPayload>;
    if (!d.automationId || !d.title || !d.tool || !d.actionType) continue;
    rows.push({
      automationId: d.automationId,
      title: d.title,
      tool: d.tool,
      actionType: d.actionType,
      lifecycle,
      ts: e.ts,
      timeSavedMinutes: d.timeSavedMinutes,
      projectId: e.refs?.projectId,
      documentId: e.refs?.documentId,
      ok: d.ok,
    });
  }
  return rows;
}

/** Stateful tracker that emits into an EventStore. */
export class FounderEcosystemTracker {
  constructor(
    private store: EventStore,
    private founderId: ID,
  ) {}

  private emit(event: NewEvent) {
    this.store.emit(event);
  }

  suggested(
    automationId: ID,
    title: string,
    tool: string,
    actionType: string,
    ctx?: TrackContext,
  ) {
    this.emit(buildAutomationTrackEvent(this.founderId, "suggested", automationId, title, tool, actionType, ctx));
  }

  approved(
    automationId: ID,
    title: string,
    tool: string,
    actionType: string,
    ctx?: TrackContext,
  ) {
    this.emit(buildAutomationTrackEvent(this.founderId, "approved", automationId, title, tool, actionType, ctx));
  }

  executed(
    automationId: ID,
    title: string,
    tool: string,
    actionType: string,
    ctx?: TrackContext & { timeSavedMinutes?: number; ok?: boolean },
  ) {
    this.emit(buildAutomationTrackEvent(this.founderId, "executed", automationId, title, tool, actionType, ctx));
  }

  rejected(
    automationId: ID,
    title: string,
    tool: string,
    actionType: string,
    ctx?: TrackContext,
  ) {
    this.emit(buildAutomationTrackEvent(this.founderId, "rejected", automationId, title, tool, actionType, ctx));
  }

  dismissed(
    automationId: ID,
    title: string,
    tool: string,
    actionType: string,
    ctx?: TrackContext,
  ) {
    this.emit(buildAutomationTrackEvent(this.founderId, "dismissed", automationId, title, tool, actionType, ctx));
  }

  edited(
    automationId: ID,
    title: string,
    tool: string,
    actionType: string,
    ctx?: TrackContext,
  ) {
    this.emit(buildAutomationTrackEvent(this.founderId, "edited", automationId, title, tool, actionType, ctx));
  }

  outcome(
    kind: "project.completed" | "document.created" | "task.finished",
    label: string,
    ctx?: TrackContext,
  ) {
    this.emit(trackOutcome(this.founderId, kind, label, ctx));
  }

  timeSaved(minutes: number, source: string, ctx?: TrackContext) {
    this.emit(trackTimeSaved(this.founderId, minutes, source, ctx));
  }

  toolTriggered(tool: string, action: string, ctx?: TrackContext & { ok?: boolean }) {
    this.emit(trackToolUsage(this.founderId, tool, action, ctx));
  }
}
