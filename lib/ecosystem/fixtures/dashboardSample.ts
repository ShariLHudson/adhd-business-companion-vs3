// Founder Ecosystem — Phase 2 sample event fixture.
//
// Built programmatically off "now" so the date-sensitive selectors (today,
// momentum) are deterministic regardless of when tests run. Placeholder data
// only.

import type { FounderEvent } from "../events";

export const SAMPLE_FOUNDER_ID = "founder-001";

function todayAt(hour: number, min = 0): string {
  const d = new Date();
  d.setUTCHours(hour, min, 0, 0);
  return d.toISOString();
}
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const inDays = (n: number) => new Date(Date.now() + n * 86400000).toISOString();

/** A realistic single-founder session with data for every dashboard section. */
export function sampleFounderEvents(
  founderId: string = SAMPLE_FOUNDER_ID,
): FounderEvent[] {
  const f = founderId;
  return [
    {
      id: "e1",
      founderId: f,
      type: "workspace.opened",
      ts: todayAt(14, 0),
      refs: { workspace: "projects" },
      workspaceContext: { kind: "projects", layout: "split", active: true },
    },
    {
      id: "e2",
      founderId: f,
      type: "project.created",
      ts: todayAt(14, 1),
      refs: { projectId: "proj-1" },
      data: { title: "ADHD Sales Funnel" },
    },
    {
      id: "e3",
      founderId: f,
      type: "task.created",
      ts: todayAt(14, 2),
      refs: { taskId: "task-1", projectId: "proj-1" },
      data: { title: "Rewrite sales page headline" },
    },
    {
      id: "e4",
      founderId: f,
      type: "task.created",
      ts: todayAt(14, 3),
      refs: { taskId: "task-2", projectId: "proj-1" },
      data: { title: "Draft welcome email" },
    },
    {
      id: "e5",
      founderId: f,
      type: "task.updated",
      ts: todayAt(14, 4),
      refs: { taskId: "task-2", projectId: "proj-1" },
      data: { status: "in-progress", title: "Draft welcome email" },
    },
    {
      id: "e6",
      founderId: f,
      type: "focus.started",
      ts: todayAt(14, 5),
      refs: { projectId: "proj-1" },
      data: { plannedMinutes: 25 },
    },
    {
      id: "e7",
      founderId: f,
      type: "focus.completed",
      ts: todayAt(14, 30),
      refs: { projectId: "proj-1" },
      data: { actualMinutes: 25 },
    },
    {
      id: "e8",
      founderId: f,
      type: "task.completed",
      ts: todayAt(14, 31),
      refs: { taskId: "task-1", projectId: "proj-1" },
    },
    {
      id: "e9",
      founderId: f,
      type: "document.created",
      ts: todayAt(14, 40),
      refs: { documentId: "doc-1", projectId: "proj-1" },
      data: { docType: "sales-page", title: "Sales Page v1" },
    },
    {
      id: "e10",
      founderId: f,
      type: "timeblock.created",
      ts: todayAt(14, 45),
      refs: { timeBlockId: "tb-1", projectId: "proj-1", workspace: "time-block" },
      data: { durationMin: 60, title: "Finish sales page", scheduledFor: inDays(1) },
    },
    {
      id: "e11",
      founderId: f,
      type: "decision.created",
      ts: todayAt(14, 50),
      refs: { decisionId: "dec-1", projectId: "proj-1" },
      data: { text: "Price at $1,200 or run a beta cohort first?" },
    },
    {
      id: "e12",
      founderId: f,
      type: "opportunity.created",
      ts: todayAt(14, 52),
      refs: { opportunityId: "opp-1", projectId: "proj-1" },
      data: { text: "Past client asked about a group program" },
    },
    // Pain points: overwhelm twice (5 days ago + today) + one focus issue.
    {
      id: "e13",
      founderId: f,
      type: "painpoint.observed",
      ts: daysAgo(5),
      refs: { painPointId: "pain-1", projectId: "proj-1" },
      data: { text: "Overwhelm when the project feels too big" },
    },
    {
      id: "e14",
      founderId: f,
      type: "painpoint.observed",
      ts: todayAt(14, 2),
      refs: { painPointId: "pain-1", projectId: "proj-1" },
      data: { text: "Too much going on, feeling overwhelmed" },
    },
    {
      id: "e15",
      founderId: f,
      type: "painpoint.observed",
      ts: todayAt(15, 0),
      refs: { painPointId: "pain-2" },
      data: { text: "Hard to focus, kept getting distracted" },
    },
  ];
}
