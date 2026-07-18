/**
 * Package 208 — Topic fidelity: background ≠ topic; corrections restore anchor.
 */

import { detectsExplicitTopicChange } from "@/lib/topicContinuityAnchorIntelligence/topicChangeDetection";

const DESIGN_PLATFORM =
  /\b(?:design(?:ing)?|build(?:ing)?|creat(?:e|ing)|launch(?:ing)?)\b.*\b(?:platform|app|product|business)\b|\b(?:platform|app|product)\b.*\b(?:design|build|creat|launch)\b/i;

const MARKETING_REASON =
  /\b(?:need people to know|get (?:the )?word out|discover(?:ed)?|buy memberships|market(?:ing)? the (?:app|platform|product)|people to know about)\b/i;

const HIRE_TOPIC = /\bhir|market(?:ing)?|sales|assistant|bookkeep/i;

/**
 * True when the user is elaborating why / context for the active topic,
 * not replacing it (Rule 1 — background is not the topic).
 */
export function isBackgroundElaboration(
  userText: string,
  activeTopic: string | null | undefined,
): boolean {
  const topic = activeTopic?.trim() ?? "";
  if (!topic) return false;
  const t = userText.trim();
  if (!t || detectsExplicitTopicChange(t)) return false;

  const topicHire = HIRE_TOPIC.test(topic);
  if (!topicHire) return false;

  // Explicit "because / so that / I'm building…" as support for the hire question
  if (
    /\b(?:because|so that|in order to|the reason|i(?:'m| am) (?:building|designing|creating|launching)|and need)\b/i.test(
      t,
    ) &&
    (DESIGN_PLATFORM.test(t) || MARKETING_REASON.test(t))
  ) {
    return true;
  }

  // Platform + awareness without hiring language → still background for hire topic
  if (
    DESIGN_PLATFORM.test(t) &&
    MARKETING_REASON.test(t) &&
    !/\binstead\b/i.test(t)
  ) {
    return true;
  }

  if (MARKETING_REASON.test(t) && !/\binstead\b/i.test(t)) {
    return true;
  }

  return false;
}

/**
 * User rejects a misread subject ("nothing to do with designing…").
 */
export function extractRejectedSubject(userText: string): string | null {
  const t = userText.trim();
  if (!t) return null;

  const nothing = t.match(
    /\b(?:has|have|it has|this has)?\s*nothing to do with\s+([^,.!?;]+)/i,
  );
  if (nothing?.[1]) {
    return nothing[1].trim().slice(0, 80);
  }

  const notAbout = t.match(
    /\b(?:not|isn'?t|is not)\s+(?:really\s+)?about\s+([^,.!?;]+)/i,
  );
  if (notAbout?.[1]) {
    return notAbout[1].trim().slice(0, 80);
  }

  if (
    /\b(?:you(?:'re| are) misunderstanding|that(?:'s| is) not what i meant|you(?:'re| are) misunderstanding)\b/i.test(
      t,
    )
  ) {
    return "prior interpretation";
  }

  return null;
}

export function detectsTopicSubjectRejection(userText: string): boolean {
  return Boolean(extractRejectedSubject(userText));
}

/** Prefer a hiring-related topic from history when design/platform was wrongly adopted. */
export function recoverPreferredTopicFromHistory(
  history: readonly string[],
  rejectedSubject: string | null,
): string | null {
  const rejected = (rejectedSubject ?? "").toLowerCase();
  const rejectsDesign =
    /\bdesign|platform|build|creat|product|app\b/.test(rejected) ||
    rejected === "prior interpretation";

  for (let i = history.length - 1; i >= 0; i--) {
    const h = history[i]?.trim();
    if (!h) continue;
    if (rejectsDesign && HIRE_TOPIC.test(h) && !DESIGN_PLATFORM.test(h)) {
      return h;
    }
  }
  for (let i = history.length - 1; i >= 0; i--) {
    const h = history[i]?.trim();
    if (h && HIRE_TOPIC.test(h)) return h;
  }
  return null;
}

/**
 * Response centers on rejected background (e.g. platform design) while
 * hire/marketing is the active topic → topic fidelity failure.
 */
export function responseCentersOnRejectedBackground(input: {
  responseText: string;
  activeTopic: string | null | undefined;
  rejectedSubjects?: readonly string[];
}): boolean {
  const topic = input.activeTopic?.trim() ?? "";
  if (!topic || !HIRE_TOPIC.test(topic)) return false;

  const text = input.responseText.toLowerCase();
  const centersDesign =
    /\b(?:design(?:ing)? (?:your |the )?(?:platform|app|product)|stay with design|platform itself|building (?:your |the )?platform)\b/i.test(
      text,
    ) && !/\b(?:market(?:ing)?|hir(?:e|ing)|discover|membership)\b/i.test(text);

  if (centersDesign) return true;

  for (const rejected of input.rejectedSubjects ?? []) {
    const stem = rejected.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
    const words = stem.split(/\s+/).filter((w) => w.length >= 5);
    if (words.length === 0) continue;
    const hits = words.filter((w) => text.includes(w));
    if (
      hits.length >= Math.min(2, words.length) &&
      !HIRE_TOPIC.test(text)
    ) {
      return true;
    }
  }
  return false;
}
