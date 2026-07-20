/**
 * Sync Event Creation Workspace → Create workflow (same canonical Event Record).
 * 058 / 059 — stamps What We Know + Current Focus so the Workspace never opens blank.
 */

import { resolveHumanReadableTitle } from "@/lib/activeWorkspaceRegistry/humanReadableIdentity";
import { mayApplyEventWorkspace } from "@/lib/creationIdentity/deriveCreationIdentity";
import type { CreateTemplateSection } from "@/lib/createTemplates";
import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { coerceCreationDestinationQuestionMode } from "@/lib/currentFocus/questionMode";
import { buildEventDiscoveryTransition } from "@/lib/discoveryToWorkspace";
import type { EventRecord } from "@/lib/eventsIntelligence/types";
import {
  applyWorkTypeMapToCreateWorkflow,
  EVENT_PLAN_SCHEMA,
  ensureEventPlanSchemaRegistered,
  workshopMapToTemplateSections,
} from "@/lib/workTypeSchema";
import { buildEventCreationWorkspace } from "./buildEventWorkspace";

ensureEventPlanSchemaRegistered();

export function eventWorkspaceTemplateSections(): CreateTemplateSection[] {
  return workshopMapToTemplateSections(EVENT_PLAN_SCHEMA.sections);
}

/**
 * Apply full event section map + known content onto a Create workflow.
 * Focus sections stay visible; later sections remain in the structure.
 *
 * Authority chains:
 * - Document (Checklist, …): never apply — return unchanged.
 * - Event (Retreat, Workshop, …):
 *   workingIntent → type → template → workspace → structure → Event bind → title
 *   Classification type and identity title survive Event binding.
 */
export function applyEventWorkspaceToCreateWorkflow(
  workflow: CreateWorkflowState,
  record: EventRecord,
  options?: { showAllSections?: boolean },
): CreateWorkflowState {
  const classificationType =
    workflow.selectedTypeLabel?.trim() ||
    workflow.workingIntent?.replace(/^Create\s+/i, "").trim() ||
    record.eventTypeLabel?.trim() ||
    "Event Plan";
  if (!mayApplyEventWorkspace(classificationType)) {
    return workflow;
  }

  const snap = buildEventCreationWorkspace(record);

  // Domain bridge only — Event Record facts → section content.
  const sectionContent: Record<string, string> = {
    ...(workflow.sectionContent ?? {}),
  };
  for (const s of record.sections) {
    if (s.content.trim()) sectionContent[s.id] = s.content;
  }
  if (record.outcomes.trim()) sectionContent.outcomes = record.outcomes;
  if (record.audience.trim()) sectionContent.audience = record.audience;
  if (record.purpose.trim()) {
    sectionContent.purpose = record.purpose;
  }
  if (record.dates.trim()) sectionContent.dates = record.dates;
  if (record.venue.trim()) sectionContent.venue = record.venue;
  if (record.budget.trim()) sectionContent.budget = record.budget;
  sectionContent.event_type = classificationType;
  if (record.format !== "unspecified") {
    sectionContent.format =
      record.format === "in_person"
        ? "In person"
        : record.format === "virtual"
          ? "Virtual"
          : "Hybrid";
  }

  const transition = buildEventDiscoveryTransition(record);
  const humanTitle = resolveHumanReadableTitle({
    memberTitle: workflow.selectedTemplateName || record.title,
    existingTitle: workflow.selectedTemplateName,
    requestText:
      workflow.originalRequest || record.purpose || record.title || null,
    creationType: classificationType,
  });

  // Shared Full Workshop Map hydrate (077/080) — Event only configures schema + facts.
  const mapped = applyWorkTypeMapToCreateWorkflow(workflow, EVENT_PLAN_SCHEMA, {
    showAllSections: options?.showAllSections,
    sectionContent,
    focusSectionIds: snap.focusSectionIds,
    nextSectionId: snap.nextDecisionSectionId,
    selectedTemplateId: "event-creation-workspace",
  });

  return {
    ...mapped,
    selectedTypeLabel: classificationType,
    workingIntent:
      workflow.workingIntent?.trim() || `Create ${classificationType}`,
    questionMode: coerceCreationDestinationQuestionMode("current_focus"),
    selectedTemplateName: humanTitle,
    creationWorkspaceKind: "event",
    eventRecordId: record.id,
    workspaceKnownFacts: transition.knownFactLines,
    workspaceCurrentFocus: transition.currentFocus,
    workspacePhaseLabel: transition.phaseLabel,
    workspaceSecondaryRecommendations:
      transition.secondaryRecommendations ?? [],
    universalCreationState: transition.universalCreationState ?? null,
  };
}
