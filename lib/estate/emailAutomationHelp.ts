/**
 * Email automation / inbox help vs writing an email artifact.
 * Bare "email" must never open Create or Estate room menus.
 */

/** Member wants filters, junk reduction, inbox systems — not a drafted message. */
export const EMAIL_AUTOMATION_OR_INBOX_HELP_RE =
  /\b(?:automat(?:e|ing|ion)|filter(?:s|ing)?|rules?|junk|spam|unwanted|declutter|clean(?:ing)? up|get rid of|inbox(?:\s+management)?|email system)\b/i;

/** Clear intent to draft/compose a message. */
export const WRITE_EMAIL_CREATE_RE =
  /\b(?:write|draft|compose|send|craft)\b.{0,48}\b(?:an?\s+)?e-?mails?\b|\b(?:an?\s+)?e-?mail\s+to\b|\bhelp me (?:write|draft|compose)\b.{0,36}\be-?mails?\b|\bneed(?:s|ed)? to (?:write|draft|compose|send)\b.{0,36}\be-?mails?\b/i;

/** Member correcting a mistaken write-email flow. */
export const NOT_WRITING_EMAIL_RE =
  /\b(?:i(?:'?m| am) not (?:writing|drafting)|not writing (?:an? )?e-?mail|don'?t want to write (?:an? )?e-?mail|not (?:trying to )?write (?:an? )?e-?mail|i need e-?mail automation|automat(?:e|ion) help|not (?:an? )?e-?mail(?: writing)?)\b/i;

export function isEmailAutomationOrInboxHelpRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (WRITE_EMAIL_CREATE_RE.test(t)) return false;
  if (!/\be-?mails?\b|\binbox\b/i.test(t)) return false;
  return EMAIL_AUTOMATION_OR_INBOX_HELP_RE.test(t);
}

export function isWriteEmailCreateRequest(text: string): boolean {
  return WRITE_EMAIL_CREATE_RE.test(text.trim());
}

export function isNotWritingEmailCorrection(text: string): boolean {
  return NOT_WRITING_EMAIL_RE.test(text.trim());
}

/** Calm in-conversation reply — never rooms, never write-an-email discovery. */
export function buildEmailAutomationHelpReply(text: string): string | null {
  if (!isEmailAutomationOrInboxHelpRequest(text) && !isNotWritingEmailCorrection(text)) {
    return null;
  }
  return [
    "Got it — you want help automating and cleaning your inbox, not writing an email.",
    "",
    "A practical place to start:",
    "1. Filters/rules for senders and subjects that are always junk",
    "2. Unsubscribe and block for the repeat offenders",
    "3. A label or folder for anything that isn't action-needed today",
    "",
    "Which inbox do you use — Gmail, Outlook, or something else — and is the biggest pain spam, newsletters, or notifications?",
  ].join("\n");
}
