/**
 * Trust Sprint #1 — Phase A: persist route executions to ecosystem tracking.
 */

import { trackEcosystemEvent } from "./ecosystem/eventTrackingEngine";
import {
  setCompanionRouteLogSink,
  type RouteExecutionRecord,
} from "./companionRoutingExecutor";

let sinkInstalled = false;

export function installCompanionRouteLogging(): void {
  if (sinkInstalled) return;
  sinkInstalled = true;
  setCompanionRouteLogSink((record) => {
    if (typeof window === "undefined") return;
    trackEcosystemEvent({
      eventType: "companion.route_executed",
      feature: "companion",
      metadata: {
        routeId: record.routeId,
        source: record.source,
        section: record.section ?? null,
        governorPolicy: record.governorPolicy,
        dispatched: record.dispatched,
        ...record.metadata,
      },
    });
  });
}

export function resetCompanionRouteLoggingForTests(): void {
  sinkInstalled = false;
  setCompanionRouteLogSink(null);
}

export type { RouteExecutionRecord };
