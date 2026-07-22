/**
 * Node-only filesystem verification for Chamber knowledge packs.
 *
 * Must NOT be imported from client components or client-safe barrels.
 * Runtime chat hints use static contracts via loadChamberKnowledge
 * (skipFilesystemCheck). Tests / server tooling import this file directly.
 */

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  loadChamberKnowledge,
} from "./loadChamberKnowledge";
import type {
  ChamberKnowledgeRetrievalSlice,
  LoadChamberKnowledgeOptions,
} from "./types";

export function verifyChamberKnowledgePaths(paths: readonly string[]): {
  filesVerified: boolean;
  missingPaths: string[];
} {
  const missing: string[] = [];
  for (const rel of paths) {
    const abs = resolve(process.cwd(), rel);
    if (!existsSync(abs)) missing.push(rel);
  }
  return {
    filesVerified: missing.length === 0,
    missingPaths: missing,
  };
}

/** Load slice and verify selected doc paths exist on disk (Node only). */
export function loadChamberKnowledgeVerified(
  memberId: string,
  options: LoadChamberKnowledgeOptions = {},
): ChamberKnowledgeRetrievalSlice {
  const slice = loadChamberKnowledge(memberId, {
    ...options,
    skipFilesystemCheck: true,
  });
  if (slice.selectedPaths.length === 0) {
    return { ...slice, filesVerified: true, missingPaths: [] };
  }
  const check = verifyChamberKnowledgePaths(slice.selectedPaths);
  return {
    ...slice,
    filesVerified: check.filesVerified,
    missingPaths: check.missingPaths,
  };
}
