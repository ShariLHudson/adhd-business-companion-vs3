/**
 * 067 — Detect unverified conversational promises.
 */

import type { PromiseEvidence, PromiseKind } from "./types";

export type DetectedPromise = {
  kind: PromiseKind;
  match: string;
};

const PROMISE_PATTERNS: { kind: PromiseKind; re: RegExp }[] = [
  {
    kind: "saved",
    re: /\bI(?:'ve|’ve| have)? saved\b|\bI saved that\b|\bGot it — I saved\b/i,
  },
  {
    kind: "created",
    re: /\bI(?:'ve|’ve| have)? created\b/i,
  },
  {
    kind: "opened",
    re: /\bI(?:'ve|’ve| have)? opened\b|\bis open(?:ed)?\b/i,
  },
  {
    kind: "organized",
    re: /\bI(?:'ve|’ve| have)? organized\b/i,
  },
  {
    kind: "added",
    re: /\bI(?:'ve|’ve| have)? added\b/i,
  },
  {
    kind: "updated",
    re: /\bI(?:'ve|’ve| have)? updated\b/i,
  },
  {
    kind: "remembered",
    re: /\bI remember\b|\bI(?:'ve|’ve) remembered\b/i,
  },
  {
    kind: "continue",
    re: /\bWe can continue wherever\b|\bContinue\?\s*$/i,
  },
  {
    kind: "ui_mechanics",
    re: /\bon the right\b|\bbeside (?:chat|your conversation)\b|\bsplit (?:view|screen)\b|\bpanel on the right\b/i,
  },
];

export function detectConversationalPromises(text: string): DetectedPromise[] {
  const found: DetectedPromise[] = [];
  for (const { kind, re } of PROMISE_PATTERNS) {
    const m = text.match(re);
    if (m?.[0]) {
      found.push({ kind, match: m[0] });
    }
  }
  return found;
}

export function isPromiseAllowed(
  kind: PromiseKind,
  evidence: PromiseEvidence,
): boolean {
  switch (kind) {
    case "opened":
      return Boolean(evidence.workspaceVerified);
    case "created":
      return Boolean(evidence.eventRecordBound || evidence.persistSucceeded);
    case "saved":
    case "added":
    case "updated":
      return Boolean(evidence.persistSucceeded);
    case "organized":
      return Boolean(evidence.factsOrganized || evidence.eventRecordBound);
    case "remembered":
      return Boolean(evidence.memoryConfirmed);
    case "continue":
      return Boolean(evidence.resumeAvailable);
    case "ui_mechanics":
      return false;
    default:
      return false;
  }
}

/** Honest alternatives when evidence is missing. */
export const HONEST_PROMISE_ALTERNATIVES: Record<PromiseKind, string> = {
  created:
    "I want to make sure we start this in the right place. Tell me a little more about what you're planning.",
  opened: "Let's step into the workspace together when you're ready.",
  saved:
    "I heard that. It isn't saved in Clear My Mind yet — want me to capture it there?",
  remembered: "Tell me again so I have it right — I don't want to guess.",
  continue: "I'm glad you're here. What would help most right now?",
  organized: "Here's what I understand so far — does this feel right?",
  added: "Want me to put that into the workspace?",
  updated: "Want me to update that in the workspace?",
  ui_mechanics: "Let's work on it together.",
};
