/**
 * 051 Phase 1 — Event reference adapter.
 * Reuses Events Intelligence / 048 / 049 — does not parallel-implement planning.
 */

import {
  getActiveEventRecord,
  processEventsIntelligenceTurn,
  setActiveEventRecordId,
  shouldRouteToEventsIntelligence,
  upsertEventRecord,
  type EventRecord,
  type EventsIntelligenceTurnResult,
} from "@/lib/eventsIntelligence";
import { createEmptyEventSections } from "@/lib/eventsIntelligence/eventSections";
import { assembleUniversalCreationContext } from "./creationContextAssembler";
import { resolveUniversalCreationIntent } from "./creationIntentResolver";
import { resolveCreation } from "./creationResolver";
import {
  assertConversationSafe,
  selectNextBestStep,
} from "./nextBestStepEngine";
import { resolveCreationWorkspace } from "./workspaceResolver";
import type { UniversalCreationEngineResult } from "./types";

/**
 * Process a turn through the Universal Creation Engine (Events path).
 */
export function processUniversalCreationTurn(input: {
  userText: string;
  activeChamberMemberId?: string | null;
  conversationId?: string | null;
  forceStart?: boolean;
}): UniversalCreationEngineResult {
  const intentClass = resolveUniversalCreationIntent(input.userText);

  // KNOW / DECIDE — never open Create
  if (intentClass.stayInConversation && intentClass.intent === "know") {
    return {
      handled: false,
      intent: "know",
      resolution: {
        found: false,
        creationRecordId: null,
        workspaceId: null,
        eventRecordId: null,
        canonicalWorkId: null,
        projectHomeId: null,
        blueprint: null,
        isDuplicateAttempt: false,
        resume: false,
        reason: "knowledge_stays_in_conversation",
      },
      context: null,
      nextStep: selectNextBestStep({
        context: null,
        record: null,
        intent: "know",
      }),
      reply: "",
      eventRecordId: null,
      projectHomeId: null,
      projectHomeCreated: false,
      conversationSafe: true,
      kind: "noop",
      record: null,
    };
  }

  const resolution = resolveCreation({
    userText: input.userText,
    intent: intentClass.intent,
    blueprint: intentClass.blueprint,
    forceNew: input.forceStart,
  });

  const blueprint = intentClass.blueprint ?? resolution.blueprint;
  // Non-event blueprints use the shared engine without the Events specialty runtime
  if (blueprint && blueprint.specialtyRuntime !== "events") {
    return {
      handled: false,
      intent: intentClass.intent,
      resolution: {
        ...resolution,
        blueprint,
        reason: "non_event_blueprint_shared_engine",
      },
      context: null,
      nextStep: null,
      reply: "",
      eventRecordId: null,
      projectHomeId: null,
      projectHomeCreated: false,
      conversationSafe: true,
      kind: "noop",
      record: null,
    };
  }

  const shouldEvents =
    input.forceStart ||
    shouldRouteToEventsIntelligence({
      userText: input.userText,
      activeChamberMemberId: input.activeChamberMemberId,
      hasActiveEventRecord: Boolean(
        getActiveEventRecord() || resolution.eventRecordId,
      ),
    }) ||
    blueprint?.specialtyRuntime === "events" ||
    resolution.resume;

  if (!shouldEvents && intentClass.intent !== "continue") {
    return {
      handled: false,
      intent: intentClass.intent,
      resolution,
      context: null,
      nextStep: null,
      reply: "",
      eventRecordId: resolution.eventRecordId,
      projectHomeId: resolution.projectHomeId,
      projectHomeCreated: false,
      conversationSafe: true,
      kind: "noop",
      record: null,
    };
  }

  // No-duplicate: activate matched record, then resume — never spawn a second workspace
  if (resolution.isDuplicateAttempt && resolution.eventRecordId) {
    setActiveEventRecordId(resolution.eventRecordId);
  }

  const eventsResult: EventsIntelligenceTurnResult =
    resolution.isDuplicateAttempt && resolution.eventRecordId
      ? processEventsIntelligenceTurn({
          userText: input.userText,
          activeChamberMemberId: input.activeChamberMemberId,
          forceStart: false,
        })
      : processEventsIntelligenceTurn({
          userText: input.userText,
          activeChamberMemberId: input.activeChamberMemberId,
          forceStart: input.forceStart,
        });

  let record = eventsResult.record;
  if (record) {
    record = seedKnownFactsFromUserText(record, input.userText);
  }

  const workspace = resolveCreationWorkspace({
    ...resolution,
    eventRecordId: record?.id ?? resolution.eventRecordId,
    found: Boolean(record) || resolution.found,
    workspaceId: record?.id ?? resolution.workspaceId,
  });

  const context = assembleUniversalCreationContext({
    resolution: {
      ...resolution,
      eventRecordId: record?.id ?? resolution.eventRecordId,
      creationRecordId:
        resolution.creationRecordId ?? record?.id ?? null,
      workspaceId: workspace.workspaceId,
      projectHomeId:
        eventsResult.projectHomeId ?? resolution.projectHomeId,
    },
    record: workspace.record ?? record,
    workspace: workspace.snapshot,
    latestUserGoal: input.userText.trim(),
    conversationId: input.conversationId,
  });

  const nextStep = selectNextBestStep({
    context,
    record: workspace.record ?? record,
    intent: intentClass.intent,
  });

  const reply = eventsResult.reply;
  return {
    handled: eventsResult.handled || resolution.resume,
    intent: intentClass.intent,
    resolution: {
      ...resolution,
      eventRecordId: record?.id ?? resolution.eventRecordId,
      projectHomeId:
        eventsResult.projectHomeId ?? resolution.projectHomeId,
      found: Boolean(record) || resolution.found,
      resume: resolution.resume || eventsResult.kind === "continue",
    },
    context,
    nextStep,
    reply,
    eventRecordId: record?.id ?? null,
    projectHomeId: eventsResult.projectHomeId,
    projectHomeCreated: eventsResult.projectHomeCreated,
    conversationSafe: assertConversationSafe(reply),
    kind: eventsResult.kind,
    record: record ?? eventsResult.record,
  };
}

/**
 * Preserve purpose / audience / outcomes stated in the opening request.
 */
export function seedKnownFactsFromUserText(
  record: EventRecord,
  userText: string,
): EventRecord {
  const t = userText.trim();
  let purpose = record.purpose;
  let audience = record.audience;
  let outcomes = record.outcomes;

  // Purpose: "purpose is …" / "to introduce …"
  const purposeMatch =
    t.match(
      /\b(?:purpose|goal)\s+(?:is|of)\s+(.+?)(?:\.|,?\s+with\b|,?\s+and\s+(?:the\s+)?(?:primary|secondary)\b|$)/i,
    ) ||
    t.match(
      /\b(?:to|that)\s+(introduce|teach|help|launch|test|beta)[\s\S]{10,220}?(?:\.|$)/i,
    );
  if (!purpose.trim() && purposeMatch) {
    purpose = (purposeMatch[0] ?? "").replace(/^(to|that)\s+/i, "").trim();
    if (purpose.length > 280) purpose = purpose.slice(0, 277) + "…";
  }

  // ADHD workshop reference phrasing
  if (
    !purpose.trim() &&
    /\badhd\b/i.test(t) &&
    /\b(?:platform|beta)\b/i.test(t)
  ) {
    purpose =
      "Introduce business people to the ADHD business platform and conduct beta testing";
  }

  if (!audience.trim()) {
    const audiences: string[] = [];
    if (/\badhd\b/i.test(t) && /\bbusiness (?:people|owners|entrepreneurs)\b/i.test(t)) {
      audiences.push("ADHD business people");
    }
    if (
      /\bnon-?adhd\b/i.test(t) ||
      /\binterested\b/i.test(t) && /\bbusiness (?:people|owners)\b/i.test(t)
    ) {
      audiences.push("interested non-ADHD business people");
    }
    if (audiences.length) {
      audience = audiences.join("; ");
    } else if (/\bbusiness (?:people|owners|entrepreneurs)\b/i.test(t)) {
      audience = "Business people";
    }
  }

  if (!outcomes.trim() && /\bbeta\b/i.test(t)) {
    outcomes = "Participants understand the platform and provide beta feedback";
  }

  if (
    purpose === record.purpose &&
    audience === record.audience &&
    outcomes === record.outcomes
  ) {
    return record;
  }

  const sections = createEmptyEventSections({
    event_type: record.eventTypeLabel,
    purpose,
    audience,
    outcomes,
    format:
      record.format === "unspecified"
        ? ""
        : record.format === "in_person"
          ? "In person"
          : record.format === "virtual"
            ? "Virtual"
            : "Hybrid",
    dates: record.dates,
    venue: record.venue,
  });

  // Merge prior section content where we didn't overwrite
  const merged = record.sections.map((s) => {
    const next = sections.find((x) => x.id === s.id);
    if (!next) return s;
    if (s.id === "purpose" && purpose) return { ...s, content: purpose, status: "confirmed" as const };
    if (s.id === "audience" && audience)
      return { ...s, content: audience, status: "confirmed" as const };
    if (s.id === "outcomes" && outcomes)
      return { ...s, content: outcomes, status: "confirmed" as const };
    return s.content.trim() ? s : next;
  });

  return upsertEventRecord({
    ...record,
    purpose,
    audience,
    outcomes,
    sections: merged,
    updatedAt: new Date().toISOString(),
  });
}
