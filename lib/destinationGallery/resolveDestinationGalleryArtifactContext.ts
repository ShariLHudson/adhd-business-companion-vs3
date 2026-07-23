/**
 * Resolve live artifact context for Destination Gallery crystal filtering.
 * Keeps CompanionPageClient wiring thin and unit-testable.
 */

import { normalizeArtifactType } from "@/lib/artifactType";
import { classifyArtifactFamily } from "@/lib/artifactDestinations";

export type DestinationGalleryArtifactContextInput = {
  /** Preferred — current built draft / Create canvas body */
  draftContent?: string | null;
  /** Alternate canonical artifact body (workspace record, generator draft) */
  artifactContent?: string | null;
  /** Creation record / brief body when draft canvas is empty */
  creationRecordContent?: string | null;
  /** Creation workspace item type label (Proposal, Spreadsheet, Event Plan, …) */
  itemType?: string | null;
  /** Human title for export / download filename */
  title?: string | null;
  /** Last-resort readable text when no draft is available */
  fallbackAssistantText?: string | null;
};

export type DestinationGalleryArtifactContext = {
  exportText: string;
  exportTitle: string;
  /** Member/create type label used by destinationCapabilities + crystal offers */
  artifactType: string;
  /** Derived family for tests / diagnostics */
  family: ReturnType<typeof classifyArtifactFamily>;
};

/** Reject placeholders, object dumps, and binary-looking payloads. */
export function isReadableExportText(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const text = value.trim();
  if (!text) return false;
  if (text === "[object Object]" || /^\[object \w+\]$/i.test(text)) return false;
  if (text === "undefined" || text === "null") return false;
  // Null bytes / heavy control chars ⇒ not a member-facing text export.
  if (text.includes("\u0000")) return false;
  let control = 0;
  for (let i = 0; i < Math.min(text.length, 400); i++) {
    const code = text.charCodeAt(i);
    if (code < 9 || (code > 13 && code < 32)) control += 1;
  }
  if (control > 8) return false;
  return true;
}

function firstReadable(
  ...candidates: Array<string | null | undefined>
): string {
  for (const candidate of candidates) {
    if (isReadableExportText(candidate)) return candidate.trim();
  }
  return "";
}

/**
 * Prefer draft → artifact → creation record → safe assistant fallback.
 * Artifact type falls back to Document only when metadata is missing.
 */
export function resolveDestinationGalleryArtifactContext(
  input: DestinationGalleryArtifactContextInput,
): DestinationGalleryArtifactContext {
  const exportText = firstReadable(
    input.draftContent,
    input.artifactContent,
    input.creationRecordContent,
    input.fallbackAssistantText,
  );

  const rawType = (input.itemType ?? "").trim();
  const normalized = rawType ? normalizeArtifactType(rawType) : "";
  const artifactType = normalized || "Document";

  const title = (input.title ?? "").trim();
  const exportTitle =
    title ||
    (rawType ? userFacingTitleFromType(rawType) : "") ||
    "Spark work";

  return {
    exportText,
    exportTitle,
    artifactType,
    family: classifyArtifactFamily(artifactType, exportText),
  };
}

function userFacingTitleFromType(itemType: string): string {
  const t = itemType.trim();
  if (!t) return "";
  // Avoid dumping raw enums into the download title.
  if (/^[a-z0-9_-]+$/i.test(t) && !/\s/.test(t)) {
    return t
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return t;
}
