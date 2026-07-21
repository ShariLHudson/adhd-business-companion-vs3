/**
 * 066 — One canonical Current Focus for every Creation Destination.
 * Event Record preferred when present; Runtime Creation Record always available.
 */

import { establishedFactsFromRecord } from "@/lib/eventCreationWorkspace/buildEventWorkspace";
import {
  buildWorkspaceCurrentFocus,
  isEventFoundationReady,
} from "@/lib/discoveryToWorkspace";
import { getEventRecord } from "@/lib/eventsIntelligence/eventRecordStore";
import { nextFoundationQuestion } from "@/lib/eventsIntelligence/lifecycle";
import { workspaceV2Sections } from "@/lib/createWorkspaceSections";
import {
  resolvedTypeLabel,
  type CreateWorkflowState,
} from "@/lib/createWorkflowState";
import {
  ensureRuntimeCreationRecord,
  getRuntimeCreationRecord,
} from "./creationRecord";
import type { CanonicalCurrentFocus } from "./types";

/** Destination-specific noun for Focus copy (retreat / workshop / event). */
function eventDestinationNoun(record: {
  eventTypeLabel?: string | null;
}): string {
  const label = (record.eventTypeLabel || "event").trim().toLowerCase();
  if (!label || label === "event plan") return "event";
  return label;
}

function focusFromEventRecord(
  creationId: string,
  contextVersion?: number,
): CanonicalCurrentFocus | null {
  const record = getEventRecord(creationId);
  if (!record) return null;

  const version =
    contextVersion ?? (Date.parse(record.updatedAt) || 1);
  const knownContext = establishedFactsFromRecord(record);
  const noun = eventDestinationNoun(record);

  if (!isEventFoundationReady(record)) {
    const q = nextFoundationQuestion(record);
    if (!q) return null;
    const sectionSaved =
      record.sections.find((s) => s.id === q.sectionId)?.content ?? "";
    return {
      focusId: q.id,
      creationId: record.id,
      title: q.sectionId.replace(/_/g, " "),
      purpose: "Building the foundation so everything else stays connected.",
      prompt: q.prompt,
      responseType: "multiline",
      knownContext,
      availableGuidance: [
        "I'm not sure yet",
        "Give me ideas",
        "Skip for now",
      ],
      completionCriteria: `Confirm ${q.sectionId}`,
      nextTransition: "next_foundation_or_agenda",
      contextVersion: version,
      sectionId: q.sectionId,
      assetTypeId: null,
      savedContent: sectionSaved,
      // One guidance line only — never repeat purpose/prompt.
      introductoryGuidance: `We'll take this one decision at a time. Your answer stays with this ${noun}.`,
    };
  }

  const packFocus = buildWorkspaceCurrentFocus(record);
  const focusId = packFocus.assetTypeId
    ? `asset:${packFocus.assetTypeId}`
    : packFocus.sectionId
      ? `section:${packFocus.sectionId}`
      : `focus:${packFocus.title}`;

  // Every explanation once: reason → purpose; prompt is the action; no intro echo.
  const action =
    packFocus.actionLabel?.trim() ||
    `Continue with ${packFocus.title}`;
  const packSectionId = packFocus.sectionId ?? null;
  const packSaved = packSectionId
    ? (record.sections.find((s) => s.id === packSectionId)?.content ?? "")
    : "";
  return {
    focusId,
    creationId: record.id,
    title: packFocus.title,
    purpose: packFocus.reason,
    prompt: action,
    responseType: "multiline",
    knownContext,
    availableGuidance: ["Give me ideas", "I'm not sure yet"],
    completionCriteria: packFocus.actionLabel || "Continue",
    nextTransition: "next_recommendation",
    contextVersion: version,
    sectionId: packSectionId,
    assetTypeId: packFocus.assetTypeId ?? null,
    savedContent: packSaved,
    introductoryGuidance: null,
  };
}

function focusFromRuntimeRecord(
  creationId: string,
  workflow?: CreateWorkflowState | null,
  contextVersion?: number,
): CanonicalCurrentFocus {
  let record = getRuntimeCreationRecord(creationId);
  if (!record && workflow) {
    record = ensureRuntimeCreationRecord({
      ...workflow,
      sessionId: workflow.sessionId || creationId,
    });
  }
  if (!record) {
    // Absolute fallback — Focus must never disappear
    return {
      focusId: "opening",
      creationId,
      title: "Getting started",
      purpose: "We'll shape this one step at a time.",
      prompt: "What are you creating — and what matters most about it right now?",
      responseType: "multiline",
      knownContext: [],
      availableGuidance: ["Give me ideas", "I'm not sure yet"],
      completionCriteria: "Name the creation",
      nextTransition: "next_section",
      contextVersion: contextVersion ?? 1,
      sectionId: null,
      assetTypeId: null,
      introductoryGuidance:
        "There's no wrong place to start. A rough phrase is enough.",
    };
  }

  const typeLabel = record.typeLabel || "Creation";
  const wfStub = {
    ...(workflow ?? {}),
    sessionId: creationId,
    sectionContent: record.sectionContent,
    skippedSectionIds: record.skippedSectionIds,
    selectedTypeLabel: typeLabel,
  } as CreateWorkflowState;

  const sections = workspaceV2Sections(wfStub);
  const next =
    sections.find((s) => !s.skipped && !s.content.trim()) ?? null;
  const version =
    contextVersion ?? (Date.parse(record.updatedAt) || 1);
  const knownContext = record.knownFacts.slice(0, 8);

  if (!next) {
    return {
      focusId: "ready-to-build",
      creationId: record.id,
      title: "Ready for a draft",
      purpose: `Your ${typeLabel} sections have what we need.`,
      prompt:
        "Would you like to Build a draft now, or refine anything first? Share a tweak here, or use Build a draft.",
      responseType: "multiline",
      knownContext,
      availableGuidance: ["Give me ideas", "I'm ready — build a draft"],
      completionCriteria: "Build or refine",
      nextTransition: "draft",
      contextVersion: version,
      sectionId: null,
      assetTypeId: null,
      introductoryGuidance:
        "You're in a good place. Build a draft when you're ready — we'll stay right here.",
    };
  }

  return {
    focusId: `section:${next.id}`,
    creationId: record.id,
    title: next.label,
    purpose: `Let's shape ${next.label.toLowerCase()} for your ${typeLabel}.`,
    prompt: `What belongs in ${next.label}? A rough phrase is plenty.`,
    responseType: "multiline",
    knownContext,
    availableGuidance: [
      "I'm not sure yet",
      "Give me ideas",
      "Skip for now",
    ],
    completionCriteria: `Fill ${next.label}`,
    nextTransition: "next_section",
    contextVersion: version,
    sectionId: next.id,
    assetTypeId: null,
    savedContent: next.content ?? "",
    introductoryGuidance:
      "Answer here — your work stays in this workspace.",
  };
}

/**
 * 077 — Map click / member-selected section wins over auto-next foundation.
 * Opens any Workshop Map section in any order without locking others.
 */
function focusFromActiveSection(
  creationId: string,
  workflow: CreateWorkflowState | null | undefined,
  contextVersion?: number,
): CanonicalCurrentFocus | null {
  const sectionId = workflow?.activeSectionId?.trim();
  if (!sectionId || !workflow) return null;

  const sections = workspaceV2Sections(workflow);
  const section = sections.find((s) => s.id === sectionId);
  if (!section) return null;

  const typeLabel = resolvedTypeLabel(workflow) || "Creation";
  const event =
    getEventRecord(creationId) ??
    (workflow.eventRecordId
      ? getEventRecord(workflow.eventRecordId)
      : null);
  const version =
    contextVersion ?? (event ? Date.parse(event.updatedAt) || 1 : 1);
  const knownContext = event
    ? establishedFactsFromRecord(event).slice(0, 8)
    : [];

  return {
    focusId: `section:${section.id}`,
    creationId,
    title: section.label,
    purpose: `Working on ${section.label} for your ${typeLabel}.`,
    prompt: section.skipped
      ? `${section.label} is marked N/A for now. Reopen it anytime, or move to another section.`
      : section.content.trim()
        ? `Continue shaping ${section.label}. Edit below or share what to change.`
        : `What belongs in ${section.label}? A rough phrase is plenty.`,
    responseType: "multiline",
    knownContext,
    availableGuidance: [
      "I'm not sure yet",
      "Give me ideas",
      "Skip for now",
    ],
    completionCriteria: `Fill ${section.label}`,
    nextTransition: "next_section",
    contextVersion: version || 1,
    sectionId: section.id,
    assetTypeId: null,
    savedContent: section.content,
    introductoryGuidance: null,
  };
}

/**
 * Resolve the sole Current Focus the workspace may expose.
 * Always returns a focus when creationId is present.
 */
export function resolveCanonicalCurrentFocus(input: {
  creationId: string;
  contextVersion?: number;
  workflow?: CreateWorkflowState | null;
}): CanonicalCurrentFocus | null {
  const id = input.creationId?.trim();
  if (!id) return null;

  const fromMap = focusFromActiveSection(id, input.workflow, input.contextVersion);
  if (fromMap) return fromMap;

  const eventFocus = focusFromEventRecord(id, input.contextVersion);
  if (eventFocus) return eventFocus;

  // Also try workflow.eventRecordId if creationId is session id
  const eventId = input.workflow?.eventRecordId?.trim();
  if (eventId && eventId !== id) {
    const viaWorkflow = focusFromEventRecord(eventId, input.contextVersion);
    if (viaWorkflow) return viaWorkflow;
  }

  return focusFromRuntimeRecord(id, input.workflow, input.contextVersion);
}

/** Single focus exposed to workspace — always when creationId known. */
export function getSoleWorkspaceCurrentFocus(
  creationId: string | null | undefined,
  workflow?: CreateWorkflowState | null,
): CanonicalCurrentFocus | null {
  if (!creationId?.trim()) {
    if (workflow?.sessionId || workflow?.eventRecordId) {
      return resolveCanonicalCurrentFocus({
        creationId:
          workflow.eventRecordId || workflow.sessionId || "",
        workflow,
      });
    }
    return null;
  }
  return resolveCanonicalCurrentFocus({
    creationId,
    workflow,
  });
}

/** Convenience for Estate open — ensure record then resolve. */
export function resolveFocusForCreationDestination(
  workflow: CreateWorkflowState,
): CanonicalCurrentFocus {
  const ensured = ensureRuntimeCreationRecord(workflow);
  const focus = resolveCanonicalCurrentFocus({
    creationId: ensured.id,
    workflow: {
      ...workflow,
      sessionId: workflow.sessionId || ensured.id,
    },
  });
  if (focus) return focus;
  // Impossible path — keep Focus alive
  return {
    focusId: "opening",
    creationId: ensured.id,
    title: resolvedTypeLabel(workflow) || "Creation",
    purpose: "We'll shape this together.",
    prompt: "What matters most about this creation right now?",
    responseType: "multiline",
    knownContext: [],
    availableGuidance: ["Give me ideas"],
    completionCriteria: "First answer",
    nextTransition: "next_section",
    contextVersion: 1,
    sectionId: null,
    assetTypeId: null,
  };
}
