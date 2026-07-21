/**
 * Strip instance-specific data before save-as-Blueprint.
 */

const DATE_LIKE =
  /\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:,\s*\d{4})?)\b/gi;

const EMAIL_LIKE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

const PHONE_LIKE = /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;

/** Common completed-state markers to strip unless retained. */
const COMPLETED_MARKERS =
  /\b(?:completed|done|finished|checked off|✓|✔)\b/gi;

export type SanitizeOptions = {
  /** Keys explicitly retained by the member (e.g. venue name). */
  retainKeys?: readonly string[];
  /** Extra name tokens to redact (hosts, clients). */
  confidentialTokens?: readonly string[];
};

export function sanitizeInstanceSpecificContent(
  sectionContent: Record<string, string>,
  options: SanitizeOptions = {},
): {
  sanitized: Record<string, string>;
  removedFields: string[];
  requiresExplicitRetain: string[];
} {
  const retain = new Set(options.retainKeys ?? []);
  const removedFields: string[] = [];
  const requiresExplicitRetain: string[] = [];
  const sanitized: Record<string, string> = {};

  for (const [key, raw] of Object.entries(sectionContent)) {
    if (retain.has(key)) {
      sanitized[key] = raw;
      continue;
    }

    let text = raw ?? "";
    const before = text;

    if (/\bdates?\b/i.test(key) || /date|time|schedule/i.test(key)) {
      if (text.trim()) {
        requiresExplicitRetain.push(key);
        text = "";
        removedFields.push(key);
      }
    }

    text = text.replace(DATE_LIKE, "[date]");
    text = text.replace(EMAIL_LIKE, "[email]");
    text = text.replace(PHONE_LIKE, "[phone]");
    text = text.replace(COMPLETED_MARKERS, "");

    for (const token of options.confidentialTokens ?? []) {
      const t = token.trim();
      if (!t) continue;
      text = text.split(t).join("[name]");
    }

    // Instance-specific section keys often hold names.
    if (
      /(?:host|client|contact|speaker_name|attendee_list)/i.test(key) &&
      before.trim() &&
      !retain.has(key)
    ) {
      requiresExplicitRetain.push(key);
      text = "";
      if (!removedFields.includes(key)) removedFields.push(key);
    }

    sanitized[key] = text.trim();
  }

  return {
    sanitized,
    removedFields: [...new Set(removedFields)],
    requiresExplicitRetain: [...new Set(requiresExplicitRetain)],
  };
}
