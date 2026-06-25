import { NextResponse } from "next/server";
import { detectShariImagesOnDisk } from "@/lib/shariPhotoManifest.server";

export const dynamic = "force-dynamic";

/** Returns approved Shari image URLs that exist on disk. */
export async function GET() {
  const images = detectShariImagesOnDisk();
  return NextResponse.json({
    images,
    count: images.length,
  });
}
