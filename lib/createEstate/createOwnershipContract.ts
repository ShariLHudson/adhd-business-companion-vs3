/**
 * P0-03 — Create Ownership Contract (BINDING)
 *
 * Single orchestration spine for Create. Dual/triple stacks remain as
 * adapters or quarantined ghosts — do not add new Create owners.
 *
 * @see docs/create-experience/standards/055_UNIVERSAL_CREATION_ENTRYPOINT_STANDARD.md
 * @see docs/architecture-v2/SPARK_ESTATE_PRODUCTION_READINESS_AUDIT.md (P0-03)
 */

export const CREATE_OWNERSHIP_CONTRACT = {
  version: "2026-07-22",
  /** Only public open API for “start / resume Create from anywhere”. */
  entryOwner: "lib/universalCreationEntrypoint/",
  entrySymbol: "resolveUniversalCreationEntrypoint",
  /** Member Create destination / Begin→Workspace UI adapter. */
  uiAdapter: "lib/createEstate/",
  uiBeginSymbol: "resolveCreateBeginOutcome",
  /** Lifecycle / context / next-best-step engine (many blueprints → one experience). */
  lifecycleEngine: "lib/universalCreationEngine/",
  /** Canonical Work identity, work types, and blueprint packages. */
  workIdentityOwner: "lib/universalWorkEngine/",
  rule: "Many entry points → one Universal Creation Entrypoint → Create Estate UI + UCE lifecycle + UWE Work identity. Never open a second Create owner.",
} as const;

/**
 * Stacks that must not receive new Create ownership.
 * Callers may remain until retargeted; do not expand.
 */
export const CREATE_QUARANTINED_OR_ADAPTER_STACKS = [
  {
    path: "lib/universalCreation/",
    role: "legacy-chat-document-adapter",
    status: "adapter-only" as const,
    note: "Chat-document Discover→Create flow. Do not use as cross-origin Create open API.",
  },
  {
    path: "lib/platformIntent/blueprintRegistry.ts",
    role: "legacy-intent-alias-blueprints",
    status: "adapter-only" as const,
    note: "Alias catalog for platform intent. New blueprints belong in universalWorkEngine packages.",
  },
  {
    path: "lib/createEstate/legacyCreateShellQuarantine.ts",
    role: "legacy-split-shell",
    status: "quarantined" as const,
    note: "WorkspaceLayout + ContentGeneratorPanel split — Estate Art Studio replaces it.",
  },
] as const;

export type CreateOwnerRole =
  | "entry"
  | "ui-adapter"
  | "lifecycle"
  | "work-identity"
  | "adapter-only"
  | "quarantined";

/** Resolve which Create role a path claims under this contract. */
export function createOwnerRoleForPath(path: string): CreateOwnerRole | null {
  const p = path.replace(/\\/g, "/");
  if (p.includes("lib/universalCreationEntrypoint")) return "entry";
  if (p.includes("lib/createEstate/legacyCreateShellQuarantine")) {
    return "quarantined";
  }
  if (p.includes("lib/createEstate")) return "ui-adapter";
  if (p.includes("lib/universalCreationEngine")) return "lifecycle";
  if (p.includes("lib/universalWorkEngine")) return "work-identity";
  if (p.includes("lib/universalCreation/")) return "adapter-only";
  if (p.includes("lib/platformIntent/blueprintRegistry")) return "adapter-only";
  return null;
}

export function isCanonicalCreateEntryOwner(path: string): boolean {
  return createOwnerRoleForPath(path) === "entry";
}
