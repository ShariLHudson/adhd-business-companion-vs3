/**
 * 103 — Anywhere-Origin resolution sequence.
 * Every origin uses this path. No private Work minting outside UWE.
 */

import { ensureEventBlueprintsRegistered } from "../packages/eventPlan/registerEventBlueprints";
import { ensureEventPlanWorkTypeRegistered } from "../packages/eventPlan/registerEventPlanWorkType";
import { ensureMarketingPlanBlueprintsRegistered } from "../packages/marketingPlan/registerMarketingPlanBlueprints";
import { ensureMarketingPlanWorkTypeRegistered } from "../packages/marketingPlan/registerMarketingPlanWorkType";
import { initializeWorkFromBlueprint } from "../blueprints/initializeFromBlueprint";
import { getWorkBlueprintState, putWorkBlueprintState } from "../blueprints/workBlueprintStateStore";
import { getBlueprint } from "../blueprints/registry";
import { allocateCanonicalWorkId } from "../identity/allocateCanonicalWorkId";
import { linkWorkRelationship } from "../cartography/workRelationships";
import { getWorkIdentity } from "../identity/workIdentityStore";
import type { BlueprintDepthMode, CanonicalWorkId, WorkOrigin } from "../types";
import { assessDuplicateRisk } from "./duplicateRisk";
import { findRelatedWork } from "./findRelatedWork";
import { inferWorkTypeAndBlueprint } from "./inferWorkTypeAndBlueprint";
import { replyForDecision } from "./memberFacingCopy";
import type {
  AnywhereOriginAttachedRelationship,
  AnywhereOriginResolution,
  ResolveAnywhereOriginOptions,
  UniversalLaunchContract,
} from "./types";

function classifyIntentMode(
  contract: UniversalLaunchContract,
): UniversalLaunchContract["requestedMode"] {
  if (contract.requestedMode) return contract.requestedMode;
  if (contract.shariMode === "talk_only") return "talk_only";
  if (contract.origin === "body_doubling") return "body_doubling";

  const text = [contract.originalUserMessage, contract.userIntent]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!text.trim()) {
    if (contract.relatedWorkId) return "structured_work";
    return "support_only";
  }

  if (
    /\b(just\s+talk|talk\s+(it\s+)?through|think\s+(this\s+)?through|no\s+plan)\b/.test(
      text,
    )
  ) {
    return "talk_only";
  }

  if (
    (contract.origin === "research" || /\bresearch\b/.test(text)) &&
    /\bresearch\b/.test(text) &&
    !/\b(continue|resume)\b/.test(text)
  ) {
    return "research_only";
  }

  if (
    (contract.origin === "board" || /\breview\b/.test(text)) &&
    /\b(review|board)\b/.test(text) &&
    !/\b(continue|resume)\b/.test(text)
  ) {
    return "review_only";
  }

  if (
    /\b(plan|organize|create|build|blueprint|workshop|retreat|luncheon|signing|event)\b/.test(
      text,
    ) ||
    contract.candidateBlueprintId ||
    contract.candidateWorkTypeId
  ) {
    return "structured_work";
  }

  return "support_only";
}

function attachOriginRelationships(
  workId: CanonicalWorkId,
  contract: UniversalLaunchContract,
): AnywhereOriginAttachedRelationship[] {
  const attached: AnywhereOriginAttachedRelationship[] = [];

  const link = (
    kind: AnywhereOriginAttachedRelationship["kind"],
    targetType: string,
    targetId: string,
    note?: string,
  ) => {
    if (!targetId.trim()) return;
    if (
      targetType === "project" ||
      targetType === "cartography_node" ||
      targetType === "blueprint" ||
      targetType === "task" ||
      targetType === "research" ||
      targetType === "work"
    ) {
      linkWorkRelationship({
        fromWorkId: workId,
        toRef: {
          kind: targetType as
            | "project"
            | "cartography_node"
            | "blueprint"
            | "task"
            | "research"
            | "work",
          id: targetId,
        },
        relationship: kind,
        note: note ?? null,
      });
    }
    attached.push({ kind, targetType, targetId, note: note ?? null });
  };

  if (contract.projectId) {
    link("part_of", "project", contract.projectId, "Project connection");
  }
  if (contract.cartographyNodeId) {
    link(
      "visualizes",
      "cartography_node",
      contract.cartographyNodeId,
      "Cartography node",
    );
  }
  if (contract.candidateBlueprintId) {
    const bp =
      getBlueprint(contract.candidateBlueprintId)?.blueprintId ??
      contract.candidateBlueprintId;
    link("implements", "blueprint", bp, "Blueprint");
  }
  if (contract.taskId) {
    link("related_to", "task", contract.taskId, "Task provenance");
  }
  if (contract.researchRecordId) {
    link("informs", "research", contract.researchRecordId, "Research");
  }
  if (contract.relatedWorkId && contract.relatedWorkId !== workId) {
    link("related_to", "work", contract.relatedWorkId, "Connected work");
  }

  // Provenance in knownContext for Chamber / Board / CMM / Body Doubling / conversation
  const state = getWorkBlueprintState(workId);
  if (state) {
    const known = { ...state.knownContext };
    if (contract.chamberMemberId) {
      known.chamber_member_id = contract.chamberMemberId;
    }
    if (contract.boardReviewId) {
      known.board_review_id = contract.boardReviewId;
    }
    if (contract.clearMyMindThoughtId) {
      known.clear_my_mind_thought_id = contract.clearMyMindThoughtId;
    }
    if (contract.bodyDoublingSessionId) {
      known.body_doubling_session_id = contract.bodyDoublingSessionId;
    }
    if (contract.conversationId) {
      known.conversation_id = contract.conversationId;
    }
    if (contract.origin) {
      known.launch_origin = contract.origin;
    }
    putWorkBlueprintState({
      ...state,
      knownContext: { ...known, ...(contract.knownContext ?? {}) },
      updatedAt: new Date().toISOString(),
    });
  }

  return attached;
}

function createWorkFromContract(
  contract: UniversalLaunchContract,
  workTypeId: string,
  blueprintId: string | null,
  depthMode: BlueprintDepthMode,
): CanonicalWorkId {
  if (blueprintId && getBlueprint(blueprintId)) {
    const state = initializeWorkFromBlueprint({
      blueprintId,
      workTypeId,
      depthMode,
      origin: contract.origin as WorkOrigin,
      knownContext: {
        ...(contract.knownContext ?? {}),
        ...(contract.conversationId
          ? { conversation_id: contract.conversationId }
          : {}),
        ...(contract.clearMyMindThoughtId
          ? { clear_my_mind_thought_id: contract.clearMyMindThoughtId }
          : {}),
      },
    });
    return state.workId;
  }

  // Scratch path — identity only until a Blueprint is chosen
  return allocateCanonicalWorkId({
    origin: contract.origin,
    workTypeId,
  });
}

/**
 * Resolve a Universal Launch Contract through the single Anywhere-Origin sequence.
 */
export function resolveAnywhereOriginWork(
  contract: UniversalLaunchContract,
  options: ResolveAnywhereOriginOptions = {},
): AnywhereOriginResolution {
  ensureEventPlanWorkTypeRegistered();
  ensureEventBlueprintsRegistered();
  ensureMarketingPlanWorkTypeRegistered();
  ensureMarketingPlanBlueprintsRegistered();

  const mode = classifyIntentMode(contract);
  const talkOnly =
    mode === "talk_only" || contract.shariMode === "talk_only";

  // 1–2. Intent + Work Type / Blueprint
  const inferred = inferWorkTypeAndBlueprint(contract);
  const workTypeId = inferred.workTypeId;
  const blueprintId = inferred.blueprintId;
  const depthMode: BlueprintDepthMode =
    contract.requestedDepth ?? "guided_build";
  const blueprintTitle = blueprintId
    ? getBlueprint(blueprintId)?.title ?? null
    : null;

  // Conversation / support only — no Work mutation
  if (
    (talkOnly || (mode === "support_only" && !blueprintId && !workTypeId)) &&
    !contract.relatedWorkId &&
    mode !== "structured_work" &&
    mode !== "body_doubling"
  ) {
    return {
      decision: "conversation_support_only",
      workId: null,
      workTypeId,
      blueprintId,
      depthMode: null,
      sectionId: contract.sectionId ?? null,
      origin: contract.origin,
      preventedDuplicate: false,
      duplicateRisk: {
        riskLevel: "none",
        signals: [],
        candidateWorkId: null,
        candidateTitle: null,
      },
      attachedRelationships: [],
      talkOnly: true,
      awaitingApproval: false,
      reply: replyForDecision({
        decision: "conversation_support_only",
        duplicateRisk: {
          riskLevel: "none",
          signals: [],
          candidateWorkId: null,
          candidateTitle: null,
        },
        talkOnly: true,
      }),
      routingNote: `origin=${contract.origin}; mode=${mode}; talk/support only`,
      openUniversalInterface: false,
    };
  }

  const messageBlob = [contract.originalUserMessage, contract.userIntent]
    .filter(Boolean)
    .join(" ");
  const wantsAdvisoryAction =
    mode === "research_only" ||
    mode === "review_only" ||
    /\b(review|research|improve|ask the chamber|have the board|help improve)\b/i.test(
      messageBlob,
    );

  // Research / Board / Chamber advisory actions — no silent rewrite without approval
  if (
    wantsAdvisoryAction &&
    (contract.origin === "chamber" ||
      contract.origin === "board" ||
      contract.origin === "research" ||
      mode === "research_only" ||
      mode === "review_only") &&
    !contract.applyApproved &&
    !contract.forceNew
  ) {
    const related = findRelatedWork(contract, workTypeId, blueprintId);
    const duplicateRisk = assessDuplicateRisk({
      contract,
      related,
      nowMs: options.nowMs,
    });
    return {
      decision: "awaiting_approval",
      workId: duplicateRisk.candidateWorkId ?? contract.relatedWorkId ?? null,
      workTypeId,
      blueprintId,
      depthMode: null,
      sectionId: contract.sectionId ?? null,
      origin: contract.origin,
      preventedDuplicate: Boolean(duplicateRisk.candidateWorkId),
      duplicateRisk,
      attachedRelationships: [],
      talkOnly: false,
      awaitingApproval: true,
      reply: replyForDecision({
        decision: "awaiting_approval",
        duplicateRisk,
        awaitingApproval: true,
      }),
      routingNote: `origin=${contract.origin}; mode=${mode}; approval required before apply`,
      openUniversalInterface: Boolean(
        duplicateRisk.candidateWorkId || contract.relatedWorkId,
      ),
    };
  }

  // Shari work-on-this without approval
  if (
    contract.shariMode === "work_on_this" &&
    !contract.applyApproved &&
    contract.relatedWorkId
  ) {
    return {
      decision: "awaiting_approval",
      workId: contract.relatedWorkId as CanonicalWorkId,
      workTypeId,
      blueprintId,
      depthMode: getWorkBlueprintState(contract.relatedWorkId)?.depthMode ?? null,
      sectionId: contract.sectionId ?? null,
      origin: contract.origin,
      preventedDuplicate: true,
      duplicateRisk: {
        riskLevel: "likely",
        signals: ["hinted_work_id"],
        candidateWorkId: contract.relatedWorkId as CanonicalWorkId,
        candidateTitle: null,
      },
      attachedRelationships: [],
      talkOnly: false,
      awaitingApproval: true,
      reply: replyForDecision({
        decision: "awaiting_approval",
        duplicateRisk: {
          riskLevel: "likely",
          signals: ["hinted_work_id"],
          candidateWorkId: contract.relatedWorkId as CanonicalWorkId,
          candidateTitle: null,
        },
        awaitingApproval: true,
      }),
      routingNote: "shari work_on_this awaiting approval",
      openUniversalInterface: true,
    };
  }

  // Clear My Mind clustered multi-create guard
  if (
    contract.origin === "clear_my_mind" &&
    contract.confirmMultiCreate === false &&
    /\b(cluster|several|multiple|these thoughts)\b/i.test(
      contract.originalUserMessage ?? "",
    )
  ) {
    return {
      decision: "clarify",
      workId: null,
      workTypeId,
      blueprintId,
      depthMode: null,
      sectionId: null,
      origin: contract.origin,
      preventedDuplicate: true,
      duplicateRisk: {
        riskLevel: "possible",
        signals: [],
        candidateWorkId: null,
        candidateTitle: null,
      },
      attachedRelationships: [],
      talkOnly: false,
      awaitingApproval: false,
      reply: replyForDecision({
        decision: "clarify",
        duplicateRisk: {
          riskLevel: "possible",
          signals: [],
          candidateWorkId: null,
          candidateTitle: null,
        },
      }),
      routingNote: "cmm multi-create requires confirmation",
      openUniversalInterface: false,
    };
  }

  // 3–4. Related work + duplicate risk
  const related = findRelatedWork(contract, workTypeId, blueprintId);
  const duplicateRisk = assessDuplicateRisk({
    contract,
    related,
    nowMs: options.nowMs,
  });

  // 5–6. Decide continue / connect / create / clarify
  if (!contract.forceNew && duplicateRisk.riskLevel === "likely") {
    const workId = duplicateRisk.candidateWorkId!;
    const state = getWorkBlueprintState(workId);
    const attached = attachOriginRelationships(workId, contract);
    const connect =
      Boolean(contract.projectId || contract.cartographyNodeId) &&
      !duplicateRisk.signals.includes("hinted_work_id");

    const decision = connect ? "connect_existing" : "continue_existing";
    return {
      decision,
      workId,
      workTypeId: state?.workTypeId ?? workTypeId,
      blueprintId: state?.blueprintId ?? blueprintId,
      depthMode: state?.depthMode ?? depthMode,
      sectionId: contract.sectionId ?? null,
      origin: contract.origin,
      preventedDuplicate: true,
      duplicateRisk,
      attachedRelationships: attached,
      talkOnly: false,
      awaitingApproval: false,
      reply: replyForDecision({
        decision,
        duplicateRisk,
        blueprintTitle,
        projectTitle: contract.projectId ? "your Project" : null,
      }),
      routingNote: `origin=${contract.origin}; ${decision}; work=${workId}; legacyAlias=${inferred.fromLegacyAlias}`,
      openUniversalInterface: true,
    };
  }

  if (
    !contract.forceNew &&
    duplicateRisk.riskLevel === "possible" &&
    !contract.relatedWorkId &&
    mode === "structured_work"
  ) {
    return {
      decision: "clarify",
      workId: duplicateRisk.candidateWorkId,
      workTypeId,
      blueprintId,
      depthMode: null,
      sectionId: contract.sectionId ?? null,
      origin: contract.origin,
      preventedDuplicate: true,
      duplicateRisk,
      attachedRelationships: [],
      talkOnly: false,
      awaitingApproval: false,
      reply: replyForDecision({ decision: "clarify", duplicateRisk }),
      routingNote: `origin=${contract.origin}; clarify duplicate risk`,
      openUniversalInterface: false,
    };
  }

  // Continue when relatedWorkId explicitly provided
  if (contract.relatedWorkId && !contract.forceNew) {
    const workId = contract.relatedWorkId as CanonicalWorkId;
    if (getWorkIdentity(workId) || getWorkBlueprintState(workId)) {
      const state = getWorkBlueprintState(workId);
      const attached = attachOriginRelationships(workId, contract);
      return {
        decision: "continue_existing",
        workId,
        workTypeId: state?.workTypeId ?? workTypeId,
        blueprintId: state?.blueprintId ?? blueprintId,
        depthMode: state?.depthMode ?? depthMode,
        sectionId: contract.sectionId ?? null,
        origin: contract.origin,
        preventedDuplicate: true,
        duplicateRisk: {
          riskLevel: "likely",
          signals: ["hinted_work_id"],
          candidateWorkId: workId,
          candidateTitle: null,
        },
        attachedRelationships: attached,
        talkOnly: false,
        awaitingApproval: false,
        reply: replyForDecision({
          decision: "continue_existing",
          duplicateRisk: {
            riskLevel: "likely",
            signals: ["hinted_work_id"],
            candidateWorkId: workId,
            candidateTitle: null,
          },
        }),
        routingNote: `origin=${contract.origin}; continue hinted work=${workId}`,
        openUniversalInterface: true,
      };
    }
  }

  // 7–9. Create new Work through UWE
  if (!workTypeId && !blueprintId) {
    return {
      decision: "clarify",
      workId: null,
      workTypeId: null,
      blueprintId: null,
      depthMode: null,
      sectionId: null,
      origin: contract.origin,
      preventedDuplicate: false,
      duplicateRisk,
      attachedRelationships: [],
      talkOnly: false,
      awaitingApproval: false,
      reply:
        "I’m not quite sure what you’d like to build yet. An event, or something else?",
      routingNote: `origin=${contract.origin}; insufficient work type/blueprint`,
      openUniversalInterface: false,
    };
  }

  const resolvedWorkTypeId = workTypeId ?? "event_plan";
  const workId = createWorkFromContract(
    contract,
    resolvedWorkTypeId,
    blueprintId,
    depthMode,
  );
  const attached = attachOriginRelationships(workId, contract);

  return {
    decision: "create_new",
    workId,
    workTypeId: resolvedWorkTypeId,
    blueprintId,
    depthMode: getWorkBlueprintState(workId)?.depthMode ?? depthMode,
    sectionId: contract.sectionId ?? null,
    origin: contract.origin,
    preventedDuplicate: false,
    duplicateRisk,
    attachedRelationships: attached,
    talkOnly: false,
    awaitingApproval: false,
    reply: replyForDecision({
      decision: "create_new",
      duplicateRisk,
      blueprintTitle,
    }),
    routingNote: `origin=${contract.origin}; create work=${workId}; bp=${blueprintId}; legacyAlias=${inferred.fromLegacyAlias}`,
    openUniversalInterface: true,
  };
}
