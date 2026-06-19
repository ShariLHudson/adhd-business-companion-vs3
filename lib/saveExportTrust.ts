/**
 * Save & Export Trust — three save levels, receipts, Google result validation.
 */

import type { GoogleFileKind } from "./googleWorkspace";

export type SaveLevel = "resume" | "saved-work" | "permanent-export";

export const SAVE_LEVEL_COPY: Record<
  SaveLevel,
  { label: string; description: string }
> = {
  resume: {
    label: "Resume Save",
    description: "Saved here so you can resume on this device.",
  },
  "saved-work": {
    label: "Saved Work",
    description: "Saved to your Saved Work library.",
  },
  "permanent-export": {
    label: "Permanent Export",
    description: "Sent outside the app — download, print, project, or Google.",
  },
};

export const RESUME_ONLY_HINT =
  "Saved here for resume. Export or add to a project to keep it permanently.";

export type SaveReceiptAction =
  | "resume"
  | "saved-work"
  | "project"
  | "download-pdf"
  | "download-png"
  | "print"
  | "google-doc"
  | "google-sheet"
  | "google-form"
  | "google-drive"
  | "google-fail"
  | "export-fail";

export function saveReceipt(
  action: SaveReceiptAction,
  detail?: string,
): string {
  switch (action) {
    case "resume":
      return "Saved here so you can come back to it.";
    case "saved-work":
      return "Saved to your Saved Work library.";
    case "project":
      return detail
        ? `Added to ${detail}.`
        : "Added to your project.";
    case "download-pdf":
      return "Downloaded as PDF.";
    case "download-png":
      return "Downloaded as PNG.";
    case "print":
      return "Opening print view…";
    case "google-doc":
      return detail
        ? `Created a Google Doc in your Drive. ${detail}`
        : "Created a Google Doc in your Drive.";
    case "google-sheet":
      return detail
        ? `Created a Google Sheet in your Drive. ${detail}`
        : "Created a Google Sheet in your Drive.";
    case "google-form":
      return detail
        ? `Created a Google Form in your Drive. ${detail}`
        : "Created a Google Form in your Drive.";
    case "google-drive":
      return "Saved to your Google Drive.";
    case "google-fail":
      return "Google export did not work. Your work is still saved here.";
    case "export-fail":
      return "That didn't work, but your work is still saved here.";
    default:
      return "Saved.";
  }
}

export function googleFailureReceipt(kind: GoogleFileKind): string {
  const label =
    kind === "sheet"
      ? "Google Sheet"
      : kind === "form"
        ? "Google Form"
        : "Google Doc";
  return `I couldn't create the ${label}. Your draft is still saved here.`;
}

export type GoogleCreateResponse = {
  url?: string;
  id?: string;
  error?: string;
};

/** Success only when API returned a file id and URL. */
export function isGoogleCreateSuccess(
  status: number,
  body: GoogleCreateResponse,
): body is { url: string; id: string } {
  return status >= 200 && status < 300 && Boolean(body.url && body.id);
}

export function googleReceiptForKind(
  kind: GoogleFileKind,
  url?: string,
): string {
  const link = url ? `Open: ${url}` : "";
  switch (kind) {
    case "sheet":
      return saveReceipt("google-sheet", link);
    case "form":
      return saveReceipt("google-form", link);
    default:
      return saveReceipt("google-doc", link);
  }
}

export function shouldShowGoogleExportButtons(
  configured: boolean | null,
  connected: boolean | null,
): boolean {
  if (configured === false) return false;
  return connected === true;
}

export function tableConversionOffer(): string {
  return "Would you like me to turn this into a table first?";
}

export function formConversionOffer(): string {
  return "Would you like me to turn this into form questions first?";
}
