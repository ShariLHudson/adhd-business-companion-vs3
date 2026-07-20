/**
 * 061 — Derive universal creation state from an Event Record.
 * Events keep domain phases; the universal machine is the shared lifecycle.
 */

import type { EventRecord } from "@/lib/eventsIntelligence/types";
import { nextLikelyUniversalState } from "./transitions";
import {
  UNIVERSAL_CREATION_STATE_LABEL,
  type StateTransitionReason,
  type UniversalCreationState,
  type UniversalCreationStateSnapshot,
} from "./types";

function filled(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

/** Local copy of 059 minimum foundation — avoid circular imports. */
function hasEventMinimumFoundation(record: EventRecord): boolean {
  return (
    Boolean(record.eventType) &&
    filled(record.purpose) &&
    filled(record.audience) &&
    filled(record.outcomes)
  );
}

function sectionFilled(record: EventRecord, id: string): boolean {
  return Boolean(record.sections.find((s) => s.id === id)?.content.trim());
}

function confirmedAssetCount(record: EventRecord): number {
  return record.sections.filter(
    (s) => s.status === "confirmed" || (s.content.trim() && s.status === "drafting"),
  ).length;
}

/**
 * Resolve universal lifecycle state from Event Record signals.
 */
export function resolveUniversalCreationStateFromEvent(
  record: EventRecord | null | undefined,
): UniversalCreationState {
  if (!record) return "idea";

  if (
    record.runtimeState === "CANCELED" ||
    record.runtimeState === "COMPLETED"
  ) {
    if (record.runtimeState === "CANCELED") return "archive";
    if (record.lifecyclePhase === "debrief_reuse") return "reuse";
    if (record.lifecyclePhase === "follow_up") return "growth";
    return "completed";
  }

  if (
    record.runtimeState === "LIVE" ||
    record.runtimeState === "REHEARSAL" ||
    record.lifecyclePhase === "delivery"
  ) {
    return "executing";
  }

  if (
    record.runtimeState === "READY" ||
    record.runtimeState === "REGISTRATION_OPEN"
  ) {
    return "ready";
  }

  if (!hasEventMinimumFoundation(record)) {
    const hasAnyIntent =
      Boolean(record.purpose.trim()) ||
      Boolean(record.audience.trim()) ||
      Boolean(record.outcomes.trim()) ||
      Boolean(record.conversationContext.trim());
    return hasAnyIntent ? "discovery" : "idea";
  }

  // Foundation just established — before substantive planning assets
  const agendaFilled = sectionFilled(record, "agenda");
  if (!agendaFilled && confirmedAssetCount(record) <= 4) {
    // Still in foundation window until planning assets appear
    if (
      record.lifecyclePhase === "discovery" ||
      record.lifecyclePhase === "viability"
    ) {
      return "foundation";
    }
  }

  if (!agendaFilled) return "planning";

  // Agenda exists — building connected assets
  const buildingSignals =
    sectionFilled(record, "run_of_show") ||
    sectionFilled(record, "marketing") ||
    sectionFilled(record, "registration") ||
    confirmedAssetCount(record) >= 8;

  if (
    record.lifecyclePhase === "preparation" ||
    record.runtimeState === "PREPARATION" ||
    record.runtimeState === "BOOKING" ||
    record.runtimeState === "PROMOTION"
  ) {
    return buildingSignals ? "building" : "review";
  }

  if (buildingSignals) return "building";

  // Has agenda, light progress — still planning/building edge
  if (record.lifecyclePhase === "experience_design") return "building";
  if (record.lifecyclePhase === "planning") return "planning";

  return "planning";
}

export function buildUniversalCreationStateSnapshot(
  record: EventRecord | null | undefined,
  options?: {
    previousState?: UniversalCreationState | null;
    paused?: boolean;
    reason?: StateTransitionReason;
  },
): UniversalCreationStateSnapshot {
  const state = resolveUniversalCreationStateFromEvent(record);
  const previous = options?.previousState ?? null;
  const next = nextLikelyUniversalState(state);

  let blocked = false;
  let blockReason: string | null = null;
  if (state === "discovery" && record && !hasEventMinimumFoundation(record)) {
    blocked = false; // discovery is active work, not blocked
  }
  if (state === "review") {
    blocked = true;
    blockReason = "Resolve open gaps before marking ready.";
  }

  return {
    state,
    label: UNIVERSAL_CREATION_STATE_LABEL[state],
    previousState: previous && previous !== state ? previous : null,
    nextLikelyState: next,
    blocked,
    blockReason,
    transitionReason: options?.reason ?? "derived",
    recommendationProfile: state,
    paused: Boolean(options?.paused),
  };
}

/** Map universal state → closest Event lifecycle phase for sync. */
export function eventLifecyclePhaseForUniversalState(
  state: UniversalCreationState,
): EventRecord["lifecyclePhase"] {
  switch (state) {
    case "idea":
    case "discovery":
      return "discovery";
    case "foundation":
      return "viability";
    case "planning":
      return "planning";
    case "building":
      return "experience_design";
    case "review":
      return "preparation";
    case "ready":
      return "preparation";
    case "executing":
      return "delivery";
    case "completed":
      return "follow_up";
    case "growth":
      return "follow_up";
    case "archive":
    case "reuse":
      return "debrief_reuse";
    default:
      return "discovery";
  }
}
