/**
 * Spark Core Intelligence v1.0 — Trust & Performance Engine types.
 * @see spark-intelligence-foundation/17-spark-core-trust-performance-engine.md
 */

import type { EstateRoomId } from "@/lib/sparkResponseIntelligence/types";

export const SPARK_CORE_TRUST_PERFORMANCE_VERSION = "1.0" as const;

/** Core Four — nothing else matters if these fail. */
export type CoreFour = {
  correctness: boolean;
  speed: boolean;
  trust: boolean;
  focus: boolean;
};

export type CacheDomain =
  | "definitions"
  | "frameworks"
  | "business_concepts"
  | "user_profile"
  | "business_profile"
  | "communication_preferences"
  | "current_projects"
  | "brand_voice"
  | "recent_context"
  | "templates";

export type LatencyBudget = {
  intentDetectionMaxMs: 100;
  firstVisibleMaxMs: 750;
  totalResponseMaxMs: number;
  streamRequired: boolean;
  backgroundAllowed: boolean;
};

export type StreamingPlan = {
  enabled: boolean;
  immediateAck: boolean;
  progressMessage?: string;
  streamTokens: boolean;
};

export type BackgroundJob = {
  id: string;
  kind: "research" | "preload" | "cache_refresh";
  description: string;
};

export type ServiceHealth = {
  service: string;
  healthy: boolean;
  lastCheckMs: number;
  latencyMs?: number;
};

export type PerformanceTelemetry = {
  turnId: string;
  intentDetectionMs: number;
  cacheHits: string[];
  cacheMisses: string[];
  slowModules: string[];
  totalBudgetMs: number;
  degraded: boolean;
  retried: boolean;
};

export type CoreTrustInput = {
  turnId: string;
  threadId: string;
  memberMessage: string;
  activeRoom?: EstateRoomId;
};

export type CoreTrustIngress = {
  intentLabel: string;
  complexityLevel: 1 | 2 | 3 | 4 | 5;
  latencyBudget: LatencyBudget;
  modulesActive: string[];
  disciplinesActive: string[];
  goldenRulePassed: boolean;
  cacheSnapshot: Partial<Record<CacheDomain, boolean>>;
  warmLoadRooms: EstateRoomId[];
};

export type FallbackResponse = {
  text: string;
  reason: string;
  partial: boolean;
};

export type CoreTrustDelivery = {
  streaming: StreamingPlan;
  backgroundJobs: BackgroundJob[];
  fallback?: FallbackResponse;
  degradedMode: boolean;
  retryCount: number;
  health: ServiceHealth[];
};

export type CoreTrustEgress = {
  coreFour: CoreFour;
  approved: boolean;
  revisionHints: string[];
  telemetry: PerformanceTelemetry;
};

export type CoreTrustResult = {
  ingress: CoreTrustIngress;
  delivery: CoreTrustDelivery;
  egress?: CoreTrustEgress;
  readyToCompose: boolean;
};
