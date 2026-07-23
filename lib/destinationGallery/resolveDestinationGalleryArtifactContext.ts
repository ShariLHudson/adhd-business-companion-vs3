/**
 * Resolve live artifact context for Destination Gallery crystal filtering.
 * Keeps CompanionPageClient wiring thin and unit-testable.
 */

import { normalizeArtifactType } from "@/lib/artifactType";
import { classifyArtifactFamily } from "@/lib/artifactDestinations";

export type DestinationGalleryArtifactContextInput = {
  /** Preferred — current Create draft / canonical artifact body */
  draftContent?: string | null;
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

/**
 * Prefer draft content; never invent binary/gibberish.
 * Artifact type falls back to Document when metadata is missing.
 */
export function resolveDestinationGalleryArtifactContext(
  input: DestinationGalleryArtifactContextInput,
): DestinationGalleryArtifactContext {
  const draft = (input.draftContent ?? "").trim();
  const fallback = (input.fallbackAssistantText ?? "").trim();
  const exportText = draft || fallback;

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
