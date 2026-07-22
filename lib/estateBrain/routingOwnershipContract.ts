/**
 * P0-05 — Routing Ownership Contract (BINDING)
 *
 * Production companion path:
 *   CompanionPageClient → resolveFrictionlessAction → Estate Brain
 *   (resolveEstateIntelligenceImmediateAction / routeEstateIntelligence)
 *
 * Parallel routers may adapt or match; they must not become a second
 * production owner for Estate place choice.
 *
 * @see docs/estate/ESTATE_BRAIN.md
 * @see docs/architecture-v2/SPARK_ESTATE_PRODUCTION_READINESS_AUDIT.md (P0-05)
 */

export const ROUTING_OWNERSHIP_CONTRACT = {
  version: "2026-07-22",
  /** Live orchestration hub called from CompanionPageClient before chat API. */
  companionOrchestrationHub: "lib/frictionlessActionLayer.ts",
  companionEntrySymbol: "resolveFrictionlessAction",
  /** Primary Estate capability / place intelligence owner. */
  primaryIntelligenceOwner: "lib/estateBrain/",
  primaryRouteSymbols: [
    "resolveEstateIntelligenceImmediateAction",
    "routeEstateIntelligence",
  ] as const,
  rule: "One production path: Frictionless → Estate Brain. Adapters may feed Brain or normalize actions; they must not independently own final place choice.",
} as const;

export const ROUTING_ADAPTER_OR_LEGACY_STACKS = [
  {
    path: "lib/estateIntelligence/",
    role: "phase-c-adapter",
    status: "adapter" as const,
    note: "Matcher/router adapter — invitations must not override goToPlace / Brain route.",
  },
  {
    path: "lib/estateCapabilityRegistry/",
    role: "catalog-adapter",
    status: "adapter" as const,
    note: "Secondary capability catalog consulted by Estate Brain; not a second router owner.",
  },
  {
    path: "lib/estateNavigationIntelligence/",
    role: "navigation-helper",
    status: "helper" as const,
    note: "Scenic / navigation helpers — gate behind Brain / frictionless policy.",
  },
] as const;

export type RoutingOwnerRole =
  | "orchestration-hub"
  | "primary-intelligence"
  | "adapter"
  | "helper"
  | null;

export function routingOwnerRoleForPath(path: string): RoutingOwnerRole {
  const p = path.replace(/\\/g, "/");
  if (p.includes("lib/frictionlessActionLayer")) return "orchestration-hub";
  if (p.includes("lib/estateBrain")) return "primary-intelligence";
  if (p.includes("lib/estateIntelligence")) return "adapter";
  if (p.includes("lib/estateCapabilityRegistry")) return "adapter";
  if (p.includes("lib/estateNavigationIntelligence")) return "helper";
  return null;
}

export function isPrimaryRoutingIntelligence(path: string): boolean {
  return routingOwnerRoleForPath(path) === "primary-intelligence";
}
