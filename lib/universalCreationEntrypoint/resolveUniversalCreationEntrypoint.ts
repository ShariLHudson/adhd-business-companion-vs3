/**
 * 055 — Universal Creation Entrypoint
 * Many entry points → Intent → Existing work → One Creation Workspace.
 *
 * Resume-by-default for ambiguous entry.
 * Explicit forceNew / force-new chat intent overrides duplicate protection
 * and opens a brand-new Workspace ID.
 */

import { buildCreationConversationContext, resolveLargerCreation } from "@/lib/creationEcosystem";
import { openConnectedAssetEditor } from "@/lib/connectedAssetEditor";
import {
  getEventRecord,
  setActiveEventRecordId,
} from "@/lib/eventsIntelligence/eventRecordStore";
import type { EventSectionId } from "@/lib/eventsIntelligence/types";
import { resolvePlatformIntentRoute } from "@/lib/platformIntent";
import {
  processUniversalCreationTurn,
  resolveUniversalCreationIntent,
} from "@/lib/universalCreationEngine";
import {
  assessEntrypointConfidence,
  clarifyingQuestionForMedium,
} from "./entryConfidence";
import {
  detectAssetEntryHint,
  searchExistingCreationWork,
} from "./existingWorkSearch";
import {
  forceNewCreationAcknowledgment,
  isForceNewCreationRequest,
} from "./forceNewIntent";
import type {
  ResolveEntrypointInput,
  UniversalCreationEntrypointResult,
} from "./types";

/**
 * Resolve any platform entry into one canonical Creation Workspace action.
 */
export function resolveUniversalCreationEntrypoint(
  input: ResolveEntrypointInput,
): UniversalCreationEntrypointResult {
  const text = input.userText.trim();
  const forceNew =
    Boolean(input.forceNew) || isForceNewCreationRequest(text);
  const { confidence, reason: confidenceReason } =
    assessEntrypointConfidence(text);
  const assetHint = detectAssetEntryHint(text);
  const assetTypeId =
    input.hintedAssetTypeId ?? assetHint.assetTypeId ?? null;
  const sectionId = (input.hintedSectionId ??
    (assetHint.sectionHint as EventSectionId | null) ??
    null) as EventSectionId | null;

  const existing = forceNew
    ? null
    : searchExistingCreationWork({
        userText: text,
        creationId: input.hintedCreationId,
        eventRecordId: input.hintedEventRecordId,
        assetTypeId,
      });

  const platform = resolvePlatformIntentRoute({
    userText: text,
    activeChamberMemberId: input.activeChamberMemberId as never,
    hasActiveCreation: Boolean(existing) && !forceNew,
  });

  const intentClass = resolveUniversalCreationIntent(text);

  // Low confidence / knowledge — never open workspace
  // Explicit force-new always proceeds (member asked for a separate creation).
  if (
    !forceNew &&
    (confidence === "low" ||
      platform.action === "stay_conversation" ||
      intentClass.intent === "know")
  ) {
    return baseResult(input, {
      confidence,
      action: "stay_conversation",
      existingWork: existing,
      blueprint: platform.blueprint,
      routingNote: `055 stay — ${confidenceReason}`,
      reply: "",
    });
  }

  // Board never owns — if advice leads to create, attach to existing
  if (input.entrySource === "board" && !existing && !forceNew && confidence !== "high") {
    return baseResult(input, {
      confidence,
      action: "stay_conversation",
      existingWork: null,
      blueprint: platform.blueprint,
      routingNote: "055 board advice — no new workspace without existing creation",
      reply: "",
    });
  }

  // Medium soft create without existing work — one clarifying question.
  // Ask and wait — never open a workspace or self-answer in the same turn.
  if (
    confidence === "medium" &&
    !existing &&
    !forceNew &&
    (input.entrySource === "shari" || input.entrySource === "conversation")
  ) {
    const question = clarifyingQuestionForMedium(text);
    return baseResult(input, {
      confidence,
      action: "clarify",
      existingWork: null,
      blueprint: platform.blueprint,
      clarifyingQuestion: question,
      routingNote: `055 clarify — ${confidenceReason}`,
      reply: question,
    });
  }

  // Activate existing event before engine so resume wins — never on force-new
  if (existing?.eventRecordId && !forceNew) {
    setActiveEventRecordId(existing.eventRecordId);
  }

  // Asset-first entry (workbook, landing page, etc.)
  if (assetTypeId && (existing || forceNew || confidence === "high")) {
    const engineResult = processUniversalCreationTurn({
      userText: text,
      activeChamberMemberId: input.activeChamberMemberId,
      conversationId: input.conversationId,
      forceStart: forceNew,
    });

    const eventId = forceNew
      ? engineResult.eventRecordId
      : engineResult.eventRecordId ?? existing?.eventRecordId ?? null;
    if (eventId) setActiveEventRecordId(eventId);

    const editorSession = openConnectedAssetEditor({
      assetTypeId,
      eventRecordId: eventId,
      sectionId,
      conversationGoal: text,
    });

    const creationId =
      engineResult.context?.creationRecordId ??
      (forceNew ? eventId : existing?.creationRecordId ?? eventId);

    const ctx = forceNew
      ? { contextPreserved: false, doNotReask: [] as string[] }
      : preserveContext(creationId, eventId);

    return {
      entrySource: input.entrySource,
      confidence,
      action: "open_asset",
      creationRecordId: creationId,
      workspaceId: eventId ?? (forceNew ? null : existing?.workspaceId ?? null),
      eventRecordId: eventId,
      projectHomeId:
        engineResult.projectHomeId ??
        (forceNew ? null : existing?.projectHomeId ?? null),
      blueprint: engineResult.resolution.blueprint ?? platform.blueprint,
      sectionId: sectionId ?? editorSession?.connections.sectionId ?? null,
      assetTypeId,
      existingWork: forceNew ? null : existing,
      preventedDuplicate: forceNew
        ? false
        : Boolean(existing) || engineResult.resolution.isDuplicateAttempt,
      clarifyingQuestion: null,
      contextPreserved: ctx.contextPreserved,
      doNotReask: ctx.doNotReask,
      engineResult,
      editorSession,
      routingNote: forceNew
        ? `055 force-new asset via ${input.entrySource} → ${assetTypeId}`
        : `055 asset entry via ${input.entrySource} → ${assetTypeId}`,
      reply: forceNew
        ? forceNewCreationAcknowledgment()
        : engineResult.reply,
    };
  }

  // Dashboard / notification / projects / create — resume or open workspace
  // forceNew always wins over preferResume / existing work.
  const preferResume =
    !forceNew &&
    (Boolean(existing) ||
      input.entrySource === "dashboard" ||
      input.entrySource === "home" ||
      input.entrySource === "notification" ||
      input.entrySource === "projects" ||
      input.entrySource === "conversation" ||
      input.entrySource === "cartography" ||
      input.entrySource === "search" ||
      input.entrySource === "related_work");

  const engineUserText = forceNew
    ? text || "Start something new — a separate workspace"
    : text || resumePromptForSource(input.entrySource, existing?.title);

  const engineResult = processUniversalCreationTurn({
    userText: engineUserText,
    activeChamberMemberId: input.activeChamberMemberId,
    conversationId: input.conversationId,
    forceStart: forceNew,
  });

  const eventId = forceNew
    ? engineResult.eventRecordId
    : engineResult.eventRecordId ?? existing?.eventRecordId ?? null;
  const creationId = forceNew
    ? engineResult.context?.creationRecordId ?? eventId
    : engineResult.context?.creationRecordId ??
      existing?.creationRecordId ??
      eventId;
  const ctx = forceNew
    ? { contextPreserved: false, doNotReask: [] as string[] }
    : preserveContext(creationId, eventId);

  const resumed =
    !forceNew &&
    (preferResume ||
      engineResult.resolution.resume ||
      engineResult.resolution.isDuplicateAttempt ||
      Boolean(existing));

  return {
    entrySource: input.entrySource,
    confidence,
    action: forceNew
      ? "open_workspace"
      : resumed
        ? sectionId
          ? "open_section"
          : "resume_workspace"
        : "open_workspace",
    creationRecordId: creationId,
    workspaceId: eventId ?? (forceNew ? null : existing?.workspaceId ?? null),
    eventRecordId: eventId,
    projectHomeId:
      engineResult.projectHomeId ??
      (forceNew ? null : existing?.projectHomeId ?? null),
    blueprint: engineResult.resolution.blueprint ?? platform.blueprint,
    sectionId: forceNew ? null : sectionId,
    assetTypeId: null,
    existingWork: forceNew ? null : existing,
    preventedDuplicate: forceNew
      ? false
      : Boolean(existing) || engineResult.resolution.isDuplicateAttempt,
    clarifyingQuestion: null,
    contextPreserved: ctx.contextPreserved,
    doNotReask: ctx.doNotReask,
    engineResult,
    editorSession: null,
    routingNote: forceNew
      ? `055 ${input.entrySource} → force-new open (${confidenceReason})`
      : `055 ${input.entrySource} → ${resumed ? "resume" : "open"} (${confidenceReason})`,
    reply: forceNew
      ? forceNewCreationAcknowledgment()
      : engineResult.reply,
  };
}

function preserveContext(
  creationId: string | null,
  eventRecordId: string | null,
): { contextPreserved: boolean; doNotReask: string[] } {
  if (!creationId && !eventRecordId) {
    return { contextPreserved: false, doNotReask: [] };
  }
  const creation = resolveLargerCreation({
    creationId,
    eventRecordId,
    preferActiveEvent: true,
  });
  if (!creation) return { contextPreserved: false, doNotReask: [] };
  const conv = buildCreationConversationContext(creation);
  return {
    contextPreserved: conv.doNotReask.length > 0 || Boolean(conv.purpose),
    doNotReask: conv.doNotReask,
  };
}

function resumePromptForSource(
  source: ResolveEntrypointInput["entrySource"],
  title?: string,
): string {
  if (source === "dashboard" || source === "home") {
    return title
      ? `Continue planning ${title}`
      : "Continue where we left off with my event plan";
  }
  if (source === "notification") {
    return title
      ? `Continue ${title}`
      : "Continue my event — open the current section";
  }
  if (source === "projects") {
    return title
      ? `Open the creation workspace for ${title}`
      : "Open my event creation workspace from Projects";
  }
  return "Continue my creation workspace";
}

function baseResult(
  input: ResolveEntrypointInput,
  partial: Partial<UniversalCreationEntrypointResult> & {
    confidence: UniversalCreationEntrypointResult["confidence"];
    action: UniversalCreationEntrypointResult["action"];
    routingNote: string;
  },
): UniversalCreationEntrypointResult {
  return {
    entrySource: input.entrySource,
    confidence: partial.confidence,
    action: partial.action,
    creationRecordId: partial.existingWork?.creationRecordId ?? null,
    workspaceId: partial.existingWork?.workspaceId ?? null,
    eventRecordId: partial.existingWork?.eventRecordId ?? null,
    projectHomeId: partial.existingWork?.projectHomeId ?? null,
    blueprint: partial.blueprint ?? null,
    sectionId: null,
    assetTypeId: null,
    existingWork: partial.existingWork ?? null,
    preventedDuplicate: false,
    clarifyingQuestion: partial.clarifyingQuestion ?? null,
    contextPreserved: false,
    doNotReask: [],
    engineResult: null,
    editorSession: null,
    routingNote: partial.routingNote,
    reply: partial.reply ?? partial.clarifyingQuestion ?? "",
  };
}
