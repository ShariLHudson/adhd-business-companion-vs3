/**
 * Continuity Phase 1 — single source of truth for resumable work on this device.
 */

import {
  loadDecisionCompassSession,
  type PersistedDecisionCompassSession,
} from "./decisionCompassSessionStore";
import {
  loadStrategyApplySession,
  type PersistedStrategyApplySession,
} from "./strategyApplySessionStore";
import { clientAvatarStepLabel } from "./clientAvatarCoach";
import type { IdealClientAvatar } from "./companionStore";
import { getAvatars, getProjects } from "./companionStore";
import { loadCreateSession } from "./createSessionStore";
import {
  loadSavedWorkflowRecord,
  loadWorkflowRecord,
} from "./createWorkflowRecordStore";
import type { CreateWorkflowRecord } from "./createWorkflowRecord";
import { shouldPersistWorkflowRecord } from "./createWorkflowRecord";
import { userFacingCreateTypeLabel } from "./createTypePickers";
import { getActiveSavedWork, getSavedWorkById } from "./savedWorkStore";
import { getCurrentSopStep, getScopedSteps, getWorkflow } from "./workspaceSop";
import {
  loadWorkspaceSession,
  loadWorkspaceSessionMeta,
} from "./workspaceSessionStore";

export const CONTINUITY_STORAGE_KEYS = {
  createSession: "companion-create-session-v1",
  createWorkflow: "companion-create-workflow-record-v1",
  createSavedForLater: "companion-create-workflow-saved-v1",
  workspaceSession: "companion-workspace-session-v1",
  projects: "companion-projects-v1",
  avatars: "companion-ideal-clients-v1",
  savedWork: "companion-saved-work-v1",
  decisionCompass: "companion-decision-compass-session-v1",
  strategyApply: "companion-strategy-apply-v1",
  projectContinue: "companion-project-continue-v1",
} as const;

export type ContinuityItemType =
  | "create-draft"
  | "create-saved-for-later"
  | "project"
  | "client-avatar"
  | "workspace-sop"
  | "saved-work"
  | "decision-compass"
  | "strategy-apply";

export type ContinuityResumeAction =
  | "restore-create"
  | "open-projects"
  | "open-client-avatars"
  | "open-saved-work"
  | "restore-decision-compass"
  | "restore-strategy-apply"
  | "home-resume";

export type ContinuityManifestItem = {
  id: string;
  title: string;
  type: ContinuityItemType;
  lastTouchedAt: string;
  location: string;
  storageKey: string;
  resumeAction: ContinuityResumeAction;
  nextStep?: string;
  projectId?: string;
  avatarId?: string;
};

export type ContinuityManifest = {
  items: ContinuityManifestItem[];
  /** Most recently touched resumable item. */
  latest: ContinuityManifestItem | null;
};

/** Types surfaced on calm-home Resume Where You Left Off. */
export const HOME_RESUME_CONTINUITY_TYPES: ReadonlySet<ContinuityItemType> =
  new Set([
    "create-draft",
    "create-saved-for-later",
    "workspace-sop",
    "project",
    "client-avatar",
    "decision-compass",
    "strategy-apply",
  ]);

function sortByTouched(items: ContinuityManifestItem[]): ContinuityManifestItem[] {
  return [...items].sort((a, b) => b.lastTouchedAt.localeCompare(a.lastTouchedAt));
}

function createWorkflowItem(record: CreateWorkflowRecord): ContinuityManifestItem | null {
  if (!shouldPersistWorkflowRecord(record)) return null;
  const title =
    record.collectedAnswers.topic?.trim() ||
    record.collectedAnswers.title?.trim() ||
    (record.itemType
      ? userFacingCreateTypeLabel(record.itemType) ?? record.itemType
      : "Create draft");

  let location = "Create (draft in progress)";
  let nextStep = "Continue your draft";
  if (!record.draftContent?.trim()) {
    if (!record.itemType) nextStep = "Choose what to create";
    else if (record.currentPhase === "discovery" || record.currentQuestionId) {
      nextStep = "Finish the setup questions";
    } else {
      nextStep = "Build your draft";
    }
  } else {
    const session = loadCreateSession();
    const savedId = session?.savedArtifact?.savedWorkId;
    const savedItem = savedId ? getSavedWorkById(savedId) : undefined;
    if (savedItem) {
      location = savedItem.savedLocation;
      nextStep = "Open from My Work";
    } else {
      const match = getActiveSavedWork().find(
        (w) =>
          w.body.trim() === record.draftContent?.trim() &&
          (!record.itemType ||
            w.artifactType.toLowerCase() === record.itemType.toLowerCase()),
      );
      if (match) {
        location = match.savedLocation;
        nextStep = "Open from My Work";
      }
    }
  }

  return {
    id: `create:${record.workflowId}`,
    title,
    type: "create-draft",
    lastTouchedAt: record.lastUpdated,
    location,
    storageKey: CONTINUITY_STORAGE_KEYS.createWorkflow,
    resumeAction: "restore-create",
    nextStep,
  };
}

function createSessionItem(): ContinuityManifestItem | null {
  const session = loadCreateSession();
  if (!session) return null;
  const draft =
    session.genSeed.draft?.trim() ||
    session.creationContext.draftContent?.trim();
  if (!draft && !session.genSeed.type) return null;

  const title =
    session.creationContext.title?.trim() ||
    session.genSeed.topic?.trim() ||
    (session.genSeed.type
      ? userFacingCreateTypeLabel(session.genSeed.type) ?? session.genSeed.type
      : "Create draft");

  return {
    id: `create-session:${title.toLowerCase()}`,
    title,
    type: "create-draft",
    lastTouchedAt: session.updatedAt,
    location:
      session.savedArtifact?.savedLocationDetail ??
      (draft ? "Create (saved session)" : "Create"),
    storageKey: CONTINUITY_STORAGE_KEYS.createSession,
    resumeAction: "restore-create",
    nextStep: draft ? "Continue your draft" : "Choose what to create",
  };
}

function savedForLaterItem(): ContinuityManifestItem | null {
  const record = loadSavedWorkflowRecord();
  if (!record || !shouldPersistWorkflowRecord(record)) return null;
  const title =
    record.collectedAnswers.topic?.trim() ||
    record.collectedAnswers.title?.trim() ||
    (record.itemType
      ? userFacingCreateTypeLabel(record.itemType) ?? record.itemType
      : "Saved draft");

  return {
    id: `saved-for-later:${record.workflowId}`,
    title,
    type: "create-saved-for-later",
    lastTouchedAt: record.lastUpdated,
    location: "Create → Save For Later",
    storageKey: CONTINUITY_STORAGE_KEYS.createSavedForLater,
    resumeAction: "restore-create",
    nextStep: "Continue your saved draft",
  };
}

function avatarIncompleteStep(avatar: IdealClientAvatar): string | null {
  if (!avatar.name?.trim()) return null;
  if (!avatar.who?.trim()) return `Complete: ${clientAvatarStepLabel("who")}`;
  if (!avatar.painPoints?.trim()) {
    return `Complete: ${clientAvatarStepLabel("painPoints")}`;
  }
  if (!avatar.goals?.trim()) {
    return `Complete: ${clientAvatarStepLabel("goals")}`;
  }
  if (!avatar.solution?.trim()) {
    return `Complete: ${clientAvatarStepLabel("solution")}`;
  }
  return null;
}

/** Build a home-resume row from a persisted workspace SOP session. */
export function homeResumeItemFromWorkspaceSession(
  session: NonNullable<ReturnType<typeof loadWorkspaceSession>>,
  lastTouchedAt: string,
): ContinuityManifestItem | null {
  if (!session.workflowId) return null;
  const scoped = getScopedSteps(session.workflowId, session.energyScope);
  const allDone = scoped.every((s) => session.completedStepIds.includes(s.id));
  if (allDone || scoped.length === 0) return null;

  const step = getCurrentSopStep(session);
  const wf = getWorkflow(session.workflowId);
  const title =
    session.projectTitle?.trim() ||
    session.acceptedValues["workshop-title"]?.trim() ||
    session.acceptedValues["project-name"]?.trim() ||
    wf.title ||
    "Project";

  return {
    id: `workspace:${session.workflowId}:${session.projectId ?? "new"}`,
    title,
    type: "workspace-sop",
    lastTouchedAt,
    location: "Projects (workshop in progress)",
    storageKey: CONTINUITY_STORAGE_KEYS.workspaceSession,
    resumeAction: "open-projects",
    nextStep: `Continue: ${step.label}`,
    projectId: session.projectId ?? undefined,
  };
}

function decisionCompassStepLabel(stepId: string): string {
  const labels: Record<string, string> = {
    decision: "Name your decision",
    options: "Compare your options",
    "type-pick": "Pick decision type",
  };
  return labels[stepId] ?? "Continue your decision";
}

function decisionCompassItem(
  snapshot: PersistedDecisionCompassSession,
): ContinuityManifestItem {
  const title =
    snapshot.decision?.trim() ||
    snapshot.answers.decision?.trim() ||
    "Decision in progress";

  return {
    id: `decision-compass:${snapshot.sessionId}`,
    title,
    type: "decision-compass",
    lastTouchedAt: snapshot.lastTouchedAt,
    location: "Guided Exercises → Decision Compass",
    storageKey: CONTINUITY_STORAGE_KEYS.decisionCompass,
    resumeAction: "restore-decision-compass",
    nextStep: `Continue: ${decisionCompassStepLabel(snapshot.currentStepId)}`,
  };
}

function strategyApplyItem(
  snapshot: PersistedStrategyApplySession,
): ContinuityManifestItem {
  const total = snapshot.questions.length;
  const step = Math.min(snapshot.questionIndex + 1, total || 1);

  return {
    id: `strategy-apply:${snapshot.strategyId}`,
    title: snapshot.strategyTitle,
    type: "strategy-apply",
    lastTouchedAt: snapshot.lastTouchedAt,
    location: "Playbook → Strategy Apply",
    storageKey: CONTINUITY_STORAGE_KEYS.strategyApply,
    resumeAction: "restore-strategy-apply",
    nextStep:
      total > 0
        ? `Question ${step} of ${total}`
        : "Continue your strategy apply session",
  };
}

function workspaceSopItem(): ContinuityManifestItem | null {
  const meta = loadWorkspaceSessionMeta();
  if (!meta?.session) return null;
  if (!meta.lastTouchedAt) return null;
  return homeResumeItemFromWorkspaceSession(meta.session, meta.lastTouchedAt);
}

function projectItems(): ContinuityManifestItem[] {
  return getProjects()
    .filter((p) => p.status !== "completed")
    .map((p) => ({
      id: `project:${p.id}`,
      title: p.name,
      type: "project" as const,
      lastTouchedAt: p.updatedAt,
      location: "Projects",
      storageKey: CONTINUITY_STORAGE_KEYS.projects,
      resumeAction: "open-projects" as const,
      nextStep:
        p.nextAction?.trim() ||
        (p.goals?.[0]?.trim()
          ? `Work toward: ${p.goals[0]}`
          : "Pick the next step"),
      projectId: p.id,
    }));
}

function avatarItems(): ContinuityManifestItem[] {
  return getAvatars()
    .map((a) => ({ a, next: avatarIncompleteStep(a) }))
    .filter((row): row is { a: IdealClientAvatar; next: string } =>
      Boolean(row.next),
    )
    .map(({ a, next }) => ({
      id: `avatar:${a.id}`,
      title: a.name,
      type: "client-avatar" as const,
      lastTouchedAt: a.updatedAt,
      location: "Client Avatars",
      storageKey: CONTINUITY_STORAGE_KEYS.avatars,
      resumeAction: "open-client-avatars" as const,
      nextStep: next,
      avatarId: a.id,
    }));
}

function savedWorkItems(): ContinuityManifestItem[] {
  return getActiveSavedWork().map((w) => ({
    id: `saved-work:${w.id}`,
    title: w.title,
    type: "saved-work" as const,
    lastTouchedAt: w.updatedAt,
    location: w.savedLocation || "Saved Work",
    storageKey: CONTINUITY_STORAGE_KEYS.savedWork,
    resumeAction: "open-saved-work" as const,
    nextStep:
      w.status === "draft"
        ? "Continue editing in My Work"
        : "Open in My Work",
  }));
}

/** Aggregate all resumable work from local storage. */
export function buildContinuityManifest(): ContinuityManifest {
  const items: ContinuityManifestItem[] = [];

  const workflow = loadWorkflowRecord();
  if (workflow) {
    const row = createWorkflowItem(workflow);
    if (row) items.push(row);
  }

  const sessionRow = createSessionItem();
  if (sessionRow) items.push(sessionRow);

  const later = savedForLaterItem();
  if (later) items.push(later);

  const sop = workspaceSopItem();
  if (sop) items.push(sop);

  const decisionCompass = loadDecisionCompassSession();
  if (decisionCompass) items.push(decisionCompassItem(decisionCompass));

  const strategyApply = loadStrategyApplySession();
  if (strategyApply) items.push(strategyApplyItem(strategyApply));

  items.push(...projectItems());
  items.push(...avatarItems());
  items.push(...savedWorkItems());

  const sorted = sortByTouched(items);
  return {
    items: sorted,
    latest: sorted[0] ?? null,
  };
}

export function findLatestContinuityItem(
  types?: ReadonlySet<ContinuityItemType>,
): ContinuityManifestItem | null {
  const manifest = buildContinuityManifest();
  const pool = types
    ? manifest.items.filter((i) => types.has(i.type))
    : manifest.items;
  return pool[0] ?? null;
}
