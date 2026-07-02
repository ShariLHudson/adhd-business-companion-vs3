/**
 * Estate Member Need Index™ — unified need → place phrase index (Phase 1).
 *
 * Members speak in needs, not room names. This index is the additive foundation
 * for conversation-accurate routing. Legacy matchers remain until Phase 2.
 *
 * @see docs/estate/SPARK_ESTATE_MASTER_PLAN.md
 */

import { resolvePlaceId } from "./placeIdAliases";

export type MemberNeedId =
  | "express"
  | "reflect"
  | "restore"
  | "celebrate"
  | "prove"
  | "capture"
  | "learn"
  | "create"
  | "plan"
  | "play";

export type EstateNavigationMode =
  | "none"
  | "suggest"
  | "invite"
  | "go";

export type EstateTurnResolution = {
  phrase: string;
  needId: MemberNeedId | null;
  mode: EstateNavigationMode;
  /** Ranked canonical placeIds (max 3 for suggest) */
  placeIds: readonly string[];
  primaryPlaceId?: string;
  confidence: "high" | "medium" | "low";
  reason: string;
  /** Rule id for tests and evolution board */
  matchedRuleId?: string;
};

export type MemberNeedDefinition = {
  id: MemberNeedId;
  label: string;
  description: string;
};

export const MEMBER_NEED_DEFINITIONS: readonly MemberNeedDefinition[] = [
  {
    id: "express",
    label: "Express",
    description: "Put words on the page — journal, draft, release.",
  },
  {
    id: "reflect",
    label: "Reflect",
    description: "Think through, process, debrief quietly.",
  },
  {
    id: "restore",
    label: "Restore",
    description: "Peace, calm, quiet — lower stimulation.",
  },
  {
    id: "celebrate",
    label: "Celebrate",
    description: "Mark completion, pride, milestones.",
  },
  {
    id: "prove",
    label: "Prove",
    description: "Evidence of capability — hard things survived.",
  },
  {
    id: "capture",
    label: "Capture",
    description: "Hold onto today — don't lose what matters.",
  },
  {
    id: "learn",
    label: "Learn",
    description: "Courses, study, understanding.",
  },
  {
    id: "create",
    label: "Create",
    description: "Make something new — content, campaigns, assets.",
  },
  {
    id: "plan",
    label: "Plan",
    description: "Priorities, direction, what's next.",
  },
  {
    id: "play",
    label: "Play",
    description: "Movement, games, swimming, recharge.",
  },
] as const;

type PhraseRule = {
  id: string;
  pattern: RegExp;
  needId: MemberNeedId;
  mode: EstateNavigationMode;
  placeIds: readonly string[];
  primaryPlaceId?: string;
  confidence: EstateTurnResolution["confidence"];
  reason: string;
  /** If matched, rule is skipped */
  unless?: RegExp;
};

function normalizePhrase(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Ordered phrase rules — first match wins (more specific rules appear first).
 * Natural language, not keyword soup.
 */
const PHRASE_RULES: readonly PhraseRule[] = [
  // ── Express / journal ──
  {
    id: "express-write",
    pattern: /\b(?:i want to write|i need to write|i'd like to write|want to write|need to write)\b/i,
    unless: /\b(?:newsletter|email|e-mail|blog|post|presentation|course)\b/i,
    needId: "express",
    mode: "invite",
    placeIds: ["journal"],
    primaryPlaceId: "journal",
    confidence: "high",
    reason: "express need → Journal Gazebo™",
  },
  {
    id: "express-journal",
    pattern: /\b(?:want to journal|need to journal|open my journal|my journal|journal my thoughts)\b/i,
    needId: "express",
    mode: "invite",
    placeIds: ["journal"],
    primaryPlaceId: "journal",
    confidence: "high",
    reason: "journal intent → Journal Gazebo™",
  },
  {
    id: "reflect-process",
    pattern: /\b(?:want to reflect|need to reflect|process (?:this|the|my) week|think through)\b/i,
    needId: "reflect",
    mode: "invite",
    placeIds: ["journal", "clear-my-mind"],
    primaryPlaceId: "journal",
    confidence: "medium",
    reason: "reflect need → journal or clear my mind",
  },

  // ── Restore / peaceful ──
  {
    id: "restore-somewhere-peaceful",
    pattern:
      /\b(?:need somewhere peaceful|want somewhere peaceful|somewhere peaceful|need a peaceful place|want a quiet place|somewhere quiet|need somewhere quiet)\b/i,
    needId: "restore",
    mode: "suggest",
    placeIds: ["greenhouse", "seat-at-pond", "tea-room"],
    confidence: "high",
    reason: "restore need → physical peaceful places (not audio hub first)",
  },
  {
    id: "restore-peaceful-feeling",
    pattern:
      /\b(?:i need peace|i want peace|feeling overwhelmed|i(?:'m| am) overwhelmed|need to calm down|want to calm down)\b/i,
    needId: "restore",
    mode: "suggest",
    placeIds: ["greenhouse", "seat-at-pond", "reading-nook"],
    confidence: "medium",
    reason: "overwhelm/peace → restorative places",
  },

  // ── Play / swimming (pool planned — water alternatives only) ──
  {
    id: "play-swimming",
    pattern: /\b(?:let(?:'s| us) go swimming|go swimming|want to swim|go for a swim|take a swim)\b/i,
    needId: "play",
    mode: "suggest",
    placeIds: ["seat-at-pond", "peaceful-places"],
    confidence: "medium",
    reason: "swim intent → pool not live; nearby water/restorative places",
  },

  // ── Celebrate / course finished ──
  {
    id: "celebrate-finished-course",
    pattern:
      /\b(?:i finished my course|finished (?:my|the) course|completed (?:my|the) course|i finished a course|done with (?:my|the) course)\b/i,
    needId: "celebrate",
    mode: "invite",
    placeIds: ["celebration-room", "library"],
    primaryPlaceId: "celebration-room",
    confidence: "high",
    reason: "course completion → celebrate, then achievement library",
  },
  {
    id: "celebrate-general",
    pattern:
      /\b(?:want to celebrate|need to celebrate|something to celebrate|finished something big|i did it)\b/i,
    needId: "celebrate",
    mode: "invite",
    placeIds: ["celebration-room", "gardens"],
    primaryPlaceId: "celebration-room",
    confidence: "medium",
    reason: "celebration intent → celebration room / garden",
  },

  // ── Capture / don't forget ──
  {
    id: "capture-dont-forget",
    pattern:
      /\b(?:don(?:'t|t) want to forget(?: today)?|don't want this to be forgotten|hold onto today|save this moment|capture today)\b/i,
    needId: "capture",
    mode: "suggest",
    placeIds: ["journal", "evidence-vault"],
    primaryPlaceId: "journal",
    confidence: "high",
    reason: "capture need → journal page or evidence",
  },
  {
    id: "capture-remember",
    pattern: /\b(?:need to remember this|want to remember this|save this for later)\b/i,
    needId: "capture",
    mode: "suggest",
    placeIds: ["journal", "evidence-vault"],
    confidence: "medium",
    reason: "remember intent → journal or evidence",
  },

  // ── Prove / evidence ──
  {
    id: "prove-hard-things",
    pattern:
      /\b(?:proof i can do hard things|need proof i can|evidence i can do|proof of growth|proof i(?:'m| am) capable)\b/i,
    needId: "prove",
    mode: "invite",
    placeIds: ["evidence-vault"],
    primaryPlaceId: "evidence-vault",
    confidence: "high",
    reason: "prove need → Evidence Vault™",
  },
  {
    id: "prove-evidence",
    pattern: /\b(?:my evidence|evidence vault|proof of what i(?:'ve| have) done)\b/i,
    needId: "prove",
    mode: "invite",
    placeIds: ["evidence-vault"],
    primaryPlaceId: "evidence-vault",
    confidence: "high",
    reason: "evidence language → Evidence Vault™",
  },

  // ── Achievement library ──
  {
    id: "celebrate-accomplishment-book",
    pattern:
      /\b(?:accomplishments?\s+book|my\s+accomplishments|achievement library|what i(?:'ve| have) accomplished)\b/i,
    needId: "celebrate",
    mode: "invite",
    placeIds: ["library"],
    primaryPlaceId: "library",
    confidence: "high",
    reason: "accomplishments → Achievement Library™",
  },

  // ── Greenhouse seeds ──
  {
    id: "create-plant-idea",
    pattern: /\b(?:plant an idea|plant a seed|nurture an idea|greenhouse)\b/i,
    needId: "create",
    mode: "invite",
    placeIds: ["greenhouse"],
    primaryPlaceId: "greenhouse",
    confidence: "medium",
    reason: "seed/idea → Growth Greenhouse™",
  },
];

const NEED_TO_PRIMARY_PLACES: Readonly<
  Record<MemberNeedId, readonly string[]>
> = {
  express: ["journal"],
  reflect: ["journal", "clear-my-mind", "coffee-house"],
  restore: ["greenhouse", "seat-at-pond", "tea-room", "reading-nook"],
  celebrate: ["celebration-room", "gardens", "library"],
  prove: ["evidence-vault", "library"],
  capture: ["journal", "evidence-vault", "brain-dump"],
  learn: ["momentum-institute", "library"],
  create: ["creative-studio", "greenhouse"],
  plan: ["observatory", "momentum-builder"],
  play: ["game-room"],
};

const EMPTY_RESOLUTION = (
  phrase: string,
  reason: string,
): EstateTurnResolution => ({
  phrase,
  needId: null,
  mode: "none",
  placeIds: [],
  confidence: "low",
  reason,
});

/** Resolve member phrase → need + ranked places (Phase 1 index). */
export function evaluateMemberNeedFromPhrase(
  phrase: string,
): EstateTurnResolution {
  const trimmed = phrase.trim();
  if (!trimmed) {
    return EMPTY_RESOLUTION(phrase, "empty phrase");
  }

  const normalized = normalizePhrase(trimmed);

  for (const rule of PHRASE_RULES) {
    if (!rule.pattern.test(normalized) && !rule.pattern.test(trimmed)) {
      continue;
    }
    if (rule.unless && (rule.unless.test(normalized) || rule.unless.test(trimmed))) {
      continue;
    }

    const placeIds = rule.placeIds.map((id) => resolvePlaceId(id));
    const primaryPlaceId = rule.primaryPlaceId
      ? resolvePlaceId(rule.primaryPlaceId)
      : placeIds[0];

    return {
      phrase: trimmed,
      needId: rule.needId,
      mode: rule.mode,
      placeIds: capPlaceIds(placeIds, rule.mode),
      primaryPlaceId,
      confidence: rule.confidence,
      reason: rule.reason,
      matchedRuleId: rule.id,
    };
  }

  return EMPTY_RESOLUTION(trimmed, "no member-need rule matched");
}

function capPlaceIds(
  placeIds: readonly string[],
  mode: EstateNavigationMode,
): readonly string[] {
  const unique = [...new Set(placeIds.map((id) => resolvePlaceId(id)))];
  if (mode === "suggest") return unique.slice(0, 3);
  return unique;
}

export function getPrimaryPlacesForNeed(
  needId: MemberNeedId,
): readonly string[] {
  return NEED_TO_PRIMARY_PLACES[needId].map((id) => resolvePlaceId(id));
}

export function listPhraseRulesForPlace(placeId: string): PhraseRule[] {
  const canonical = resolvePlaceId(placeId);
  return PHRASE_RULES.filter((rule) =>
    rule.placeIds.some((id) => resolvePlaceId(id) === canonical),
  );
}
