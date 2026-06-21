/**
 * Shared attachments for Growth Center areas — links, files, images, PDFs, video URLs.
 */

export type GrowthAttachmentKind = "file" | "image" | "pdf" | "link" | "video";

export type GrowthAttachment = {
  id: string;
  kind: GrowthAttachmentKind;
  name: string;
  url: string;
  mimeType?: string;
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

export async function readFileAsAttachment(
  file: File,
): Promise<GrowthAttachment | null> {
  if (file.size > GROWTH_ATTACHMENT_MAX_BYTES) {
    return null;
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  const mime = file.type || "application/octet-stream";
  return {
    id: newAttachmentId(),
    kind: kindFromMime(mime, file.name),
    name: file.name,
    url: dataUrl,
    mimeType: mime,
  };
}

export function linkAttachment(url: string, label?: string): GrowthAttachment {
  const trimmed = url.trim();
  return {
    id: newAttachmentId(),
    kind: isVideoUrl(trimmed) ? "video" : "link",
    name: label?.trim() || trimmed,
    url: trimmed,
  };
}
