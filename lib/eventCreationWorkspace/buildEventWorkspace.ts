/**
 * Build a complete Event Creation Workspace from an Event Record.
 */

import type { EventRecord, EventSectionId } from "@/lib/eventsIntelligence/types";
import { nextFoundationQuestion } from "@/lib/eventsIntelligence/lifecycle";
import {
  buildSectionAssetPanel,
  buildWorkspaceFocusedRecommendations,
} from "@/lib/eventsIntelligence/eventAssetRegistry/sectionCapabilityPanel";
import { buildFocusSectionRuntimePanels } from "@/lib/eventsIntelligence/eventCapabilityRegistry";
import {
  allEventWorkspaceSectionDefs,
  focusSectionIdsForEventType,
  workspaceLabelForEventType,
} from "./sectionProfiles";
import type { EventCreationWorkspaceSnapshot } from "./types";

export function establishedFactsFromRecord(record: EventRecord): string[] {
  const facts: string[] = [];
  if (record.eventTypeLabel) {
    facts.push(`This is a ${record.eventTypeLabel.toLowerCase()}.`);
  }
  if (record.outcomes.trim()) {
    facts.push(`Outcome: ${trimFact(record.outcomes)}`);
  }
  if (record.audience.trim()) {
    facts.push(`Audience: ${trimFact(record.audience)}`);
  }
  if (record.purpose.trim()) {
    facts.push(`Purpose: ${trimFact(record.purpose)}`);
  }
  if (record.format !== "unspecified") {
    facts.push(
      `Format: ${
        record.format === "in_person"
          ? "in person"
          : record.format === "virtual"
            ? "virtual"
            : "hybrid"
      }.`,
    );
  }
  if (record.dates.trim()) {
    facts.push(`Timing: ${trimFact(record.dates)}`);
  }
  if (record.venue.trim()) {
    facts.push(`Venue: ${trimFact(record.venue)}`);
  }
  if (record.budget.trim()) {
    facts.push(`Budget: ${trimFact(record.budget)}`);
  }
  return facts;
}

function trimFact(text: string, max = 110): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

/**
 * Acknowledge what is already known before the next planning decision.
 */
export function acknowledgeEstablishedLead(record: EventRecord): string {
  const facts = establishedFactsFromRecord(record);
  if (facts.length <= 1) {
    return "I've kept the full event map ready in your Creation Workspace.";
  }
  const known = facts.slice(1).slice(0, 3);
  if (known.length === 1) {
    return `I've noted that — ${known[0].replace(/\.$/, "")}.`;
  }
  if (known.length === 2) {
    return (
      `So far we have: ${known[0].replace(/\.$/, "")}, and ${known[1].replace(/\.$/, "")}.`
    );
  }
  return (
    `So far we have: ${known
      .slice(0, -1)
      .map((f) => f.replace(/\.$/, ""))
      .join("; ")}; and ${known[known.length - 1]!.replace(/\.$/, "")}.`
  );
}

export function buildEventCreationWorkspace(
  record: EventRecord,
): EventCreationWorkspaceSnapshot {
  const focusIds = [...focusSectionIdsForEventType(record.eventType)];
  const focusSet = new Set(focusIds);
  const defs = allEventWorkspaceSectionDefs(record.eventType);
  const contentById = new Map(record.sections.map((s) => [s.id, s]));

  const sections = defs.map((def, order) => {
    const live = contentById.get(def.id);
    const visibility = focusSet.has(def.id)
      ? ("focus" as const)
      : live?.content.trim()
        ? ("available" as const)
        : ("later" as const);
    return {
      ...def,
      content: live?.content ?? "",
      status: live?.status ?? ("empty" as const),
      visibility,
      order,
    };
  });

  const nextQ = nextFoundationQuestion(record);

  // 052A / 053 — dynamic section panels from Capability Registry (never hardcoded dumps)
  const sectionAssetPanels = focusIds.map((id) =>
    buildSectionAssetPanel(record, id),
  );
  const sectionRuntimePanels = buildFocusSectionRuntimePanels(
    record,
    focusIds as EventSectionId[],
  );

  return {
    eventRecordId: record.id,
    eventType: record.eventType,
    title: record.title,
    workspaceLabel: workspaceLabelForEventType(
      record.eventType,
      record.eventTypeLabel,
    ),
    sections,
    focusSectionIds: focusIds as EventSectionId[],
    establishedSummary: establishedFactsFromRecord(record),
    nextDecisionSectionId: nextQ?.sectionId ?? null,
    focusedAssetRecommendations: buildWorkspaceFocusedRecommendations(record),
    sectionAssetPanels,
    sectionRuntimePanels,
  };
}
