import type { FounderWorkspaceItem } from "./types";
import { kindLabel, statusLabel } from "./types";

export function founderItemHasExportableContent(item: FounderWorkspaceItem): boolean {
  return Boolean(item.title.trim() || item.description.trim());
}

/** Google Doc body — description / notes only (title is the doc name). */
export function formatFounderGoogleDocContent(item: FounderWorkspaceItem): string {
  return item.description.trim() || "(No description)";
}

/** PDF body — full metadata plus description. */
export function formatFounderPdfBody(item: FounderWorkspaceItem): string {
  const lines = [
    item.title.trim(),
    "",
    `Type: ${kindLabel(item.kind)}`,
    `Status: ${statusLabel(item.status)}`,
    `Created: ${new Date(item.createdAt).toLocaleString()}`,
    `Updated: ${new Date(item.updatedAt).toLocaleString()}`,
    "",
    "---",
    "",
    item.description.trim() || "(No description)",
  ];
  return lines.join("\n");
}

export function founderExportFilename(title: string, ext: string): string {
  const base = title
    .trim()
    .replace(/[^\w\s.-]+/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60) || "founder-item";
  return `${base}.${ext}`;
}
