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

export type RoutingOwnerRole =
  | "orchestration-hub"
  | "primary-intelligence"
  | "adapter"
  | "helper"
  | "execution-primitive"
  | null;

export type RoutingSurfaceRole = Exclude<RoutingOwnerRole, null>;

export type RoutingSurface = {
  /** Path fragment identifying the module (or file) that owns this surface. */
  path: string;
  /** Optional live symbol name for the surface's entry point. */
  symbol?: string;
  role: RoutingSurfaceRole;
  note: string;
};

/**
 * EC-002.1 — the single source of truth for routing-surface roles. Every
 * routing-related module named in the Estate Convergence backlog (EC-002) gets
 * one explicit, machine-checkable role:
 *   - `orchestration-hub`   calls the primary owner; not a decider itself.
 *   - `primary-intelligence` the ONLY surface that may own final place choice.
 *   - `adapter`             feeds / normalizes for the Brain; never owns.
 *   - `helper`              scenic / navigation refinement; never owns.
 *   - `execution-primitive` performs an already-decided navigation; never decides.
 * This is the contract's own enumeration — not a second router or a parallel
 * authority. Extend it by adding a row here; the derived views below read from it.
 */
export const ROUTING_SURFACES: readonly RoutingSurface[] = [
  {
    path: "lib/frictionlessActionLayer.ts",
    symbol: "resolveFrictionlessAction",
    role: "orchestration-hub",
    note: "Live companion hub called from CompanionPageClient; delegates place/capability choice to Estate Brain.",
  },
  {
    path: "lib/estateBrain/",
    symbol: "resolveEstateIntelligenceImmediateAction",
    role: "primary-intelligence",
    note: "Primary Estate place/capability intelligence owner — the only surface that may own final place choice.",
  },
  {
    path: "lib/estateIntelligence/",
    role: "adapter",
    note: "Matcher / command router adapter — must not override goToPlace / Brain route.",
  },
  {
    path: "lib/estateCapabilityRegistry/",
    role: "adapter",
    note: "Capability catalog consulted by Estate Brain (consultBestCapability); not a second router owner.",
  },
  {
    path: "lib/intentRoutingIntelligence.ts",
    role: "adapter",
    note: "Phase-C intent routing decision layer — must not override exact canonical place navigation.",
  },
  {
    path: "lib/estateNavigationIntelligence/",
    role: "helper",
    note: "Scenic / navigation disambiguation helper — gate behind Brain / frictionless policy.",
  },
  {
    path: "lib/estateExperiences/resolveEstateNavigation.ts",
    role: "helper",
    note: "Navigation disambiguation / discovery helper feeding the hub; not an independent owner.",
  },
  {
    path: "lib/estate/goToPlace.ts",
    symbol: "goToPlace",
    role: "execution-primitive",
    note: "Approved shell navigation primitive — executes a decided place, does not decide intent.",
  },
  {
    path: "app/companion/CompanionPageClient.tsx",
    symbol: "runDirectEstateRoomNavigation",
    role: "execution-primitive",
    note: "Shell execution of an already-decided EstateCommandDecision; not a decider.",
  },
];

/**
 * Backward-compatible view: adapters and helpers only, derived from
 * ROUTING_SURFACES so there is a single source of truth (no duplicate registry).
 */
export const ROUTING_ADAPTER_OR_LEGACY_STACKS = ROUTING_SURFACES.filter(
  (surface) => surface.role === "adapter" || surface.role === "helper",
).map((surface) => ({
  path: surface.path,
  role: surface.role,
  status: surface.role,
  note: surface.note,
}));

/** Most-specific registered surface for a module path (longest match wins). */
export function routingSurfaceForPath(path: string): RoutingSurface | null {
  const p = path.replace(/\\/g, "/");
  let best: RoutingSurface | null = null;
  for (const surface of ROUTING_SURFACES) {
    if (
      p.includes(surface.path) &&
      (best === null || surface.path.length > best.path.length)
    ) {
      best = surface;
    }
  }
  return best;
}

export function routingOwnerRoleForPath(path: string): RoutingOwnerRole {
  return routingSurfaceForPath(path)?.role ?? null;
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
