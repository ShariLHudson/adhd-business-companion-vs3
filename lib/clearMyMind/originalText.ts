/**
 * Clear My Mind — original wording is authoritative for save and display.
 */

export type ClearMyMindTextFields = {
  /** Exact member wording (display + persist). */
  originalText: string;
  /** Optional analysis-only form — never shown as the task. */
  normalizedForAnalysis?: string;
};

/** Display value — always prefer original wording. */
export function displayClearMyMindText(entry: {
  text: string;
  originalText?: string;
}): string {
  const original = entry.originalText?.trim();
  if (original) return original;
  return entry.text;
}

/** Persist helper — never invent wording. */
export function preserveOriginalCaptureText(raw: string): string {
  // Only normalize line endings; do not alter characters inside the string.
  return raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}
