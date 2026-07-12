import { NextResponse } from "next/server";
import { isBoardDirectorId } from "@/lib/board";
import {
  getBoardDirectorMetadata,
  getDirectRecommendationsForDirector,
  getDirectorRelationshipProfile,
} from "@/lib/board/relationships";

export const runtime = "nodejs";

type Params = { params: Promise<{ directorId: string }> };

/** GET /api/board/relationships/:directorId */
export async function GET(_request: Request, { params }: Params) {
  const { directorId } = await params;
  if (!isBoardDirectorId(directorId)) {
    return NextResponse.json({ error: "Unknown Director" }, { status: 404 });
  }
  const profile = getDirectorRelationshipProfile(directorId);
  const metadata = getBoardDirectorMetadata(directorId);
  if (!profile || !metadata) {
    return NextResponse.json({ error: "Unknown Director" }, { status: 404 });
  }
  return NextResponse.json({
    ...metadata,
    directRecommendations: getDirectRecommendationsForDirector(directorId),
  });
}
