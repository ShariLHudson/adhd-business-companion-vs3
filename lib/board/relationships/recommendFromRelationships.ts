/**
 * Relationship-based Director recommendation engine.
 * Never auto-adds Devil’s Advocate. Never mutates Board Review state.
 */

import { BOARD_MAY_AUTO_ADD_DEVILS_ADVOCATE } from "@/lib/board/types";
import type { BoardDirectorId } from "@/lib/board/types";
import {
  getDirectorRelationshipProfile,
  listDirectorRelationshipProfiles,
} from "@/lib/board/relationships/directorRelationshipRegistry";
import type {
  DirectorRelationshipKind,
  DirectorRelationshipRecommendation,
  RecommendDirectorsFromRelationshipsInput,
  RecommendDirectorsFromRelationshipsResult,
} from "@/lib/board/relationships/types";

type Acc = {
  score: number;
  reasons: Set<string>;
  kinds: Set<DirectorRelationshipKind>;
  sources: Set<BoardDirectorId>;
};

function ensureAcc(map: Map<BoardDirectorId, Acc>, id: BoardDirectorId): Acc {
  let row = map.get(id);
  if (!row) {
    row = {
      score: 0,
      reasons: new Set(),
      kinds: new Set(),
      sources: new Set(),
    };
    map.set(id, row);
  }
  return row;
}

function addScore(
  map: Map<BoardDirectorId, Acc>,
  target: BoardDirectorId,
  source: BoardDirectorId,
  kind: DirectorRelationshipKind,
  points: number,
  reason: string,
  exclude: Set<BoardDirectorId>,
) {
  if (exclude.has(target) || target === source) return;
  const row = ensureAcc(map, target);
  row.score += points;
  row.kinds.add(kind);
  row.sources.add(source);
  row.reasons.add(reason);
}

/**
 * Rank Directors to invite next from relationship metadata + optional decision text.
 */
export function recommendDirectorsFromRelationships(
  input: RecommendDirectorsFromRelationshipsInput = {},
): RecommendDirectorsFromRelationshipsResult {
  const decisionText = (input.decisionText ?? "").trim();
  const q = decisionText.toLowerCase();
  const seeds = (input.seedDirectorIds ?? []).filter(Boolean) as BoardDirectorId[];
  const exclude = new Set<BoardDirectorId>([
    ...(input.excludeDirectorIds ?? []),
    ...seeds,
  ]);
  const limit = Math.max(1, Math.min(input.limit ?? 5, 10));
  const scores = new Map<BoardDirectorId, Acc>();

  const seedProfiles =
    seeds.length > 0
      ? seeds
          .map((id) => getDirectorRelationshipProfile(id))
          .filter(Boolean)
      : listDirectorRelationshipProfiles();

  for (const profile of seedProfiles) {
    if (!profile) continue;
    const source = profile.directorId;

    profile.recommends.forEach((id, index) => {
      addScore(
        scores,
        id,
        source,
        "recommends",
        40 - index * 3,
        `${source} recommends ${id}`,
        exclude,
      );
    });

    profile.oftenWorksWith.forEach((id, index) => {
      addScore(
        scores,
        id,
        source,
        "often_works_with",
        22 - index * 2,
        `${source} often works with ${id}`,
        exclude,
      );
    });

    profile.providesBalance.forEach((id, index) => {
      addScore(
        scores,
        id,
        source,
        "provides_balance",
        18 - index * 2,
        `${id} provides balance for ${source}`,
        exclude,
      );
    });

    if (q) {
      for (const rule of profile.inviteForDecisions) {
        const hit = rule.cues.some((cue) => q.includes(cue.toLowerCase()));
        if (!hit) continue;
        for (const id of rule.inviteDirectorIds) {
          addScore(
            scores,
            id,
            source,
            "invite_for_decision",
            35,
            rule.reason,
            exclude,
          );
        }
      }
    }
  }

  // Devil’s Advocate is never ranked into auto-recommendations — offer-only.
  const recommendations: DirectorRelationshipRecommendation[] = [...scores.entries()]
    .filter(([directorId]) => directorId !== "devils-advocate")
    .map(([directorId, row]) => ({
      directorId,
      score: row.score,
      reasons: [...row.reasons],
      kinds: [...row.kinds],
      sourceDirectorIds: [...row.sources],
    }))
    .sort((a, b) => b.score - a.score || a.directorId.localeCompare(b.directorId))
    .slice(0, limit);

  const daScored = scores.has("devils-advocate");
  const offerDevilsAdvocate =
    !BOARD_MAY_AUTO_ADD_DEVILS_ADVOCATE &&
    !exclude.has("devils-advocate") &&
    (daScored ||
      /\b(launch|pricing|partnership|hiring|invest|assumption|challenge|stress test)\b/i.test(
        decisionText,
      ));

  return {
    recommendations,
    offerDevilsAdvocate,
    offerDevilsAdvocateReason: offerDevilsAdvocate
      ? "This decision may benefit from the Devil’s Advocate — only if you invite them."
      : undefined,
  };
}

/**
 * Directors recommended by a single Director (API / metadata helper).
 */
export function getDirectRecommendationsForDirector(
  directorId: BoardDirectorId,
): BoardDirectorId[] {
  const profile = getDirectorRelationshipProfile(directorId);
  if (!profile) return [];
  return [...profile.recommends];
}
