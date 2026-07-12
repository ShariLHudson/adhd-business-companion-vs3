import { NextResponse } from "next/server";
import {
  buildBoardDiscussionSupportSnapshot,
  listDirectorRelationshipEdges,
  listDirectorRelationshipProfiles,
} from "@/lib/board/relationships";

export const runtime = "nodejs";

/** GET /api/board/relationships — full registry + edges + discussion support */
export async function GET() {
  return NextResponse.json({
    profiles: listDirectorRelationshipProfiles(),
    edges: listDirectorRelationshipEdges(),
    discussionSupport: buildBoardDiscussionSupportSnapshot(),
  });
}
