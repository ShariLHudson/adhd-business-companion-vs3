/**
 * Explicit force-new Creation intent.
 * Overrides resume-by-default and duplicate protection when the member asks
 * for a separate new workspace — without removing those protections for
 * ambiguous Create entry.
 */

/** Member phrases that must start a brand-new Creation Workspace. */
export const FORCE_NEW_CREATION_RE =
  /\b(?:start something new|brand new(?:\s+(?:separate\s+)?)?(?:workspace|creation|workshop|document|project)?|new workspace|separate workspace|create another|don'?t continue(?:\s+the\s+current\s+one)?|do not continue(?:\s+the\s+current\s+one)?|begin a different(?:\s+(?:document|project|workshop|creation|workspace))?|a different(?:\s+(?:document|project|workshop))?(?:\s+workspace)?|fresh(?:\s+new)?(?:\s+workspace)?|start fresh|new creation)\b/i;

export function isForceNewCreationRequest(text: string): boolean {
  return FORCE_NEW_CREATION_RE.test(text.trim());
}

/**
 * Chat / UI acknowledgment when force-new wins.
 * Never “continue where we left off” language.
 */
export const FORCE_NEW_CREATION_ACKNOWLEDGMENT =
  "Understood — starting a separate new creation. We won't continue the current one." as const;

export function forceNewCreationAcknowledgment(): string {
  return FORCE_NEW_CREATION_ACKNOWLEDGMENT;
}

/** True when assistant copy claims resume of prior work. */
export function containsResumeClaimCopy(text: string): boolean {
  return /\b(?:continue where (?:we|you) left off|welcome back|i(?:'ve| have) reopened|pick up where|back to your)\b/i.test(
    text,
  );
}
