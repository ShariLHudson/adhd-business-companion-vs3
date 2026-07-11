/**
 * Content ownership — determines whether content may be auto-translated.
 *
 * @see docs/architecture/ARCH-011_LANGUAGE_AND_TRANSLATION_ARCHITECTURE.md
 */

import type { ContentOwnership } from "./types";

/** Member journals, evidence, brain dumps, etc. — never silently rewritten. */
export function shouldAutoTranslateMemberContent(): boolean {
  return false;
}

export function isSparkOwnedContent(ownership: ContentOwnership): boolean {
  return ownership === "spark-owned";
}

export function isMemberOwnedContent(ownership: ContentOwnership): boolean {
  return ownership === "member-owned";
}
