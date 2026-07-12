/**
 * Board Director relationships — suggestion helper for Board Review UI.
 * Backed by the full relationship registry. Never auto-invites.
 */

import type { BoardDirectorId } from "@/lib/board/types";
import {
  buildLegacyRelationshipSuggestionMap,
  recommendDirectorsFromRelationships,
} from "@/lib/board/relationships";

/**
 * Directed suggestion list per Director (recommends first, then often-works-with).
 * Kept for existing Board Review invite chips — no UI redesign required.
 */
export const BOARD_DIRECTOR_RELATIONSHIPS: Readonly<
  Record<BoardDirectorId, readonly BoardDirectorId[]>
> = buildLegacyRelationshipSuggestionMap();

/**
 * Suggested Directors from Board relationships of the last joined
 * (and other selected) Directors. Excludes anyone already included.
 * Never auto-adds — caller only presents choices.
 */
export function suggestDirectorsFromBoardRelationships(
  selectedDirectorIds: readonly BoardDirectorId[],
  lastJoinedDirectorId: BoardDirectorId | null,
  limit = 4,
): BoardDirectorId[] {
  const seeds: BoardDirectorId[] = [];
  if (lastJoinedDirectorId) seeds.push(lastJoinedDirectorId);
  for (const id of selectedDirectorIds) {
    if (id !== lastJoinedDirectorId) seeds.push(id);
  }

  const result = recommendDirectorsFromRelationships({
    seedDirectorIds: seeds.length > 0 ? seeds : undefined,
    excludeDirectorIds: selectedDirectorIds,
    limit,
  });

  return result.recommendations.map((r) => r.directorId);
}
