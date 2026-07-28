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
  // EC-001: symbols must name live exports of the primary owner so the
  // contract can be enforced at runtime. `resolveEstateIntelligenceRoute` is
  // the real route function (previously mis-declared as `routeEstateIntelligence`,
  // which never existed as a symbol).
  primaryRouteSymbols: [
    "resolveEstateIntelligenceImmediateAction",
    "resolveEstateIntelligenceRoute",
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

/**
 * Thrown when the live routing wiring diverges from the P0-05 ownership
 * contract: a non-primary module claims ownership, or a declared primary
 * route symbol is not a live function.
 */
export class RoutingOwnershipViolation extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoutingOwnershipViolation";
  }
}

/**
 * EC-001 — runtime enforcement of the Routing Ownership Contract.
 *
 * The primary Estate Brain routing module calls this once at load to affirm
 * that (a) it is the declared primary owner of final Estate place choice, and
 * (b) every declared primary route symbol resolves to a live function.
 *
 * Throws {@link RoutingOwnershipViolation} on drift; a no-op on the happy path.
 * This turns the contract from passive documentation into an enforced check:
 * if a primary symbol is renamed/removed, or a non-primary module is wired as
 * the owner, dev/test fails loudly instead of the contract silently lying.
 */
export function assertRoutingOwnership(input: {
  ownerPath: string;
  liveSymbols: Record<string, unknown>;
}): void {
  const { ownerPath, liveSymbols } = input;

  if (!isPrimaryRoutingIntelligence(ownerPath)) {
    throw new RoutingOwnershipViolation(
      `Routing ownership violation: "${ownerPath}" (role=${routingOwnerRoleForPath(ownerPath)}) ` +
        `may not own final Estate place choice. Only ${ROUTING_OWNERSHIP_CONTRACT.primaryIntelligenceOwner} may.`,
    );
  }

  for (const symbol of ROUTING_OWNERSHIP_CONTRACT.primaryRouteSymbols) {
    if (typeof liveSymbols[symbol] !== "function") {
      throw new RoutingOwnershipViolation(
        `Routing ownership drift: declared primary symbol "${symbol}" is not a live function. ` +
          `The ownership contract has drifted from the code — restore the symbol or update the contract.`,
      );
    }
  }
}
