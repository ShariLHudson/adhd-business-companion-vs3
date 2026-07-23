/**
 * Shared artifact → destination capability model.
 * Used by Destination Gallery, ExportActions, Artifact Ready, Crystal Actions, Create draft menus.
 */

export type ArtifactFamily =
  | "document"
  | "spreadsheet"
  | "calendar"
  | "presentation"
  | "form"
  | "image"
  | "other";

/** Stable destination ids — UI labels are separate. */
export type ArtifactDestinationId =
  | "google-docs"
  | "google-sheets"
  | "google-forms"
  | "google-calendar"
  | "microsoft-word"
  | "microsoft-excel"
  | "outlook-calendar"
  | "canva"
  | "powerpoint"
  | "pdf"
  | "csv"
  | "markdown"
  | "print"
  | "download"
  | "copy";

export type ArtifactDestinationFormat =
  | "txt"
  | "md"
  | "pdf"
  | "docx"
  | "csv";

export type ArtifactDestinationDef = {
  id: ArtifactDestinationId;
  label: string;
  /** When true, show even if the provider is not connected (with honest unavailable state). */
  alwaysOffer?: boolean;
  /** Connection / preference gate — evaluated by the caller when needed. */
  requires?: "google" | "microsoft-word" | "outlook" | "canva" | "print";
};

export type ArtifactDestinationCapabilities = {
  family: ArtifactFamily;
  destinations: readonly ArtifactDestinationDef[];
  /** Preferred local download format for this family. */
  defaultDownloadFormat: ArtifactDestinationFormat;
  /** Allowed local download formats. */
  downloadFormats: readonly ArtifactDestinationFormat[];
};

export type BuiltDownloadArtifact = {
  filename: string;
  mimeType: string;
  /** UTF-8 text payload when applicable (txt/md/csv). */
  text?: string;
  /** Binary payload for pdf/docx. */
  bytes?: Uint8Array;
  encoding: "utf-8" | "binary";
  format: ArtifactDestinationFormat;
};
