/**
 * Shared attachments for Growth — thin references into the Asset Library.
 * Files live once in lib/assetLibrary; entries hold assetId refs.
 */

import { getAssetById } from "@/lib/assetLibrary/assetLibraryStore";
import { ingestFileToAssetLibrary, ingestLinkToAssetLibrary } from "@/lib/assetLibrary/ingest";

export type GrowthAttachmentKind = "file" | "image" | "pdf" | "link" | "video";

export type GrowthAttachment = {
  id: string;
  kind: GrowthAttachmentKind;
  name: string;
  /** Resolved URL — may be empty when assetId is set (resolved at read time). */
  url: string;
  mimeType?: string;
  /** Asset Library record — single source of truth for file blobs. */
  assetId?: string;
};

export const GROWTH_ATTACHMENT_MAX_BYTES = 2_000_000;

export function newAttachmentId(): string {
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function kindFromMime(mime: string, name: string): GrowthAttachmentKind {
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf" || name.toLowerCase().endsWith(".pdf")) {
    return "pdf";
  }
  return "file";
}

export function isVideoUrl(url: string): boolean {
  return /youtube\.com|youtu\.be|vimeo\.com|loom\.com/i.test(url);
}

/** Resolve url/name from Asset Library when assetId is present. */
export function resolveGrowthAttachment(att: GrowthAttachment): GrowthAttachment {
  if (!att.assetId) return att;
  const asset = getAssetById(att.assetId);
  if (!asset) return att;
  return {
    ...att,
    url: asset.url,
    name: att.name || asset.title || asset.filename,
    mimeType: att.mimeType ?? asset.mimeType,
    kind: kindFromMime(asset.mimeType, asset.filename),
  };
}

export async function readFileAsAttachment(
  file: File,
): Promise<GrowthAttachment | null> {
  const ingested = await ingestFileToAssetLibrary(file);
  if (!ingested) return null;
  const asset = getAssetById(ingested.assetId);
  if (!asset) return null;
  const mime = asset.mimeType;
  return {
    id: newAttachmentId(),
    assetId: asset.id,
    kind: kindFromMime(mime, asset.filename),
    name: asset.filename,
    url: asset.url,
    mimeType: mime,
  };
}

export function linkAttachment(url: string, label?: string): GrowthAttachment {
  const ingested = ingestLinkToAssetLibrary(url, label);
  const asset = getAssetById(ingested.assetId);
  const trimmed = url.trim();
  return {
    id: newAttachmentId(),
    assetId: ingested.assetId,
    kind: isVideoUrl(trimmed) ? "video" : "link",
    name: label?.trim() || asset?.filename || trimmed,
    url: asset?.url ?? trimmed,
  };
}

export function attachmentTypeLabel(kind: GrowthAttachmentKind): string {
  switch (kind) {
    case "image":
      return "Image";
    case "pdf":
      return "PDF";
    case "video":
      return "Video link";
    case "link":
      return "Link";
    default:
      return "File";
  }
}

export function downloadGrowthAttachment(att: GrowthAttachment): void {
  if (typeof window === "undefined") return;
  const resolved = resolveGrowthAttachment(att);
  const anchor = document.createElement("a");
  anchor.href = resolved.url;
  anchor.download = resolved.name || "attachment";
  if (resolved.url.startsWith("http")) {
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
  }
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export function openGrowthAttachment(att: GrowthAttachment): void {
  if (typeof window === "undefined") return;
  const resolved = resolveGrowthAttachment(att);
  if (resolved.url.startsWith("http")) {
    window.open(resolved.url, "_blank", "noopener,noreferrer");
    return;
  }
  downloadGrowthAttachment(resolved);
}
