/**
 * 056 / 071 — Active Creation Workspaces.
 * Canonical source: Active Workspace Registry projections only.
 * Light card projection only — Continue card leaf, not Create write identity.
 */

import { continueCardFromRegistryEntry } from "@/lib/activeWorkspaceRegistry/continueCardProjection";
import { listActiveContinueProjection } from "@/lib/activeWorkspaceRegistry/projections";
import type { ActiveWorkspaceEntry } from "@/lib/activeWorkspaceRegistry/types";
import type { EventLifecyclePhase } from "@/lib/eventsIntelligence/types";

export type ActiveCreationWorkspaceSummary = {
  id: string;
  title: string;
  /** e.g. "Workshop", "Retreat", "Email" */
  kindLabel: string;
  phaseLabel: string;
  updatedAt: string;
  eventRecordId: string;
  creationRecordId: string;
  projectHomeId: string | null;
  nextAction: string;
  /** 071 — Current Focus title for resume copy */
  currentFocusTitle?: string | null;
  /** 073 — member status */
  statusLabel?: string;
  /** 073 — last worked display */
  lastWorkedLabel?: string;
  progressSummary?: string;
};

const PHASE_LABEL: Record<EventLifecyclePhase, string> = {
  discovery: "Discovery",
  viability: "Viability",
  strategy: "Strategy",
  experience_design: "Experience Design",
  planning: "Planning",
  preparation: "Preparation",
  delivery: "Delivery",
  breakdown_closure: "Closure",
  follow_up: "Follow-up",
  debrief_reuse: "Debrief",
};

export function creationWorkspacePhaseLabel(
  phase: EventLifecyclePhase,
): string {
  return PHASE_LABEL[phase] ?? "In progress";
}

function fromRegistry(entry: ActiveWorkspaceEntry): ActiveCreationWorkspaceSummary {
  const card = continueCardFromRegistryEntry(entry);
  return {
    id: entry.workspaceId,
    title: card.title,
    kindLabel: card.creationType,
    phaseLabel: card.statusLabel,
    updatedAt: entry.lastActivityAt,
    eventRecordId: entry.eventRecordId || entry.workspaceId,
    creationRecordId: entry.runtimeCreationRecordId,
    projectHomeId: entry.projectHomeId,
    nextAction: entry.currentFocusTitle
      ? `Next step: ${entry.currentFocusTitle}`
      : "",
    currentFocusTitle: entry.currentFocusTitle,
    statusLabel: card.statusLabel,
    lastWorkedLabel: card.lastWorkedLabel,
    progressSummary: card.progressSummary,
  };
}

/**
 * Active Creation Workspaces sorted by most recently updated.
 * Registry projection only — one Work ID everywhere.
 */
export function listActiveCreationWorkspaces(): ActiveCreationWorkspaceSummary[] {
  return listActiveContinueProjection().map(fromRegistry);
}
