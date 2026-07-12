import { NextResponse } from "next/server";
import { isBoardDirectorId } from "@/lib/board";
import { getBoardDirectorMetadata } from "@/lib/board/relationships";

export const runtime = "nodejs";

type Params = { params: Promise<{ directorId: string }> };

/** GET /api/board/directors/:directorId */
export async function GET(_request: Request, { params }: Params) {
  const { directorId } = await params;
  if (!isBoardDirectorId(directorId)) {
    return NextResponse.json({ error: "Unknown Director" }, { status: 404 });
  }
  const metadata = getBoardDirectorMetadata(directorId);
  if (!metadata) {
    return NextResponse.json({ error: "Unknown Director" }, { status: 404 });
  }
  return NextResponse.json(metadata);
}
