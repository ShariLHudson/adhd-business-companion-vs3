/**
 * Database boundary — only creationDurable/repository may touch the durable table
 * from application runtime. Work Type packages must not import the repository.
 */

export const APPROVED_DURABLE_REPOSITORY =
  "lib/creationDurable/repository.ts" as const;

export const APPROVED_DURABLE_TABLE = "companion_creation_workspaces" as const;

/** Modules allowed to reference CREATION_DURABLE_TABLE / repository APIs. */
export const APPROVED_DURABLE_RUNTIME_MODULES = [
  "lib/creationDurable/",
  "scripts/apply-companion-creation-workspaces-schema.mjs",
  "scripts/verify-companion-creation-workspaces.mjs",
] as const;

/** Work Type / experience packages that must not call durable storage. */
export const FORBIDDEN_DURABLE_CALLER_GLOBS = [
  "lib/universalWorkEngine/packages/",
  "lib/eventsIntelligence/",
  "lib/eventCreationWorkspace/",
  "lib/createAssets/",
  "lib/chamber/",
  "lib/boardroom/",
  "lib/research/",
] as const;
