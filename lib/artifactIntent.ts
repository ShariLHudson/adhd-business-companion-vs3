/**
 * Artifact-Intent Policy (centralized).
 *
 * Single source of truth for deciding whether a message is an actual request to
 * CREATE an artifact — vs. ordinary verb usage, a statement about an existing
 * artifact, an artifact expected FROM another person, or a mere mention.
 *
 * Both artifactRegistry (Create routing / execute override) and the
 * universalCreation plugin loop consume this policy. Each layer maps its own
 * matched term to an ArtifactCollisionClass and calls
 * `artifactTermExpressesCreation` — the collision reasoning lives here only.
 */

export type ArtifactCollisionClass =
  /** Term doubles as a common verb (email/offer/copy). Needs an explicit create verb. */
  | "verb_collision"
  /** Noun that can be received from someone (proposal/checklist). Keeps need-verb
   *  shorthand but excludes clear receive/request-from-someone language. */
  | "receive_noun"
  /** Term is often merely mentioned (presentation/article/workflow). Needs an
   *  explicit create verb — bare mention or need is not enough. */
  | "mention_requires_creation_signal"
  /** Clearly-named deliverable (marketing plan/landing page/SOP). Existing
   *  need-verb shorthand is preserved. */
  | "unambiguous_deliverable";

/** Base-form creation verbs (kept for the companion-first guard; re-exported by artifactRegistry). */
export const ARTIFACT_EXECUTE_VERB_RE =
  /\b(?:create|build|develop|design|draft|write|generate|make|produce|put together|map out)\b/i;

/** Weak need/intent verbs — proof of creation ONLY for unambiguous deliverables. */
export const ARTIFACT_NEED_VERB_RE =
  /\b(?:i need(?: a| to)?|want to|have to|need to|help me)\b/i;

/**
 * Explicit creation verbs INCLUDING participle forms ("an email drafted", "a
 * proposal written", "a checklist prepared"). Superset of the base execute set.
 * A create verb here is the strongest signal and always proves execution.
 */
export const ARTIFACT_CREATE_VERB_RE =
  /\b(?:creat(?:e|es|ing|ed)|writ(?:e|es|ing|ten)|draft(?:s|ing|ed)?|compos(?:e|es|ing|ed)|build(?:s|ing)?|built|design(?:s|ing|ed)?|generat(?:e|es|ing|ed)|mak(?:e|es|ing)|made|produc(?:e|es|ing|ed)|prepar(?:e|es|ing|ed)|put\s+together|map(?:s|ping)?\s+out)\b/i;

/**
 * Narrow "expected from someone else" language. Deliberately does NOT match a
 * bare "by" (to avoid excluding "a proposal by friday" deadlines) nor
 * "from scratch"/"from now"/"from here" (which are creation idioms).
 */
export const ARTIFACT_RECEIVE_LANGUAGE_RE =
  /\bfrom\s+(?!scratch\b|now\b|here\b)\w|\bwaiting\s+for\b|\bask(?:ing|ed|s)?\b[^.?!]{0,40}\bfor\b/i;

export function hasArtifactCreateVerb(text: string): boolean {
  return ARTIFACT_CREATE_VERB_RE.test(text.trim());
}

export function hasArtifactNeedVerb(text: string): boolean {
  return ARTIFACT_NEED_VERB_RE.test(text.trim());
}

export function hasArtifactReceiveLanguage(text: string): boolean {
  return ARTIFACT_RECEIVE_LANGUAGE_RE.test(text.trim());
}

/**
 * The single decision: given a message and the collision class of the artifact
 * term it matched, does it express an actual creation request?
 *
 * An explicit creation verb (incl. participles) always wins. Otherwise the
 * class decides how much a bare need-verb is trusted.
 */
export function artifactTermExpressesCreation(input: {
  text: string;
  collisionClass: ArtifactCollisionClass;
}): boolean {
  const text = input.text.trim();
  if (!text) return false;

  // Explicit creation verb (create/write/draft/compose/design/…/prepared) —
  // strongest signal, always proves execution regardless of class.
  if (hasArtifactCreateVerb(text)) return true;

  switch (input.collisionClass) {
    case "verb_collision":
    case "mention_requires_creation_signal":
      // Verb-sense ("email the accountant") or mention ("I read an article",
      // "I have a presentation tomorrow") — require an explicit create verb.
      return false;
    case "receive_noun":
      // Preserve "I need a proposal" / "help me with a checklist" shorthand,
      // but not "a proposal from the vendor" / "waiting for" / "ask … for".
      if (hasArtifactReceiveLanguage(text)) return false;
      return hasArtifactNeedVerb(text);
    case "unambiguous_deliverable":
      // "I need a marketing plan / landing page / SOP" — shorthand preserved.
      return hasArtifactNeedVerb(text);
    default: {
      const _exhaustive: never = input.collisionClass;
      return _exhaustive;
    }
  }
}
