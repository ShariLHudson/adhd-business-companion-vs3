/**
 * 049 — Creation Context for conversations inside a Creation Workspace.
 * Never re-ask what is already established.
 */

import type { EventRecord } from "@/lib/eventsIntelligence/types";
import type { CreationConversationContext } from "./types";
import type { ResolvedCreationEcosystem } from "./resolveCreation";
import { listAssetRelationshipCards } from "./relationshipRegistry";

export function buildCreationConversationContext(
  creation: ResolvedCreationEcosystem,
): CreationConversationContext {
  const event = creation.eventRecord;
  const work = creation.canonicalWork;
  const purpose =
    event?.purpose?.trim() ||
    work?.purpose?.trim() ||
    event?.outcomes?.trim() ||
    "";
  const audience = event?.audience?.trim() || work?.audience?.trim() || "";
  const outcomes = event?.outcomes?.trim() || "";

  const knownDecisions = [
    ...(event?.decisions
      .filter((d) => d.resolved && d.resolvedValue)
      .map((d) => d.resolvedValue!) ?? []),
    ...(work?.decisions ?? []),
  ].slice(0, 12);

  const completedPhases: string[] = [];
  if (event) {
    completedPhases.push(event.lifecyclePhase);
    for (const s of event.sections) {
      if (s.status === "confirmed" && s.content.trim()) {
        completedPhases.push(s.id);
      }
    }
  }

  const existingAssetLabels = [
    ...(creation.ecosystem?.instances.map((i) => i.label) ?? []),
    ...listAssetRelationshipCards(creation.creationId).map((c) => c.label),
  ];

  const doNotReask: string[] = [];
  if (event?.eventTypeLabel) doNotReask.push("event_type");
  if (audience) doNotReask.push("audience");
  if (purpose) doNotReask.push("purpose");
  if (outcomes) doNotReask.push("outcomes", "goals");
  if (event?.format && event.format !== "unspecified") doNotReask.push("format");
  if (event?.dates?.trim()) doNotReask.push("dates");
  if (event?.venue?.trim()) doNotReask.push("venue");
  if (event?.budget?.trim()) doNotReask.push("budget");
  if (knownDecisions.length) doNotReask.push("known_decisions");
  if (existingAssetLabels.length) doNotReask.push("existing_assets");

  return {
    creationId: creation.creationId,
    creationName: creation.title,
    creationType: creation.creationType,
    purpose,
    audience,
    outcomes,
    knownDecisions,
    completedPhases: [...new Set(completedPhases)],
    existingAssetLabels: [...new Set(existingAssetLabels)],
    doNotReask: [...new Set(doNotReask)],
  };
}

/** Compact prompt block for model / Chamber enhancement */
export function formatCreationContextForPrompt(
  ctx: CreationConversationContext,
): string {
  const lines = [
    `Creation: ${ctx.creationName} (${ctx.creationType})`,
    ctx.purpose ? `Purpose: ${ctx.purpose}` : null,
    ctx.audience ? `Audience: ${ctx.audience}` : null,
    ctx.outcomes ? `Outcomes: ${ctx.outcomes}` : null,
    ctx.existingAssetLabels.length
      ? `Assets already created: ${ctx.existingAssetLabels.join(", ")}`
      : null,
    ctx.knownDecisions.length
      ? `Known decisions: ${ctx.knownDecisions.slice(0, 5).join("; ")}`
      : null,
    `Do not re-ask: ${ctx.doNotReask.join(", ") || "nothing established yet"}`,
  ].filter(Boolean);
  return lines.join("\n");
}

export function eventRecordToPartialContext(
  event: EventRecord,
): Pick<
  CreationConversationContext,
  "creationName" | "creationType" | "purpose" | "audience" | "outcomes" | "doNotReask"
> {
  const doNotReask: string[] = ["event_type"];
  if (event.audience.trim()) doNotReask.push("audience");
  if (event.purpose.trim()) doNotReask.push("purpose");
  if (event.outcomes.trim()) doNotReask.push("outcomes");
  return {
    creationName: event.title,
    creationType: event.eventTypeLabel,
    purpose: event.purpose,
    audience: event.audience,
    outcomes: event.outcomes,
    doNotReask,
  };
}
