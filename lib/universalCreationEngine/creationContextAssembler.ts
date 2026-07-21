/**
 * 051 — Assemble UniversalCreationContext from domain records (no duplication).
 */

import {
  buildCreationConversationContext,
  computeCreationReadiness,
  listAssetRelationshipCards,
  resolveLargerCreation,
} from "@/lib/creationEcosystem";
import type { EventRecord } from "@/lib/eventsIntelligence";
import { recommendEventAssets } from "@/lib/eventsIntelligence";
import { resolveCreationOwnership } from "./ownershipResolver";
import type {
  CreationAudience,
  CreationKnownFact,
  UniversalCreationContext,
} from "./types";
import type { CreationResolution } from "./types";
import type { EventCreationWorkspaceSnapshot } from "@/lib/eventCreationWorkspace/types";

export function assembleUniversalCreationContext(input: {
  resolution: CreationResolution;
  record: EventRecord | null;
  workspace: EventCreationWorkspaceSnapshot | null;
  latestUserGoal: string;
  conversationId?: string | null;
}): UniversalCreationContext | null {
  const { record, resolution, workspace } = input;
  if (!record && !resolution.creationRecordId) return null;

  const creation =
    resolveLargerCreation({
      eventRecordId: record?.id ?? resolution.eventRecordId,
      creationId: resolution.creationRecordId,
      preferActiveEvent: true,
    }) ?? null;

  const conv = creation
    ? buildCreationConversationContext(creation)
    : null;

  const knownFacts = knownFactsFromRecord(record, conv?.doNotReask ?? []);
  const audiences = audiencesFromRecord(record);
  const ownership = resolveCreationOwnership({
    blueprint: resolution.blueprint,
  });

  const creationId =
    creation?.creationId ?? record?.id ?? resolution.creationRecordId ?? "";
  const readiness = computeCreationReadiness({
    creationId,
    ecosystem: creation?.ecosystem ?? null,
  });
  const cards = listAssetRelationshipCards(creationId);
  const focused = record
    ? recommendEventAssets(record, { focusLimit: 6 }).focused
    : workspace?.focusedAssetRecommendations?.slice(0, 6) ?? [];

  const assets = [
    ...(creation?.ecosystem?.instances.map((i) => ({
      assetTypeId: i.assetId,
      label: i.label,
      status: i.status,
      instanceId: i.assetId,
    })) ?? []),
    ...cards.map((c) => ({
      assetTypeId: c.assetDefId,
      label: c.label,
      status: c.status,
      instanceId: c.assetInstanceKey,
    })),
  ];

  return {
    creationRecordId: creationId,
    workspaceId: workspace?.eventRecordId ?? record?.id ?? creationId,
    creationType: record?.eventTypeLabel ?? creation?.creationType ?? "Creation",
    creationSubtype: record?.eventType,
    blueprintId: resolution.blueprint?.id ?? creation?.blueprintId ?? "",
    title: record?.title ?? creation?.title ?? "Untitled creation",
    purpose: record?.purpose?.trim() || conv?.purpose || undefined,
    intendedOutcomes: record?.outcomes?.trim()
      ? [record.outcomes.trim()]
      : conv?.outcomes
        ? [conv.outcomes]
        : [],
    audiences,
    constraints: [],
    currentPhase: record?.lifecyclePhase ?? "discovery",
    currentSectionId: workspace?.nextDecisionSectionId ?? undefined,
    currentAssetId: undefined,
    knownFacts,
    doNotReaskFields: conv?.doNotReask ?? doNotReaskFromRecord(record),
    decisions:
      record?.decisions.map((d) => ({
        id: d.id,
        prompt: d.decision,
        resolved: d.resolved,
        value: d.resolvedValue,
      })) ?? [],
    unresolvedDecisions:
      record?.decisions
        .filter((d) => !d.resolved)
        .map((d) => ({
          id: d.id,
          prompt: d.decision,
          resolved: false,
        })) ?? [],
    assets,
    tasks:
      record?.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        done: t.done,
      })) ?? [],
    milestones:
      record?.milestones.map((m) => ({
        id: m.id,
        title: m.title,
        done: m.done,
      })) ?? [],
    primaryOwner: ownership.primaryOwner,
    activeContributors: ownership.contributorIds.map((id) => ({
      chamberMemberId: id,
      role: "contributor" as const,
    })),
    boardAdvice: [],
    readiness: {
      overallPercent: readiness.overallPercent,
      byArea: readiness.byArea,
    },
    relationshipSummary: {
      edgeCount: cards.length,
      assetCardCount: cards.length,
    },
    conversationIds: input.conversationId ? [input.conversationId] : [],
    latestUserGoal: input.latestUserGoal,
    returnState: {
      workspaceKind: workspace ? "event_creation" : null,
      phase: record?.lifecyclePhase ?? null,
      sectionId: workspace?.nextDecisionSectionId ?? null,
      lastUpdatedAt: record?.updatedAt ?? null,
    },
    version: "051.1",
    focusedRecommendations: focused,
  };
}

function knownFactsFromRecord(
  record: EventRecord | null,
  doNotReask: string[],
): CreationKnownFact[] {
  if (!record) return [];
  const facts: CreationKnownFact[] = [];
  if (record.eventTypeLabel)
    facts.push({ field: "event_type", value: record.eventTypeLabel });
  if (record.purpose.trim())
    facts.push({ field: "purpose", value: record.purpose.trim() });
  if (record.audience.trim())
    facts.push({ field: "audience", value: record.audience.trim() });
  if (record.outcomes.trim())
    facts.push({ field: "outcomes", value: record.outcomes.trim() });
  if (record.format !== "unspecified")
    facts.push({ field: "format", value: record.format });
  if (record.dates.trim())
    facts.push({ field: "dates", value: record.dates.trim() });
  if (record.venue.trim())
    facts.push({ field: "venue", value: record.venue.trim() });
  void doNotReask;
  return facts;
}

function audiencesFromRecord(record: EventRecord | null): CreationAudience[] {
  if (!record?.audience.trim()) return [];
  const parts = record.audience.split(/;|\band\balso\b/i).map((s) => s.trim());
  const out: CreationAudience[] = [];
  if (parts[0]) out.push({ label: parts[0], role: "primary" });
  if (parts[1]) out.push({ label: parts[1], role: "secondary" });
  for (let i = 2; i < parts.length; i++) {
    if (parts[i]) out.push({ label: parts[i]!, role: "other" });
  }
  if (out.length === 0) {
    out.push({ label: record.audience.trim(), role: "primary" });
  }
  return out;
}

function doNotReaskFromRecord(record: EventRecord | null): string[] {
  if (!record) return [];
  const fields: string[] = [];
  if (record.eventTypeLabel) fields.push("event_type");
  if (record.audience.trim()) fields.push("audience");
  if (record.purpose.trim()) fields.push("purpose");
  if (record.outcomes.trim()) fields.push("outcomes", "goals");
  if (record.format !== "unspecified") fields.push("format");
  if (record.dates.trim()) fields.push("dates");
  if (record.venue.trim()) fields.push("venue");
  return fields;
}
