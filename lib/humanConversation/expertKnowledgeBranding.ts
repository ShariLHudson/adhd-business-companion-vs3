/**
 * Spec 136 — Global Expert Knowledge and Branding Rule.
 * Synthesize research internally; do not name-drop experts at runtime
 * unless the member asks or attribution is required.
 *
 * @see docs/SPARK_EXPERT_KNOWLEDGE_AND_BRANDING_RULE.md
 */

export const SPARK_EXPERT_KNOWLEDGE_BRANDING_PROMPT = `# EXPERT KNOWLEDGE BRANDING (permanent)

Spark Estate synthesizes world-class research, frameworks, and proven methods into one trusted companion voice.

At runtime:
- Do NOT attribute guidance to individual named experts ("According to…", "Stephen Covey says…", "As Brené Brown teaches…", "Eisenhower Matrix by Dwight Eisenhower…").
- Present the idea as Spark Estate's integrated expertise: "A proven approach is…" / "What usually helps is…"
- Chamber and Board expertise integrates invisibly into Shari's one voice — never a faculty panel of citations.

Exceptions (only then may you name a person or source):
- the member explicitly asks who created, originated, or said something
- legal / citation requirement
- discussing the history of an idea when that history is the point` as const;

/** Member asked for origin / citation — allow named attribution. */
const MEMBER_ASKED_FOR_SOURCE_RE =
  /\b(?:who\s+(?:said|created|invented|originated|came\s+up\s+with|teaches?|wrote|coined)|according\s+to\s+whom|what(?:'s| is)\s+the\s+source|cite|citation|attribute(?:d)?\s+to|who\s+is\s+(?:that|this)\s+(?:from|by))\b/i;

export function memberRequestedExpertAttribution(userText?: string): boolean {
  if (!userText?.trim()) return false;
  return MEMBER_ASKED_FOR_SOURCE_RE.test(userText);
}

/**
 * Attribution wrappers to strip when the member did not ask for a source.
 * Keep the guidance; remove the named-expert scaffolding.
 */
const ATTRIBUTION_SCRUBS: readonly [RegExp, string][] = [
  [
    /\baccording to\s+[A-ZÀ-ÖØ-Þ][\w'.-]*(?:\s+[A-ZÀ-ÖØ-Þ][\w'.-]*){0,3}[,:]?\s*/gi,
    "",
  ],
  [
    /\bas\s+[A-ZÀ-ÖØ-Þ][\w'.-]*(?:\s+[A-ZÀ-ÖØ-Þ][\w'.-]*){0,2}\s+(?:teaches?|says?|recommends?|suggests?|writes?|explains?|notes?)[,:]?\s*/gi,
    "",
  ],
  [
    /\b(?:stephen\s+)?covey\s+(?:says?|recommends?|teaches?|suggests?)[,:]?\s*/gi,
    "A proven approach is to ",
  ],
  [
    /\b(?:bren[eé]\s+)?brown\s+(?:says?|teaches?|reminds?\s+us|recommends?)[,:]?\s*/gi,
    "",
  ],
  [
    /\bthe\s+eisenhower\s+matrix\s+by\s+(?:dwight\s+)?eisenhower\b/gi,
    "a proven priority matrix",
  ],
  [
    /\b(?:dwight\s+)?eisenhower(?:'s)?\s+(?:matrix|method|principle)\b/gi,
    "a proven priority approach",
  ],
  [
    /\b[A-ZÀ-ÖØ-Þ][\w'.-]+(?:\s+[A-ZÀ-ÖØ-Þ][\w'.-]*){0,2}\s+(?:says?|recommends?|teaches?|suggests?)[,:]?\s+(?=[a-z])/g,
    "",
  ],
];

const ATTRIBUTION_DETECT: readonly RegExp[] = [
  /\baccording to\s+[A-ZÀ-ÖØ-Þ]/i,
  /\bas\s+[A-ZÀ-ÖØ-Þ][\w'.-]+(?:\s+[A-ZÀ-ÖØ-Þ][\w'.-]*){0,2}\s+(?:teaches?|says?|recommends?)\b/i,
  /\b(?:stephen\s+)?covey\s+(?:says?|recommends?|teaches?)\b/i,
  /\b(?:bren[eé]\s+)?brown\s+(?:says?|teaches?)\b/i,
  /\beisenhower\s+matrix\s+by\b/i,
];

export type ExpertAttributionIssue = {
  kind: "named_expert_attribution";
  detail: string;
};

export function detectExpertAttributionIssues(
  response: string,
  userText?: string,
): ExpertAttributionIssue[] {
  if (memberRequestedExpertAttribution(userText)) return [];
  const issues: ExpertAttributionIssue[] = [];
  for (const pattern of ATTRIBUTION_DETECT) {
    if (pattern.test(response)) {
      issues.push({
        kind: "named_expert_attribution",
        detail: pattern.source,
      });
    }
  }
  return issues;
}

export function scrubExpertAttribution(
  text: string,
  userText?: string,
): { text: string; rewritten: boolean } {
  if (memberRequestedExpertAttribution(userText)) {
    return { text, rewritten: false };
  }

  let rewritten = false;
  let out = text;
  for (const [pattern, replacement] of ATTRIBUTION_SCRUBS) {
    if (pattern.test(out)) {
      rewritten = true;
      out = out.replace(pattern, replacement);
    }
  }

  if (rewritten) {
    out = out
      .replace(/\s{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/^[,:\s]+/gm, "")
      .trim();
  }

  return { text: out, rewritten };
}
