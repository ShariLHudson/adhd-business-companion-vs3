/**
 * Mints a fresh `WorkId` — Slice 1B's first function that actually
 * creates an identity (deliberately excluded from Slice 0's
 * `resolveCommitmentGate`, which only decides *whether* to; see that
 * module's own doc comment).
 *
 * Mirrors the existing id-generation pattern already used for
 * `SessionArtifact` ids (`lib/conversationSession/pauseResume.ts`'s
 * `newArtifactId`) rather than introducing a new one.
 */

import type { WorkId } from "./types";

export function mintWorkId(): WorkId {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `work-${Date.now()}`;
}
