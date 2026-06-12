// Founder Ecosystem — Phase 1 Event model.
//
// EVERY founder action is captured as an append-only event. Dashboards,
// metrics, and (Phase 2+) founder intelligence are derived from this stream —
// records in models.ts are the materialized state; events are the source of
// truth. Events are immutable once written.

import type { ID, ISODateString } from "./models";

export type { ID, ISODateString } from "./models";

// Which workspace a user is in (split-view: chat left, workspace right).
export type WorkspaceKind =
  | "create"
  | "projects"
  | "time-block"
  | "templates"
  | "clear-my-mind"
  | "strategies"
  | "focus-audio"
  | "breathe"
  | "spin-wheel";

// The exhaustive list of trackable event types. Namespaced "object.verb" so
// new categories slot in cleanly and queries can filter by prefix.
export type EventType =
  // Projects
  | "project.created"
  | "project.updated"
  | "project.stage_changed"
  | "project.completed"
  // Tasks
  | "task.created"
  | "task.updated"
  | "task.completed"
  // Documents
  | "document.created"
  | "document.exported" // Google Doc / Sheet / Form / PDF / Print / Copy
  // Focus sessions
  | "focus.started"
  | "focus.completed"
  // Time blocks
  | "timeblock.created"
  | "timeblock.completed"
  // Workspace lifecycle (supports multiple simultaneous workspaces)
  | "workspace.opened"
  | "workspace.closed"
  // Coaching / chat
  | "chat.coaching" // a meaningful Shari coaching interaction
  // Intelligence nouns surfaced during a session
  | "decision.created"
  | "decision.updated"
  | "opportunity.created"
  | "opportunity.updated"
  | "painpoint.observed"
  // Assisted actions (hook for "Help me draft this", etc.)
  | "assisted_action.offered"
  | "assisted_action.accepted"
  // Phase 11 — recommendation → action lifecycle
  | "action.offered"
  | "action.opened"
  | "action.started"
  | "action.completed"
  | "action.dismissed"
  | "action.skipped"
  | "action.postponed"
  // Phase 15 — automation lifecycle + learning
  | "automation.suggested"
  | "automation.approved"
  | "automation.executed"
  | "automation.rejected"
  | "automation.dismissed"
  | "automation.edited"
  | "learning.time_saved"
  // Daily rhythm + capture
  | "checkin.recorded" // morning energy/focus/motivation + priorities
  | "research.completed" // web research returned a summary
  | "note.captured"; // brain-dump inbox item (idea / task / question)

// Objects an event may reference. All optional — an event references whatever
// is relevant (a task event carries taskId + projectId, etc.).
export type EventRefs = {
  projectId?: ID;
  taskId?: ID;
  documentId?: ID;
  decisionId?: ID;
  opportunityId?: ID;
  painPointId?: ID;
  timeBlockId?: ID;
  workspace?: WorkspaceKind;
};

// Context about the split-view workspace when the event happened.
export type WorkspaceContext = {
  kind: WorkspaceKind;
  layout: "split" | "workspace-focus" | "full";
  active: boolean; // is this the workspace currently in focus?
};

export type FounderEvent = {
  id: ID;
  founderId: ID;
  type: EventType;
  ts: ISODateString;
  refs?: EventRefs;
  /** The user's chat message that triggered/accompanied this event, if any. */
  userMessage?: string;
  /** Split-view workspace context, when applicable. */
  workspaceContext?: WorkspaceContext;
  /** Event-type-specific structured payload (durations, providers, etc.). */
  data?: Record<string, unknown>;
};

// What a caller supplies; id + ts are filled in by the store on append.
export type NewEvent = Omit<FounderEvent, "id" | "ts"> & { ts?: ISODateString };

// ---- Typed builders -----------------------------------------------------
// Thin, API-friendly helpers so call sites stay declarative and consistent.
// Each returns a NewEvent the store can append.

export const ev = {
  projectCreated: (founderId: ID, projectId: ID, title: string): NewEvent => ({
    founderId,
    type: "project.created",
    refs: { projectId },
    data: { title },
  }),
  projectStageChanged: (
    founderId: ID,
    projectId: ID,
    from: string,
    to: string,
  ): NewEvent => ({
    founderId,
    type: "project.stage_changed",
    refs: { projectId },
    data: { from, to },
  }),
  taskCreated: (
    founderId: ID,
    taskId: ID,
    projectId?: ID,
    title?: string,
  ): NewEvent => ({
    founderId,
    type: "task.created",
    refs: { taskId, projectId },
    data: { title },
  }),
  taskCompleted: (founderId: ID, taskId: ID, projectId?: ID): NewEvent => ({
    founderId,
    type: "task.completed",
    refs: { taskId, projectId },
  }),
  documentCreated: (
    founderId: ID,
    documentId: ID,
    docType: string,
    title: string,
    projectId?: ID,
  ): NewEvent => ({
    founderId,
    type: "document.created",
    refs: { documentId, projectId },
    data: { docType, title },
  }),
  documentExported: (
    founderId: ID,
    documentId: ID,
    provider: "google-doc" | "google-sheet" | "google-form" | "pdf" | "print" | "copy",
    location?: string,
  ): NewEvent => ({
    founderId,
    type: "document.exported",
    refs: { documentId },
    data: { provider, location },
  }),
  focusStarted: (founderId: ID, minutes: number, projectId?: ID): NewEvent => ({
    founderId,
    type: "focus.started",
    refs: { projectId, workspace: "focus-audio" },
    data: { plannedMinutes: minutes },
  }),
  focusCompleted: (founderId: ID, minutes: number, projectId?: ID): NewEvent => ({
    founderId,
    type: "focus.completed",
    refs: { projectId },
    data: { actualMinutes: minutes },
  }),
  timeBlockCreated: (
    founderId: ID,
    timeBlockId: ID,
    durationMin: number,
    projectId?: ID,
  ): NewEvent => ({
    founderId,
    type: "timeblock.created",
    refs: { timeBlockId, projectId, workspace: "time-block" },
    data: { durationMin },
  }),
  timeBlockCompleted: (founderId: ID, timeBlockId: ID): NewEvent => ({
    founderId,
    type: "timeblock.completed",
    refs: { timeBlockId },
  }),
  workspaceOpened: (
    founderId: ID,
    kind: WorkspaceKind,
    ctx?: Partial<WorkspaceContext>,
  ): NewEvent => ({
    founderId,
    type: "workspace.opened",
    refs: { workspace: kind },
    workspaceContext: { kind, layout: "split", active: true, ...ctx },
  }),
  workspaceClosed: (founderId: ID, kind: WorkspaceKind): NewEvent => ({
    founderId,
    type: "workspace.closed",
    refs: { workspace: kind },
  }),
  chatCoaching: (
    founderId: ID,
    userMessage: string,
    refs?: EventRefs,
  ): NewEvent => ({
    founderId,
    type: "chat.coaching",
    userMessage,
    refs,
  }),
  decisionCreated: (
    founderId: ID,
    decisionId: ID,
    text: string,
    projectId?: ID,
  ): NewEvent => ({
    founderId,
    type: "decision.created",
    refs: { decisionId, projectId },
    data: { text },
  }),
  opportunityCreated: (
    founderId: ID,
    opportunityId: ID,
    text: string,
  ): NewEvent => ({
    founderId,
    type: "opportunity.created",
    refs: { opportunityId },
    data: { text },
  }),
  painPointObserved: (
    founderId: ID,
    painPointId: ID,
    text: string,
  ): NewEvent => ({
    founderId,
    type: "painpoint.observed",
    refs: { painPointId },
    data: { text },
  }),
  assistedActionOffered: (
    founderId: ID,
    action: string,
    refs?: EventRefs,
  ): NewEvent => ({
    founderId,
    type: "assisted_action.offered",
    refs,
    data: { action },
  }),
  assistedActionAccepted: (
    founderId: ID,
    action: string,
    refs?: EventRefs,
  ): NewEvent => ({
    founderId,
    type: "assisted_action.accepted",
    refs,
    data: { action },
  }),
  checkin: (
    founderId: ID,
    levels: { energy: string; focus: string; motivation: string },
    priorities: string[] = [],
  ): NewEvent => ({
    founderId,
    type: "checkin.recorded",
    data: { ...levels, priorities },
  }),
  research: (
    founderId: ID,
    topic: string,
    summary: string,
    sources: string[] = [],
    refs?: EventRefs,
  ): NewEvent => ({
    founderId,
    type: "research.completed",
    refs,
    data: { topic, summary, sources },
  }),
  noteCaptured: (
    founderId: ID,
    text: string,
    kind: "idea" | "task" | "question" = "idea",
  ): NewEvent => ({
    founderId,
    type: "note.captured",
    refs: { workspace: "clear-my-mind" },
    data: { text, kind },
  }),
  actionOffered: (
    founderId: ID,
    actionId: ID,
    title: string,
    actionType: string,
    projectId?: ID,
  ): NewEvent => ({
    founderId,
    type: "action.offered",
    refs: { projectId },
    data: { actionId, title, actionType },
  }),
  actionOpened: (
    founderId: ID,
    actionId: ID,
    title: string,
    actionType: string,
    workspace?: WorkspaceKind,
    projectId?: ID,
  ): NewEvent => ({
    founderId,
    type: "action.opened",
    refs: { projectId, workspace },
    data: { actionId, title, actionType },
  }),
  actionStarted: (
    founderId: ID,
    actionId: ID,
    title: string,
    projectId?: ID,
  ): NewEvent => ({
    founderId,
    type: "action.started",
    refs: { projectId },
    data: { actionId, title },
  }),
  actionCompleted: (
    founderId: ID,
    actionId: ID,
    title: string,
    projectId?: ID,
  ): NewEvent => ({
    founderId,
    type: "action.completed",
    refs: { projectId },
    data: { actionId, title },
  }),
  actionDismissed: (
    founderId: ID,
    actionId: ID,
    title: string,
    projectId?: ID,
  ): NewEvent => ({
    founderId,
    type: "action.dismissed",
    refs: { projectId },
    data: { actionId, title },
  }),
  actionSkipped: (
    founderId: ID,
    actionId: ID,
    title: string,
    projectId?: ID,
  ): NewEvent => ({
    founderId,
    type: "action.skipped",
    refs: { projectId },
    data: { actionId, title },
  }),
  actionPostponed: (
    founderId: ID,
    actionId: ID,
    title: string,
    projectId?: ID,
  ): NewEvent => ({
    founderId,
    type: "action.postponed",
    refs: { projectId },
    data: { actionId, title },
  }),
  automationSuggested: (
    founderId: ID,
    automationId: ID,
    title: string,
    tool: string,
    actionType: string,
    refs?: EventRefs,
  ): NewEvent => ({
    founderId,
    type: "automation.suggested",
    refs,
    data: { automationId, title, tool, actionType },
  }),
  automationApproved: (
    founderId: ID,
    automationId: ID,
    title: string,
    tool: string,
    actionType: string,
    refs?: EventRefs,
  ): NewEvent => ({
    founderId,
    type: "automation.approved",
    refs,
    data: { automationId, title, tool, actionType },
  }),
  automationExecuted: (
    founderId: ID,
    automationId: ID,
    title: string,
    tool: string,
    actionType: string,
    opts?: { timeSavedMinutes?: number; ok?: boolean; refs?: EventRefs },
  ): NewEvent => ({
    founderId,
    type: "automation.executed",
    refs: opts?.refs,
    data: {
      automationId,
      title,
      tool,
      actionType,
      timeSavedMinutes: opts?.timeSavedMinutes,
      ok: opts?.ok ?? true,
    },
  }),
  automationRejected: (
    founderId: ID,
    automationId: ID,
    title: string,
    tool: string,
    actionType: string,
    refs?: EventRefs,
  ): NewEvent => ({
    founderId,
    type: "automation.rejected",
    refs,
    data: { automationId, title, tool, actionType },
  }),
  automationDismissed: (
    founderId: ID,
    automationId: ID,
    title: string,
    tool: string,
    actionType: string,
    refs?: EventRefs,
  ): NewEvent => ({
    founderId,
    type: "automation.dismissed",
    refs,
    data: { automationId, title, tool, actionType },
  }),
  automationEdited: (
    founderId: ID,
    automationId: ID,
    title: string,
    tool: string,
    actionType: string,
    refs?: EventRefs,
  ): NewEvent => ({
    founderId,
    type: "automation.edited",
    refs,
    data: { automationId, title, tool, actionType },
  }),
  learningTimeSaved: (
    founderId: ID,
    minutes: number,
    source: string,
    refs?: EventRefs,
  ): NewEvent => ({
    founderId,
    type: "learning.time_saved",
    refs,
    data: { minutes, source },
  }),
};
