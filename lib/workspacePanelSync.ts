// Guards for workspace panel ↔ page sync — prevent render loops / flicker.

import type { CreateGenSeed } from "./createSessionStore";
import type { WorkspacePanelDetail } from "./workspaceAwareness";
import type { CreationWorkspaceContext } from "./workspaceCreation";
import type { WorkspaceSession } from "./workspaceSop";

export function creationContextEqual(
  a: CreationWorkspaceContext | null | undefined,
  b: CreationWorkspaceContext | null | undefined,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.section === b.section &&
    a.itemType === b.itemType &&
    a.title === b.title &&
    a.draftContent === b.draftContent &&
    a.brief === b.brief &&
    a.stage === b.stage &&
    a.source === b.source &&
    a.linkedProjectId === b.linkedProjectId &&
    a.linkedProjectName === b.linkedProjectName &&
    a.templateId === b.templateId &&
    a.snippetKind === b.snippetKind &&
    a.artifactTypeLocked === b.artifactTypeLocked
  );
}

export function genSeedEqual(
  a: CreateGenSeed | null | undefined,
  b: CreateGenSeed | null | undefined,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.type === b.type &&
    a.topic === b.topic &&
    a.brief === b.brief &&
    a.sourceText === b.sourceText &&
    a.draft === b.draft
  );
}

export function panelDetailEqual(
  a: WorkspacePanelDetail | null | undefined,
  b: WorkspacePanelDetail,
): boolean {
  if (!a) return false;
  return (
    a.view === b.view &&
    a.stage === b.stage &&
    a.selectedItemId === b.selectedItemId &&
    a.selectedItemName === b.selectedItemName &&
    a.selectedItemGoal === b.selectedItemGoal &&
    a.selectedItemStatus === b.selectedItemStatus &&
    a.selectedItemHorizon === b.selectedItemHorizon &&
    a.selectedItemColor === b.selectedItemColor &&
    a.showProjectColor === b.showProjectColor &&
    a.projectConversationCount === b.projectConversationCount &&
    a.projectFileCount === b.projectFileCount &&
    a.nextAction === b.nextAction &&
    a.draftPreview === b.draftPreview
  );
}

export function workspaceSessionEqual(
  a: WorkspaceSession | null | undefined,
  b: WorkspaceSession | null | undefined,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.workspaceType === b.workspaceType &&
    a.workflowId === b.workflowId &&
    a.currentStepId === b.currentStepId &&
    a.energyScope === b.energyScope &&
    a.pendingConfirmation === b.pendingConfirmation &&
    a.suggestedValue === b.suggestedValue &&
    a.lastAssistantQuestion === b.lastAssistantQuestion &&
    a.currentStepHint === b.currentStepHint &&
    a.openingContext === b.openingContext &&
    a.projectId === b.projectId &&
    a.projectTitle === b.projectTitle &&
    a.savedStatus === b.savedStatus &&
    acceptedValuesEqual(a.acceptedValues, b.acceptedValues) &&
    optionsEqual(a.suggestedOptions, b.suggestedOptions) &&
    completedStepsEqual(a.completedStepIds, b.completedStepIds)
  );
}

function acceptedValuesEqual(
  a: WorkspaceSession["acceptedValues"],
  b: WorkspaceSession["acceptedValues"],
): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    if ((a[k] ?? "") !== (b[k] ?? "")) return false;
  }
  return true;
}

function optionsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

function completedStepsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}
