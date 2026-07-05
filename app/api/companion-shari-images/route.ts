import { NextResponse } from "next/server";

import manifest from "@/lib/generated/shariPhotoManifest.json";

export const dynamic = "force-dynamic";

/** Returns approved Shari image URLs (manifest generated at build/dev start). */
export async function GET() {
  return NextResponse.json(manifest);
}
