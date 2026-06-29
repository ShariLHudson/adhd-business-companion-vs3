/**
 * Ingest uploads into the Asset Library — deduplicated, referenced elsewhere.
 */

import type { GrowthAttachment } from "@/lib/growthAttachments";
import {
  createAssetRecord,
  findAssetByContentHash,
} from "./assetLibraryStore";
import { categoryFromMime } from "./category";

export const ASSET_MAX_BYTES = 2_000_000;

/** Lightweight fingerprint for V1 dedup within one browser. */
export function hashAssetContent(url: string, filename: string): string {
  const sample = url.slice(0, 512) + url.slice(-128) + filename;
  let h = 0;
  for (let i = 0; i < sample.length; i += 1) {
    h = (h * 31 + sample.charCodeAt(i)) | 0;
  }
  return `h${Math.abs(h)}-${url.length}`;
}

export type IngestFileResult = {
  assetId: string;
  deduplicated: boolean;
};

export async function ingestFileToAssetLibrary(
  file: File,
): Promise<IngestFileResult | null> {
  if (file.size > ASSET_MAX_BYTES) return null;

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const mime = file.type || "application/octet-stream";
  const hash = hashAssetContent(dataUrl, file.name);
  const existing = findAssetByContentHash(hash);
  if (existing) {
    return { assetId: existing.id, deduplicated: true };
  }

  const asset = createAssetRecord({
    filename: file.name,
    category: categoryFromMime(mime, file.name),
    mimeType: mime,
    url: dataUrl,
    contentHash: hash,
  });
  return { assetId: asset.id, deduplicated: false };
}

/** Register external links as lightweight assets (URL stored once). */
export function ingestLinkToAssetLibrary(
  url: string,
  label?: string,
): IngestFileResult {
  const trimmed = url.trim();
  const hash = hashAssetContent(trimmed, label ?? trimmed);
  const existing = findAssetByContentHash(hash);
  if (existing) {
    return { assetId: existing.id, deduplicated: true };
  }

  const isVideo = /youtube\.com|youtu\.be|vimeo\.com|loom\.com/i.test(trimmed);
  const asset = createAssetRecord({
    filename: label?.trim() || trimmed,
    category: isVideo ? "video" : "other",
    mimeType: isVideo ? "text/uri-list" : "text/uri-list",
    url: trimmed,
    contentHash: hash,
  });
  return { assetId: asset.id, deduplicated: false };
}
