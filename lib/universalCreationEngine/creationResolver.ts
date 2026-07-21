/**
 * 051 — Creation resolution + existing-work / no-duplicate gate.
 */

import {
  resolveLargerCreation,
  similarAssetAlreadyExists,
  type ResolvedCreationEcosystem,
} from "@/lib/creationEcosystem";
import {
  getActiveEventRecord,
  listEventRecords,
  setActiveEventRecordId,
  shouldRouteToEventsIntelligence,
} from "@/lib/eventsIntelligence";
import type { CreateBlueprint } from "@/lib/platformIntent/types";
import {
  isEventsBlueprint,
  resolveCreationBlueprint,
} from "./blueprintResolver";
import type { CreationResolution, UniversalCreationIntent } from "./types";

export type CreationResolverInput = {
  userText: string;
  intent: UniversalCreationIntent;
  blueprint?: CreateBlueprint | null;
  forceNew?: boolean;
};

/**
 * Locate existing creation or prepare to create one.
 * CONTINUE / IMPROVE / ORGANIZE prefer resume over new.
 */
export function resolveCreation(
  input: CreationResolverInput,
): CreationResolution {
  const blueprint =
    input.blueprint ??
    resolveCreationBlueprint({ userText: input.userText });
  const active = getActiveEventRecord();
  const existing = resolveLargerCreation({ preferActiveEvent: true });

  const wantsResume =
    input.intent === "continue" ||
    input.intent === "improve" ||
    input.intent === "review" ||
    input.intent === "adapt" ||
    input.intent === "organize" ||
    input.intent === "complete";

  const isEventDomain =
    isEventsBlueprint(blueprint) ||
    shouldRouteToEventsIntelligence({
      userText: input.userText,
      hasActiveEventRecord: Boolean(active),
    }) ||
    Boolean(active);

  // Resume path
  if (wantsResume && (existing || active)) {
    const event = existing?.eventRecord ?? active;
    return {
      found: true,
      creationRecordId: existing?.creationId ?? event?.id ?? null,
      workspaceId: event?.id ?? existing?.creationId ?? null,
      eventRecordId: event?.id ?? null,
      canonicalWorkId:
        existing?.canonicalWork?.id ?? event?.canonicalWorkId ?? null,
      projectHomeId:
        existing?.projectHomeId ?? event?.projectHomeId ?? null,
      blueprint,
      isDuplicateAttempt: false,
      resume: true,
      reason: "resume_existing_creation",
    };
  }

  // Duplicate gate: clear CREATE while an active incomplete event of same type exists
  if (
    !input.forceNew &&
    (input.intent === "create" || input.intent === "plan") &&
    isEventDomain &&
    active &&
    (active.purpose.trim() ||
      active.audience.trim() ||
      active.outcomes.trim())
  ) {
    const sameFamily =
      !blueprint ||
      blueprint.specialtyRuntime === "events" ||
      active.eventTypeLabel
        .toLowerCase()
        .includes(
          (blueprint.label ?? "").toLowerCase().split(" ")[0] ?? "",
        );

    if (sameFamily) {
      return {
        found: true,
        creationRecordId: existing?.creationId ?? active.id,
        workspaceId: active.id,
        eventRecordId: active.id,
        canonicalWorkId: active.canonicalWorkId,
        projectHomeId: active.projectHomeId,
        blueprint,
        isDuplicateAttempt: true,
        resume: true,
        reason: "no_duplicate_workspace_resume_active",
      };
    }
  }

  if (existing && isEventDomain && wantsResume) {
    return fromExisting(existing, blueprint, false, true, "existing_match");
  }

  // Soft match: incomplete event of same family already listed (even if not active)
  if (
    (input.intent === "create" || input.intent === "plan") &&
    isEventDomain &&
    !input.forceNew
  ) {
    const listed = listEventRecords();
    const text = input.userText.toLowerCase();
    const match = listed.find((r) => {
      if (r.runtimeState === "COMPLETED" || r.runtimeState === "CANCELED") {
        return false;
      }
      if (/\bworkshop\b/.test(text) && r.eventType === "workshop") return true;
      if (/\bretreat\b/.test(text) && r.eventType === "retreat") return true;
      if (/\bconference\b/.test(text) && r.eventType === "conference")
        return true;
      if (/\bwebinar\b/.test(text) && r.eventType === "webinar") return true;
      return Boolean(r.purpose.trim() || r.audience.trim());
    });
    if (match) {
      setActiveEventRecordId(match.id);
      return {
        found: true,
        creationRecordId: match.canonicalWorkId || match.id,
        workspaceId: match.id,
        eventRecordId: match.id,
        canonicalWorkId: match.canonicalWorkId,
        projectHomeId: match.projectHomeId,
        blueprint,
        isDuplicateAttempt: true,
        resume: true,
        reason: "no_duplicate_open_event",
      };
    }
  }

  return {
    found: Boolean(existing || active),
    creationRecordId: existing?.creationId ?? active?.id ?? null,
    workspaceId: active?.id ?? existing?.creationId ?? null,
    eventRecordId: active?.id ?? existing?.eventRecord?.id ?? null,
    canonicalWorkId:
      existing?.canonicalWork?.id ?? active?.canonicalWorkId ?? null,
    projectHomeId:
      existing?.projectHomeId ?? active?.projectHomeId ?? null,
    blueprint,
    isDuplicateAttempt: false,
    resume: Boolean(active && wantsResume),
    reason: existing || active ? "context_present" : "new_creation_needed",
  };
}

function fromExisting(
  existing: ResolvedCreationEcosystem,
  blueprint: CreateBlueprint | null,
  isDuplicateAttempt: boolean,
  resume: boolean,
  reason: string,
): CreationResolution {
  return {
    found: true,
    creationRecordId: existing.creationId,
    workspaceId: existing.eventRecord?.id ?? existing.creationId,
    eventRecordId: existing.eventRecord?.id ?? null,
    canonicalWorkId: existing.canonicalWork?.id ?? null,
    projectHomeId: existing.projectHomeId,
    blueprint: blueprint ?? null,
    isDuplicateAttempt,
    resume,
    reason,
  };
}

/** Asset-level no-duplicate gate (049). */
export function wouldDuplicateAsset(input: {
  assetDefId: string;
  eventRecordId?: string | null;
  creationId?: string | null;
}): boolean {
  const creation = resolveLargerCreation({
    eventRecordId: input.eventRecordId,
    creationId: input.creationId,
    preferActiveEvent: true,
  });
  if (!creation) return false;
  return similarAssetAlreadyExists(creation, input.assetDefId);
}
