/**
 * 067 — Scrub unverified promises from member-facing copy.
 */

import {
  HONEST_PROMISE_ALTERNATIVES,
  detectConversationalPromises,
  isPromiseAllowed,
} from "./promises";
import type { PromiseEvidence } from "./types";

/**
 * Soften or remove claims that evidence cannot support.
 * Prefer rewriting known false patterns over deleting the whole message.
 */
export function scrubUnverifiedPromises(
  text: string,
  evidence: PromiseEvidence,
): string {
  let result = text.trim();
  if (!result) return result;

  if (!evidence.persistSucceeded) {
    result = result
      .replace(
        /\bGot it — I saved that with your other thoughts\.?/gi,
        HONEST_PROMISE_ALTERNATIVES.saved,
      )
      .replace(
        /\bI(?:'ve|’ve| have)? saved (?:that|this|it)\b[^.!?]*[.!?]?/gi,
        `${HONEST_PROMISE_ALTERNATIVES.saved} `,
      );
  }

  if (!evidence.workspaceVerified) {
    result = result
      .replace(
        /\bI(?:'ve|’ve| have)? opened[^.!?\n]*/gi,
        HONEST_PROMISE_ALTERNATIVES.opened,
      )
      .replace(
        /\b(?:Your \*\*[^*]+\*\* |Your Create )?workspace is open[^.!?\n]*/gi,
        HONEST_PROMISE_ALTERNATIVES.opened,
      );
  }

  if (!evidence.eventRecordBound && !evidence.persistSucceeded) {
    result = result.replace(
      /\bI(?:'ve|’ve| have)? created your (?:workshop|webinar|event|course)\b[^.!?]*/gi,
      "Let's work on this together",
    );
  }

  if (!evidence.resumeAvailable) {
    result = result.replace(
      /\bWe can continue wherever you left off\.?/gi,
      HONEST_PROMISE_ALTERNATIVES.continue,
    );
  }

  // Always strip UI mechanics that violate 066/067
  result = result
    .replace(/\bedit sections on the right\b/gi, "edit the sections here")
    .replace(/\bpanel on the right\b/gi, "workspace")
    .replace(/\bbeside (?:chat|your conversation)\b/gi, "with you")
    .replace(/\bsplit (?:view|screen)\b/gi, "workspace");

  return result.replace(/\s{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

/** True when text contains a promise that evidence cannot support. */
export function hasUnverifiedPromise(
  text: string,
  evidence: PromiseEvidence,
): boolean {
  return detectConversationalPromises(text).some(
    (p) => !isPromiseAllowed(p.kind, evidence),
  );
}
