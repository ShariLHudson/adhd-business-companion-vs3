/**
 * Director metadata for API consumers — definition + relationships.
 * Safe for future Board discussion assembly.
 */

import {
  getBoardDirectorById,
  listBoardDirectors,
} from "@/lib/board/boardDirectorRegistry";
import {
  getDirectorRelationshipProfile,
  listDirectorRelationshipEdges,
} from "@/lib/board/relationships/directorRelationshipRegistry";
import type { DirectorRelationshipProfile } from "@/lib/board/relationships/types";
import type { BoardDirectorDefinition, BoardDirectorId } from "@/lib/board/types";

export type BoardDirectorMetadata = {
  director: BoardDirectorDefinition;
  relationships: DirectorRelationshipProfile;
};

export function getBoardDirectorMetadata(
  directorId: string,
): BoardDirectorMetadata | null {
  const director = getBoardDirectorById(directorId);
  const relationships = getDirectorRelationshipProfile(directorId);
  if (!director || !relationships) return null;
  return { director, relationships };
}

export function listBoardDirectorMetadata(): BoardDirectorMetadata[] {
  return listBoardDirectors()
    .map((d) => getBoardDirectorMetadata(d.id))
    .filter((row): row is BoardDirectorMetadata => row !== null);
}

/** Bundle useful for future Board discussion engines. */
export type BoardDiscussionSupportSnapshot = {
  directors: BoardDirectorMetadata[];
  edges: ReturnType<typeof listDirectorRelationshipEdges>;
  speakingOrder: BoardDirectorId[];
};

export function buildBoardDiscussionSupportSnapshot(
  directorIds?: readonly BoardDirectorId[],
): BoardDiscussionSupportSnapshot {
  const all = listBoardDirectorMetadata();
  const selected =
    directorIds && directorIds.length > 0
      ? all.filter((row) => directorIds.includes(row.director.id))
      : all;

  const speakingOrder = [...selected]
    .sort(
      (a, b) =>
        a.relationships.discussionAffinity.speakingOrderBias -
          b.relationships.discussionAffinity.speakingOrderBias ||
        a.director.name.localeCompare(b.director.name),
    )
    .map((row) => row.director.id);

  const idSet = new Set(selected.map((r) => r.director.id));
  const edges = listDirectorRelationshipEdges().filter(
    (e) => idSet.has(e.fromDirectorId) && idSet.has(e.toDirectorId),
  );

  return { directors: selected, edges, speakingOrder };
}
