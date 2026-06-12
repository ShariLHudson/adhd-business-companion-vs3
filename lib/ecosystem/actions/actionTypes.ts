// Founder Ecosystem — Phase 11 Action & Workspace Integration types.
//
// Recommendations become executable actions with workspace targets, prefills,
// and tracked lifecycle. Business/productivity only.

import type { AppSection } from "@/lib/companionUi";
import type { GoogleFileKind } from "@/lib/googleWorkspace";
import type { WorkspaceKind } from "../events";
import type { ID, ISODateString } from "../models";
import type { Level } from "../dashboardTypes";
import type { AdvisorId } from "../board/advisorTypes";

export type { Level };

// ---- Action taxonomy ----------------------------------------------------
export type FounderActionType =
  | "open-project"
  | "open-create"
  | "open-google-doc"
  | "open-google-sheet"
  | "open-google-form"
  | "open-template"
  | "open-snippet"
  | "open-time-block"
  | "start-focus-session"
  | "create-task"
  | "create-opportunity"
  | "create-decision"
  | "research-topic"
  | "review-project"
  | "review-goal"
  | "review-recommendation";

export type FounderActionStatus =
  | "offered"
  | "opened"
  | "started"
  | "completed"
  | "dismissed"
  | "skipped"
  | "postponed";

export type ActionPrefill = {
  projectId?: ID;
  projectTitle?: string;
  taskId?: ID;
  taskTitle?: string;
  documentId?: ID;
  documentTitle?: string;
  goalId?: ID;
  goalTitle?: string;
  recommendationId?: ID;
  recommendationText?: string;
  durationMinutes?: number;
  itemType?: string;
  draftScaffold?: string;
  templateId?: ID;
  snippetId?: ID;
};

export type WorkspaceTarget = {
  /** Companion split-view section to open. */
  section: AppSection;
  /** Ecosystem event workspace kind (may differ from AppSection naming). */
  ecosystemKind: WorkspaceKind;
  itemType?: string;
  title?: string;
  draftScaffold?: string;
  bootstrapProjects?: boolean;
  googleExportKind?: GoogleFileKind;
  focusAudioCategory?: string;
};

export type RelatedRefs = {
  projectId?: ID;
  taskId?: ID;
  documentId?: ID;
  goalId?: ID;
  recommendationId?: ID;
};

/** Executable action derived from a recommendation or operating-state priority. */
export type FounderAction = {
  id: ID;
  title: string;
  description: string;
  actionType: FounderActionType;
  priority: Level;
  advisorSource?: AdvisorId;
  relatedProject?: { id: ID; title?: string };
  relatedGoal?: { id: ID; title?: string };
  relatedDocument?: { id: ID; title?: string; kind?: GoogleFileKind };
  workspace: WorkspaceTarget;
  prefill: ActionPrefill;
  status: FounderActionStatus;
  sourceEventIds: ID[];
  recommendationText?: string;
  nextStep?: string;
  createdAt: ISODateString;
  completedAt?: ISODateString;
  emoji?: string;
};

export type ActionSource =
  | { kind: "intelligence"; recommendationId: ID }
  | { kind: "journey"; focus: string }
  | { kind: "execution-step"; stepId: ID }
  | { kind: "operating-state"; priorityRank: number }
  | { kind: "manual" };

export type ActionLifecycleEvent = {
  actionId: ID;
  status: FounderActionStatus;
  ts: ISODateString;
};
