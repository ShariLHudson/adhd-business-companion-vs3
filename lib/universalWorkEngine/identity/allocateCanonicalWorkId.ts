/**
 * Sole mint for new master Work identities.
 * Legacy prefixes may be adopted as canonical for existing certified records —
 * they must not be minted as competing masters for new work.
 */

import type { CanonicalWorkId, WorkOrigin } from "../types";
import { createIdentityRecord } from "./workIdentityStore";

export const CANONICAL_WORK_ID_PREFIX = "work-" as const;

function randomSuffix(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export type AllocateCanonicalWorkIdInput = {
  origin?: WorkOrigin;
  workTypeId?: string | null;
  /** Optional secondary ids to register as aliases (never competing masters). */
  aliases?: readonly string[];
};

/** Allocate a new canonical Work ID (`work-…`) and register identity. */
export function allocateCanonicalWorkId(
  input: AllocateCanonicalWorkIdInput = {},
): CanonicalWorkId {
  const workId = `${CANONICAL_WORK_ID_PREFIX}${randomSuffix()}` as CanonicalWorkId;
  createIdentityRecord({
    workId,
    origin: input.origin ?? "create",
    workTypeId: input.workTypeId ?? null,
    aliases: input.aliases,
  });
  return workId;
}

export function isCanonicalWorkIdFormat(id: string): boolean {
  return /^work-[a-z0-9]+$/i.test(id.trim());
}

/** Legacy mint prefixes that must not be used for new master identities. */
export const LEGACY_WORK_ID_PREFIXES = [
  "create-",
  "evt-",
  "ws-",
  "cw-",
  "creation-",
] as const;

export function detectLegacyWorkIdKind(
  id: string,
): (typeof LEGACY_WORK_ID_PREFIXES)[number] | null {
  const t = id.trim().toLowerCase();
  for (const prefix of LEGACY_WORK_ID_PREFIXES) {
    if (t.startsWith(prefix)) return prefix;
  }
  return null;
}
