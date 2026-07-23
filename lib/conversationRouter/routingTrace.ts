/**
 * Development-only routing trace — never member-facing.
 */

import type { RoutingTrace } from "./routingTypes";

const MAX_TRACES = 40;
const traces: RoutingTrace[] = [];

export function recordRoutingTrace(trace: RoutingTrace): void {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    return;
  }
  traces.push(trace);
  if (traces.length > MAX_TRACES) traces.shift();
  if (typeof console !== "undefined" && console.debug) {
    console.debug("[conversationRouter]", {
      intent: trace.selectedIntent,
      priority: trace.priorityApplied,
      target: trace.selectedTarget,
      continuity: trace.continuityAction,
      rejected: trace.rejectedOwners,
    });
  }
}

export function getRecentRoutingTraces(): readonly RoutingTrace[] {
  return traces;
}

export function clearRoutingTracesForTests(): void {
  traces.length = 0;
}

/** Copyable founder diagnostic — redacted of long message bodies. */
export function exportRoutingTraceForDiagnostics(
  trace: RoutingTrace,
): string {
  return JSON.stringify(
    {
      at: trace.at,
      inputPreview: trace.normalizedInput.slice(0, 120),
      selectedIntent: trace.selectedIntent,
      priorityApplied: trace.priorityApplied,
      selectedTarget: trace.selectedTarget,
      continuityAction: trace.continuityAction,
      rejectedOwners: trace.rejectedOwners,
      effects: trace.effects,
      clarificationReason: trace.clarificationReason,
    },
    null,
    2,
  );
}
