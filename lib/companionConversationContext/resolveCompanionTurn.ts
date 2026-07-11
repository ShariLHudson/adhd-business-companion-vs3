/**
 * Main companion turn resolver — ordered context gates before goal routing.
 */

import {
  detectCompanionActiveSession,
  isCompanionSessionLocked,
  isExplicitDirectionChange,
} from "@/lib/companionIntelligence/activeSession";
import { loadConversationSession } from "@/lib/conversationSession";
import { getEstateLocationById } from "@/lib/estateKnowledgeBase/estateLocations";
import type { FrictionlessActionDecision } from "@/lib/frictionlessActionLayer";
import type { IntentRoutingDecision } from "@/lib/intentRoutingIntelligence";
import {
  namedLocationFamilyFromQuery,
  isLocationHereQuery,
} from "./detectLocationHereQuery";
import {
  formatLocationAreasReply,
  formatLocationHereReply,
  locationFamilyPrefix,
  resolveParentLocationId,
} from "./locationAreas";
import {
  detectEmotionalPivot,
  formatEmotionalPivotReply,
} from "./detectEmotionalPivot";
import {
  detectCompoundOverwhelmTask,
  formatCompoundOverwhelmTaskReply,
} from "./detectCompoundIntent";
import { resolveActiveCompanionPending } from "./companionPending";
import { resolveObjectNavigationTarget } from "./objectNavigation";
import {
  isCompanionConversationContextEnabled,
  readCompanionConversationState,
} from "./store";
import { buildCompanionTurnTrace, logCompanionTurnTrace } from "./trace";
import type { CompanionConversationState, CompanionTurnTrace } from "./types";

export type CompanionTurnInput = {
  userText: string;
  lastAssistantText?: string | null;
  currentTurn?: number;
  currentRoom?: string | null;
  activeWorkflow?: string | null;
  workspace?: string | null;
  overwhelmed?: boolean;
};

export type CompanionTurnResolution = {
  handled: boolean;
  decision: FrictionlessActionDecision | null;
  trace: CompanionTurnTrace;
  statePatch?: Partial<CompanionConversationState>;
};

const CONTEXT_HINT =
  "One companion voice. Never mention routing, settings, reminders, feature menus, sidebars, or navigation chrome unless the member asked. Conversation first.";

function baseDecision(
  routing: IntentRoutingDecision | null,
  partial: Partial<FrictionlessActionDecision>,
): FrictionlessActionDecision {
  return {
    category: "none",
    suppressRelationship: false,
    suppressRecap: true,
    suppressReflectionFirst: true,
    responseHint: null,
    localReply: null,
    pendingAction: null,
    toolSuggestion: null,
    workspaceOffer: null,
    intentRouting: routing,
    ...partial,
  };
}

function resolveEffectiveLocationId(
  userText: string,
  state: CompanionConversationState,
  inputRoom?: string | null,
): string | null {
  const namedFamily = namedLocationFamilyFromQuery(userText);
  if (namedFamily === "house-possibility") {
    return "house-possibility-outside";
  }

  const spineRoom = loadConversationSession()?.currentRoom;
  const room =
    inputRoom ??
    state.currentLocation?.locationId ??
    spineRoom ??
    null;
  if (!room) return null;

  if (isLocationHereQuery(userText)) {
    return resolveParentLocationId(room);
  }

  const family = locationFamilyPrefix(room);
  if (family && namedFamily === family) {
    return resolveParentLocationId(room);
  }

  return room;
}

export function resolveCompanionTurn(
  input: CompanionTurnInput,
  routing: IntentRoutingDecision | null = null,
): CompanionTurnResolution {
  const userText = input.userText.trim();
  const currentTurn = input.currentTurn ?? 0;
  const state = readCompanionConversationState();

  const activeSession = detectCompanionActiveSession({
    userText,
    lastAssistantText: input.lastAssistantText,
    activeWorkflow: input.activeWorkflow,
    workspace: input.workspace,
  });

  const trace = buildCompanionTurnTrace({
    userMessage: userText,
    activeSession,
    currentLocation: state.currentLocation?.locationId ?? input.currentRoom ?? null,
    pendingAction: state.pendingAction?.type ?? null,
    lastDiscussedEntity: state.lastDiscussedEntity?.id ?? null,
    emotionalPivotDetected: false,
    finalResponseReason: "pipeline_continue",
  });

  if (!isCompanionConversationContextEnabled() || !userText) {
    return { handled: false, decision: null, trace };
  }

  const directionChange = isExplicitDirectionChange(userText, activeSession);
  const sessionLocked = isCompanionSessionLocked(activeSession, directionChange);

  // 1 — Active session: stay unless explicit direction change (defer to existing session flows)
  if (sessionLocked && activeSession !== "none") {
    trace.finalResponseReason = `active_session:${activeSession}`;
    trace.blockedCapabilities = ["discovery", "navigation", "room", "help"];
    logCompanionTurnTrace(trace);
    return { handled: false, decision: null, trace };
  }

  // 2 — Pending action on affirmative reply
  const pending = resolveActiveCompanionPending({
    userText,
    lastAssistantText: input.lastAssistantText,
    state,
    currentTurn,
  });
  if (pending?.type === "estate_navigate" && pending.placeId) {
    const location = pending.locationId
      ? getEstateLocationById(pending.locationId)
      : null;
    const display =
      location?.officialDisplayName?.replace(/\u2122/g, "") ?? "there";
    trace.pendingAction = pending.type;
    trace.finalResponseReason = "pending_estate_navigate";
    trace.winningCapability = "navigation";
    logCompanionTurnTrace(trace);

    return {
      handled: true,
      decision: baseDecision(routing, {
        category: "direct_action",
        suppressRelationship: true,
        localReply: `Taking you to ${display}.`,
        responseHint: `${CONTEXT_HINT}\nPENDING ACTION: Member confirmed your offer — navigate now. Do not open Create or Research.`,
        immediateEstatePlaceNavigate: {
          placeId: pending.placeId,
          navigationLine: `Taking you to ${display}.`,
          userText,
        },
      }),
      statePatch: {
        pendingAction: null,
        currentLocation: pending.locationId
          ? {
              locationId: pending.locationId,
              placeId: pending.placeId,
              displayName: display,
            }
          : state.currentLocation,
      },
      trace,
    };
  }

  // 3 — Current Estate location ("what is here?", sub-areas)
  if (isLocationHereQuery(userText)) {
    const locationId = resolveEffectiveLocationId(
      userText,
      state,
      input.currentRoom,
    );
    if (locationId) {
      const reply =
        /\bwhat is here|what'?s here\b/i.test(userText)
          ? formatLocationHereReply(locationId)
          : formatLocationAreasReply(locationId);
      if (reply) {
        trace.currentLocation = locationId;
        trace.finalResponseReason = "estate_location_context";
        trace.winningCapability = "room";
        trace.blockedCapabilities = ["help", "retrieval"];
        logCompanionTurnTrace(trace);

        return {
          handled: true,
          decision: baseDecision(routing, {
            category: "estate_guide",
            suppressRelationship: false,
            localReply: reply,
            responseHint: `${CONTEXT_HINT}\nESTATE CONTEXT: Answer from current location Knowledge Base only. No settings, reminders, or unrelated features.`,
          }),
          trace,
        };
      }
    }
  }

  // 4 — Conversational pivot after factual KB
  const pivot = detectEmotionalPivot({ userText, state, currentTurn });
  if (pivot) {
    trace.emotionalPivotDetected = true;
    trace.finalResponseReason = `emotional_pivot:${pivot.signal}`;
    trace.winningCapability = "room";
    trace.blockedCapabilities = ["object", "room", "help"];
    logCompanionTurnTrace(trace);

    return {
      handled: true,
      decision: baseDecision(routing, {
        category: "none",
        suppressRelationship: false,
        suppressReflectionFirst: false,
        localReply: formatEmotionalPivotReply(pivot),
        responseHint: `${CONTEXT_HINT}\nCONVERSATIONAL PIVOT: Member responded to prior KB answer with feeling — do NOT repeat biography or object facts.`,
      }),
      statePatch: { emotionalPivotDetected: true },
      trace,
    };
  }

  // 5 — Object-to-location navigation (take me to the telescope → Possibility House)
  const objectNav = resolveObjectNavigationTarget(
    userText,
    state.currentLocation?.locationId ?? input.currentRoom,
  );
  if (objectNav) {
    trace.finalResponseReason = "object_to_location_navigate";
    trace.winningCapability = "navigation";
    logCompanionTurnTrace(trace);

    const line = objectNav.objectName
      ? `The ${objectNav.objectName} is in ${objectNav.displayName}. I'll take you there.`
      : `Taking you to ${objectNav.displayName}.`;

    return {
      handled: true,
      decision: baseDecision(routing, {
        category: "direct_action",
        suppressRelationship: true,
        localReply: line,
        responseHint: `${CONTEXT_HINT}\nOBJECT NAVIGATION: Member named an Estate object with a go-there verb — navigate to parent location.`,
        immediateEstatePlaceNavigate: {
          placeId: objectNav.placeId,
          navigationLine: line,
          userText,
        },
      }),
      statePatch: {
        currentLocation: {
          locationId: objectNav.locationId,
          placeId: objectNav.placeId,
          displayName: objectNav.displayName,
        },
      },
      trace,
    };
  }

  // 6 — Compound overwhelm + task (before generic goal routing)
  if (detectCompoundOverwhelmTask(userText)) {
    trace.finalResponseReason = "compound_overwhelm_task";
    trace.detectedPrimaryGoal = "decision_support";
    trace.winningCapability = "capture";
    logCompanionTurnTrace(trace);

    return {
      handled: true,
      decision: baseDecision(routing, {
        category: "none",
        suppressRelationship: false,
        localReply: formatCompoundOverwhelmTaskReply(),
        responseHint: `${CONTEXT_HINT}\nCOMPOUND INTENT: Acknowledge both overwhelm and task. One choice only — Clear My Mind or proposal. Max 2 options.`,
      }),
      trace,
    };
  }

  logCompanionTurnTrace(trace);
  return { handled: false, decision: null, trace };
}
