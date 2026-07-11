/**
 * Evidence Intelligence (245–248) — binding constants + detection.
 *
 * Vault = proof for hard days ("Remember who you are.")
 * Hall = major milestones ("Look what you've accomplished.")
 * Capture = permission-first "Would you like to save this?"
 */

export const EVIDENCE_INTELLIGENCE_CORE_EXPERIENCES = [
  "Evidence Vault",
  "Hall of Accomplishments",
  "Celebration Garden",
  "Gratitude Collection",
  "Wins Timeline",
  "Confidence Recovery",
] as const;

export const EVIDENCE_INTELLIGENCE_GUIDING_PRINCIPLE =
  "When members doubt themselves, Spark responds with evidence instead of empty encouragement." as const;

export const EVIDENCE_INTELLIGENCE_UNIVERSAL_RULES = [
  "Capture evidence naturally.",
  "Never force saving.",
  "Make retrieval effortless.",
  "Use evidence to restore confidence, not inflate ego.",
] as const;

/** 248 — Evidence Vault emotional role */
export const EVIDENCE_VAULT_EMOTIONAL_ROLE = "Remember who you are." as const;

/** 247 — Hall of Accomplishments emotional role */
export const HALL_OF_ACCOMPLISHMENTS_EMOTIONAL_ROLE =
  "Look what you've accomplished." as const;

/** 246 — permission prompt (exact) */
export const EVIDENCE_CAPTURE_PROMPT = "Would you like to save this?" as const;

export const EVIDENCE_CAPTURE_DESTINATIONS = [
  { id: "evidence-vault", label: "Evidence Vault" },
  { id: "hall-of-accomplishments", label: "Hall of Accomplishments" },
  { id: "both", label: "Both" },
  { id: "not-now", label: "Not now" },
] as const;

/** 246 — moments worth saving */
export const EVIDENCE_CAPTURE_MOMENT_EXAMPLES = [
  "Thank-you messages",
  "Client testimonials",
  "Finished projects",
  "Personal breakthroughs",
  "Positive journal entries",
  "Kind words",
  "Before/after stories",
  "Milestones",
] as const;

/** 248 — Vault example types */
export const EVIDENCE_VAULT_EXAMPLE_TYPES = [
  "Encouraging emails",
  "Testimonials",
  "Small wins",
  "Gratitude",
  "Progress",
  "Problems solved",
  "Lives impacted",
] as const;

/** 247 — Hall example types */
export const HALL_OF_ACCOMPLISHMENTS_EXAMPLE_TYPES = [
  "Degrees",
  "Certifications",
  "Businesses",
  "Books",
  "Awards",
  "Launches",
  "Career milestones",
  "Personal victories",
] as const;

/**
 * Detect moments worth offering a save (246).
 * Permission-first — never auto-save.
 */
const EVIDENCE_MOMENT_RE =
  /\b(?:thank[\s-]*you|thanks\s+so\s+much|testimonial|kind\s+words?|encouraging\s+(?:email|message|note)|before\s*(?:and|\/)\s*after|breakthrough|finished\s+(?:the\s+)?project|milestone|client\s+(?:said|wrote|thanked)|they\s+said\s+(?:i|you)|positive\s+(?:feedback|review)|problem\s+(?:i\s+)?solved|lives?\s+impacted)\b/i;

const HALL_MOMENT_RE =
  /\b(?:graduated|degree|certification|certified|published\s+(?:a\s+)?book|won\s+(?:an?\s+)?award|launched\s+(?:my\s+)?(?:business|product|offer)|opened\s+(?:my\s+)?business|career\s+milestone|personal\s+victor(?:y|ies))\b/i;

export function detectsEvidenceCaptureMoment(text: string): boolean {
  const t = text.trim();
  if (t.length < 12) return false;
  return EVIDENCE_MOMENT_RE.test(t) || HALL_MOMENT_RE.test(t);
}

export function suggestsHallOverVault(text: string): boolean {
  return HALL_MOMENT_RE.test(text.trim());
}

/** 248/251 — discouragement / fear / self-doubt / recovery triggers → evidence */
const VAULT_RECOMMEND_RE =
  /\b(?:discouraged|self-?doubt|doubt(?:ing)?\s+myself|afraid\s+i\s+can'?t|fear(?:ing)?\s+(?:i|that)|imposter|don'?t\s+believe\s+in\s+myself|feeling\s+(?:defeated|worthless|inadequate)|i\s+need\s+encouragement|remind\s+me\s+who\s+i\s+am|i\s+can'?t\s+do\s+this|i'?m\s+overwhelmed|i'?m\s+failing|nothing\s+is\s+working)\b/i;

export function shouldRecommendEvidenceVault(text: string): boolean {
  return VAULT_RECOMMEND_RE.test(text.trim());
}

export function formatEvidenceCaptureOfferMessage(): string {
  return [
    EVIDENCE_CAPTURE_PROMPT,
    "",
    ...EVIDENCE_CAPTURE_DESTINATIONS.map(
      (d, i) => `${i + 1}. ${d.label}`,
    ),
    "",
    "Reply with a number or option name.",
  ].join("\n");
}
