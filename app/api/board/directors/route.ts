import { NextResponse } from "next/server";
import { listBoardDirectorMetadata } from "@/lib/board/relationships";

export const runtime = "nodejs";

/** GET /api/board/directors — Director definitions + relationship metadata */
export async function GET() {
  return NextResponse.json({
    directors: listBoardDirectorMetadata(),
  });
}
