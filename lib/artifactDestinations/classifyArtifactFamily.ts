import type { ArtifactFamily } from "./types";

/**
 * Classify creation/draft artifact type into a destination family.
 * Prefer explicit type labels; content is a light secondary signal only.
 *
 * Guided packages (Event Plan, Workshop, Marketing Plan, Business Plan,
 * Facebook Community) are document-style plans — not spreadsheets/calendars —
 * unless a true spreadsheet/calendar-event type is present.
 */

/** Document-style guided packages that may also offer calendar destinations. */
export function isGuidedEventPlanDocumentType(
  artifactType: string | null | undefined,
): boolean {
  const t = (artifactType ?? "").trim().toLowerCase();
  return /\b(event plan|workshop plan|workshop outline|workshop)\b/.test(t);
}

export function isGuidedDocumentPackageType(
  artifactType: string | null | undefined,
): boolean {
  const t = (artifactType ?? "").trim().toLowerCase();
  return (
    isGuidedEventPlanDocumentType(t) ||
    /\b(marketing plan|business plan|facebook community|community plan)\b/.test(
      t,
    )
  );
}

export function classifyArtifactFamily(
  artifactType: string | null | undefined,
  content = "",
): ArtifactFamily {
  const t = (artifactType ?? "").trim().toLowerCase();
  const head = content.slice(0, 800).toLowerCase();

  if (
    /\b(google\s*form|questionnaire|intake|survey|quiz|registration form)\b/.test(
      t,
    ) ||
    /\b(questionnaire|intake|survey form)\b/.test(head)
  ) {
    return "form";
  }

  // True spreadsheet artifacts only — not plans that mention tables.
  if (
    /\b(spreadsheet|excel workbook|csv export|budget table|data table)\b/.test(
      t,
    ) ||
    (t === "sheet" || t === "sheets" || /\bgoogle sheets\b/.test(t)) ||
    (/\b(spreadsheet|excel)\b/.test(head) &&
      content.split("\n").filter((l) => l.includes("|")).length >= 4 &&
      !isGuidedDocumentPackageType(t))
  ) {
    return "spreadsheet";
  }

  // Content calendars + guided packages are documents (planning docs).
  if (
    /\b(content calendar|editorial calendar|posting calendar)\b/.test(t) ||
    isGuidedDocumentPackageType(t)
  ) {
    return "document";
  }

  // True calendar / schedule items (not Event Plan / Workshop packages).
  if (
    /\b(calendar event|appointment|schedule item|outlook event|google calendar event)\b/.test(
      t,
    ) ||
    (t === "event" || t === "meeting") ||
    (/\b(event date|starts at|add to calendar)\b/.test(head) &&
      /\b(calendar event|appointment|meeting)\b/.test(t))
  ) {
    return "calendar";
  }

  if (
    /\b(presentation|powerpoint|slides|pitch deck|canva)\b/.test(t) ||
    /\b(slide\s*\d+|pitch deck)\b/.test(head)
  ) {
    return "presentation";
  }

  if (/\b(image|photo|graphic|png|jpg|poster)\b/.test(t)) {
    return "image";
  }

  if (
    /\b(document|doc|proposal|email|plan|sop|script|guide|page|post|letter|brief|report|policy|outline|article|blog|workshop|agenda)\b/.test(
      t,
    ) ||
    t.length > 0
  ) {
    return "document";
  }

  return "other";
}
