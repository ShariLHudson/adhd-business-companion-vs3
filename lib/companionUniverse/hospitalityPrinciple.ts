import type { CompanionPlaceId } from "./types";

/**
 * The Hospitality Principle
 * My Home. Prepared For You.
 *
 * Product-wide emotional OS: Spec 111 — docs/SPARK_HOSPITALITY_FRAMEWORK.md
 * This module: homestead arrival hospitality implementation.
 *
 * The Companion Homestead is always Shari's home.
 * It is never rebuilt around the visitor.
 * What changes is how the home is prepared before someone arrives.
 *
 * Hospitality — not personalization.
 * The home belongs to Shari. The welcome belongs to the guest.
 */
export const HOSPITALITY_PRINCIPLE = {
  title: "The Hospitality Principle",
  subtitle: "My Home. Prepared For You.",
  guestShouldFeel: "She remembered me.",
  mustNeverFeel: "The app customized itself.",
  vision:
    "Visiting the home of someone who knows you well — not a house that changes its identity to match yours.",
  homeBelongsTo: "Shari",
  welcomeBelongsTo: "the guest",
  guestRole: "welcome guest",
} as const;

/** What never changes when someone arrives — Shari's familiar home. */
export const SHARI_HOME_ANCHORS = [
  "Rooms remain familiar",
  "Architecture remains consistent",
  "Personality remains unmistakably Shari",
  "The photograph is Shari's real home",
  "Signature objects belong to each place",
] as const;

/** What may change — thoughtful preparation before arrival. */
export const PREPARATION_EXAMPLES = [
  "Tea for one friend, coffee for another",
  "Fresh flowers when celebration fits",
  "Cookies during the holidays",
  "A birthday card on the table",
  "A candle on a rainy afternoon",
  "A blanket when winter asks for warmth",
] as const;

export type HospitalityPrincipleId =
  | "sharis-home-unchanged"
  | "preparation-not-rebuild"
  | "host-voice-not-app-voice"
  | "remembered-not-customized"
  | "welcome-belongs-to-guest";

export type HospitalityPrincipleCheck = {
  id: HospitalityPrincipleId;
  passed: boolean;
  reason?: string;
};

export type HospitalityPreparation = {
  /** What Shari set out before arrival — never UI chrome. */
  prepared: string[];
  /** Familiar anchors that did not change. */
  unchanged: readonly string[];
  /** One-line host summary for debug / Director's Studio. */
  summary: string;
};

export type HospitalityPrincipleEvaluation = {
  principle: typeof HOSPITALITY_PRINCIPLE;
  preparation: HospitalityPreparation;
  checks: HospitalityPrincipleCheck[];
  passed: boolean;
  guestShouldFeel: string;
  mustNeverFeel: string;
};

/** Copy that breaks the illusion of a real host — app personalization voice. */
export const FORBIDDEN_PERSONALIZATION_PATTERNS: RegExp[] = [
  /\bcustomiz(e|ed|ation|ing)\b/i,
  /\bpersonaliz(e|ed|ation|ing)\b/i,
  /\bbuilt around you\b/i,
  /\byour unique (experience|interface|dashboard)\b/i,
  /\bwe adapted the app\b/i,
  /\btailored (for|to) you\b/i,
  /\bconfigured for you\b/i,
  /\byour personalized\b/i,
];

export type HospitalityPrincipleContext = {
  placeId: CompanionPlaceId;
  greeting?: string;
  invite?: string;
  atmosphere?: string;
  preparedItems?: string[];
};

function copyFields(ctx: HospitalityPrincipleContext): string[] {
  return [ctx.greeting, ctx.invite, ctx.atmosphere].filter(
    (value): value is string => Boolean(value?.trim()),
  );
}

export function copyUsesPersonalizationVoice(text: string): boolean {
  return FORBIDDEN_PERSONALIZATION_PATTERNS.some((pattern) => pattern.test(text));
}

export function findPersonalizationViolations(
  ctx: HospitalityPrincipleContext,
): string[] {
  const violations: string[] = [];
  for (const field of copyFields(ctx)) {
    if (copyUsesPersonalizationVoice(field)) {
      violations.push(field);
    }
  }
  return violations;
}

export function describePreparation(preparedItems: string[]): HospitalityPreparation {
  const prepared = preparedItems.filter(Boolean);
  const summary =
    prepared.length > 0
      ? `Shari prepared: ${prepared.join(", ")}`
      : "The room is familiar — quietly ready";

  return {
    prepared,
    unchanged: SHARI_HOME_ANCHORS,
    summary,
  };
}

/**
 * Evaluate whether a resolved scene honors The Hospitality Principle.
 * The home stays Shari's; only preparation and welcome change.
 */
export function evaluateHospitalityPrinciple(
  ctx: HospitalityPrincipleContext,
): HospitalityPrincipleEvaluation {
  const preparation = describePreparation(ctx.preparedItems ?? []);
  const violations = findPersonalizationViolations(ctx);
  const checks: HospitalityPrincipleCheck[] = [
    {
      id: "sharis-home-unchanged",
      passed: Boolean(ctx.placeId),
      reason: "Place remains one of Shari's permanent rooms",
    },
    {
      id: "preparation-not-rebuild",
      passed: true,
      reason: "Only hospitality layers change — not architecture or personality",
    },
    {
      id: "host-voice-not-app-voice",
      passed: violations.length === 0,
      reason:
        violations.length > 0
          ? "Copy must sound like Shari prepared the room — not like software customized itself"
          : undefined,
    },
    {
      id: "remembered-not-customized",
      passed: violations.length === 0,
      reason:
        violations.length > 0
          ? `Avoid personalization framing — guest should feel "${HOSPITALITY_PRINCIPLE.guestShouldFeel}"`
          : undefined,
    },
    {
      id: "welcome-belongs-to-guest",
      passed: Boolean(ctx.greeting?.trim() || ctx.invite?.trim()),
      reason: "Greeting and invite belong to the guest's welcome",
    },
  ];

  return {
    principle: HOSPITALITY_PRINCIPLE,
    preparation,
    checks,
    passed: checks.every((check) => check.passed),
    guestShouldFeel: HOSPITALITY_PRINCIPLE.guestShouldFeel,
    mustNeverFeel: HOSPITALITY_PRINCIPLE.mustNeverFeel,
  };
}

export function hospitalityPrinciplePassed(
  evaluation: HospitalityPrincipleEvaluation,
): boolean {
  return evaluation.passed;
}
