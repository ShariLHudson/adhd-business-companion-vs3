import type { ArtifactFamily } from "./types";

/**
 * Classify creation/draft artifact type into a destination family.
 * Prefer explicit type labels; content is a light secondary signal only.
 */
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

  if (
    /\b(spreadsheet|sheet|excel|csv|budget table|data table)\b/.test(t) ||
    (/\b(spreadsheet|excel)\b/.test(head) &&
      content.split("\n").filter((l) => l.includes("|")).length >= 4)
  ) {
    return "spreadsheet";
  }

  // Content calendars are documents (planning docs), not calendar events.
  if (
    /\b(content calendar|editorial calendar|posting calendar)\b/.test(t)
  ) {
    return "document";
  }

  if (
    /\b(calendar event|event|workshop agenda|webinar|meeting|appointment|schedule item)\b/.test(
      t,
    ) ||
    (/\b(event date|starts at|add to calendar)\b/.test(head) &&
      /\b(event|workshop|webinar|meeting)\b/.test(t))
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
    /\b(document|doc|proposal|email|plan|sop|script|guide|page|post|letter|brief|report|policy|outline|article|blog)\b/.test(
      t,
    ) ||
    t.length > 0
  ) {
    return "document";
  }

  return "other";
}
