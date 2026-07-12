import { NextResponse } from "next/server";
import { isBoardDirectorId, type BoardDirectorId } from "@/lib/board";
import {
  buildBoardDiscussionSupportSnapshot,
  recommendDirectorsFromRelationships,
} from "@/lib/board/relationships";

export const runtime = "nodejs";

type Body = {
  decisionText?: string;
  seedDirectorIds?: string[];
  excludeDirectorIds?: string[];
  limit?: number;
  /** When true, include speaking-order snapshot for future discussions. */
  includeDiscussionSupport?: boolean;
};

function parseIds(raw: unknown): BoardDirectorId[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((id): id is BoardDirectorId => typeof id === "string" && isBoardDirectorId(id));
}

/**
 * POST /api/board/recommend
 * Relationship recommendation engine — never auto-invites.
 */
export async function POST(request: Request) {
  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    body = {};
  }

  const seedDirectorIds = parseIds(body.seedDirectorIds);
  const excludeDirectorIds = parseIds(body.excludeDirectorIds);
  const result = recommendDirectorsFromRelationships({
    decisionText: typeof body.decisionText === "string" ? body.decisionText : "",
    seedDirectorIds,
    excludeDirectorIds,
    limit: typeof body.limit === "number" ? body.limit : 5,
  });

  const discussionSupport = body.includeDiscussionSupport
    ? buildBoardDiscussionSupportSnapshot([
        ...seedDirectorIds,
        ...result.recommendations.map((r) => r.directorId),
      ])
    : undefined;

  return NextResponse.json({
    ...result,
    discussionSupport,
  });
}
