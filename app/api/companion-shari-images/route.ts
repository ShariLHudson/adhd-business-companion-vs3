import { NextResponse } from "next/server";
import {
  detectShariImagesOnDisk,
  detectShariPhotoManifestVersion,
} from "@/lib/shariPhotoManifest.server";

export const dynamic = "force-dynamic";

/** Returns approved Shari image URLs that exist on disk. */
export async function GET() {
  const images = detectShariImagesOnDisk();
  const version = detectShariPhotoManifestVersion();
  return NextResponse.json({
    images,
    count: images.length,
    version,
  });
}
