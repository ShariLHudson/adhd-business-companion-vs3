import type { AssetCategory } from "./types";

export function categoryFromMime(
  mime: string,
  filename: string,
): AssetCategory {
  const lower = filename.toLowerCase();
  if (mime.startsWith("image/")) {
    if (/screenshot|screen.?shot|capture/i.test(lower)) return "screenshot";
    return "image";
  }
  if (mime === "application/pdf" || lower.endsWith(".pdf")) return "pdf";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) {
    if (/voice|memo|note/i.test(lower)) return "voice-note";
    return "audio";
  }
  if (/\.(eml|msg)$/i.test(lower) || mime.includes("message/rfc822")) {
    return "email";
  }
  if (/cert|certificate|diploma|award/i.test(lower)) return "certificate";
  if (
    mime.includes("word") ||
    mime.includes("document") ||
    /\.(doc|docx|txt|rtf|odt)$/i.test(lower)
  ) {
    return "document";
  }
  return "other";
}

export function categoryLabel(category: AssetCategory): string {
  switch (category) {
    case "image":
      return "Images";
    case "screenshot":
      return "Screenshots";
    case "document":
      return "Documents";
    case "pdf":
      return "PDFs";
    case "video":
      return "Videos";
    case "audio":
      return "Audio";
    case "voice-note":
      return "Voice notes";
    case "certificate":
      return "Certificates";
    case "email":
      return "Emails";
    default:
      return "Other";
  }
}
