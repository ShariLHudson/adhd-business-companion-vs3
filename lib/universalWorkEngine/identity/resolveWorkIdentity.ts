/**
 * Resolve any known Work reference to one canonical Work ID.
 * Existing Event / Create / Projects ids are adopted as canonical when first seen
 * so certified data is never orphaned or duplicated.
 */

import type {
  CanonicalWorkId,
  WorkIdAliasKind,
  WorkIdentityRecord,
  WorkOrigin,
} from "../types";
import {
  createIdentityRecord,
  getWorkIdentity,
  lookupAlias,
  registerAliasInStore,
} from "./workIdentityStore";
import {
  detectLegacyWorkIdKind,
  isCanonicalWorkIdFormat,
} from "./allocateCanonicalWorkId";

function originForLegacy(
  kind: ReturnType<typeof detectLegacyWorkIdKind>,
): WorkOrigin {
  switch (kind) {
    case "evt-":
      return "event";
    case "cw-":
      return "projects";
    case "ws-":
      return "duplicate";
    case "create-":
    case "creation-":
      return "create";
    default:
      return "migration";
  }
}

function aliasKindForLegacy(
  kind: ReturnType<typeof detectLegacyWorkIdKind>,
): WorkIdAliasKind {
  switch (kind) {
    case "evt-":
      return "event_record";
    case "cw-":
      return "canonical_projects";
    case "ws-":
      return "workspace_duplicate";
    case "create-":
      return "create_session";
    case "creation-":
      return "runtime_creation";
    default:
      return "legacy_other";
  }
}

/**
 * Adopt an existing durable/runtime id as the canonical Work ID (no rewrite).
 * Safe for certified Event records whose id is already `evt-…`.
 */
export function adoptLegacyWorkIdAsCanonical(
  legacyId: string,
  options?: { workTypeId?: string | null; origin?: WorkOrigin },
): WorkIdentityRecord {
  const id = legacyId.trim();
  if (!id) {
    throw new Error("Cannot adopt empty Work ID");
  }
  const existing = getWorkIdentity(id) ?? lookupAlias(id);
  if (existing) {
    const workId = typeof existing === "string" ? existing : existing.workId;
    const record = getWorkIdentity(workId);
    if (record) return record;
  }
  const legacy = detectLegacyWorkIdKind(id);
  return createIdentityRecord({
    workId: id,
    origin: options?.origin ?? originForLegacy(legacy),
    workTypeId: options?.workTypeId ?? null,
    aliases: [],
  });
}

/**
 * Resolve any candidate id to the canonical Work ID.
 * Registers aliases when `aliasOf` is provided.
 */
export function resolveCanonicalWorkId(
  candidate: string | null | undefined,
  options?: {
    workTypeId?: string | null;
    /** When set, candidate is registered as an alias of this canonical id. */
    aliasOf?: CanonicalWorkId | null;
    adoptIfMissing?: boolean;
  },
): CanonicalWorkId | null {
  const raw = candidate?.trim() ?? "";
  if (!raw) return null;

  if (options?.aliasOf?.trim()) {
    const master = options.aliasOf.trim();
    if (!getWorkIdentity(master)) {
      adoptLegacyWorkIdAsCanonical(master, {
        workTypeId: options.workTypeId,
      });
    }
    const legacy = detectLegacyWorkIdKind(raw);
    registerAliasInStore(
      master,
      raw,
      legacy ? aliasKindForLegacy(legacy) : "legacy_other",
    );
    return master;
  }

  const viaAlias = lookupAlias(raw);
  if (viaAlias) return viaAlias;

  const direct = getWorkIdentity(raw);
  if (direct) return direct.workId;

  if (options?.adoptIfMissing === false) return null;

  // First sight of a legacy or canonical id — adopt as master (no duplicate mint).
  if (isCanonicalWorkIdFormat(raw) || detectLegacyWorkIdKind(raw)) {
    return adoptLegacyWorkIdAsCanonical(raw, {
      workTypeId: options?.workTypeId,
    }).workId;
  }

  // Unknown freeform id — adopt to preserve links (Projects bridges, etc.).
  return adoptLegacyWorkIdAsCanonical(raw, {
    workTypeId: options?.workTypeId,
    origin: "migration",
  }).workId;
}

/**
 * Coalesce workflow session / event / explicit work id into one canonical Work ID.
 */
export function coalesceWorkflowWorkId(input: {
  workId?: string | null;
  sessionId?: string | null;
  eventRecordId?: string | null;
  workTypeId?: string | null;
}): CanonicalWorkId | null {
  const preferred =
    input.workId?.trim() ||
    input.eventRecordId?.trim() ||
    input.sessionId?.trim() ||
    "";
  if (!preferred) return null;

  const canonical = resolveCanonicalWorkId(preferred, {
    workTypeId: input.workTypeId,
    adoptIfMissing: true,
  });
  if (!canonical) return null;

  // Link secondary ids as aliases of the same master.
  for (const secondary of [input.sessionId, input.eventRecordId, input.workId]) {
    const s = secondary?.trim();
    if (s && s !== canonical) {
      resolveCanonicalWorkId(s, {
        aliasOf: canonical,
        workTypeId: input.workTypeId,
      });
    }
  }
  return canonical;
}
