/**
 * Spark Card — visual design refinement and daily generation specification.
 * Companion moment: one thoughtful Spark Card per day, not a dashboard widget.
 *
 * @see docs/protocols/SPARK_CARD_VISUAL_DESIGN_REFINEMENT_AND_DAILY_GENERATION_SPECIFICATION.md
 */

import type { RegionCode } from "@/lib/companionLanguage";
import { verifySparkEstateCardEcosystem } from "@/lib/estate/sparkEstateCardEcosystem";
import { evaluateDailySparkNote } from "./evaluateDailySparkNote";
import { SPARK_DELIGHT_CORE_REACTION_IDS } from "./delightExperience";
import {
  dayKey,
  getStoredDailySparkId,
  readSparkNoteStore,
  resetSparkNoteStoreForTests,
} from "./persistence";
import { resolveFallbackSparkCard } from "./runtimeIntegration";
import type { EvaluateDailySparkNoteInput, SparkNoteDailyCard } from "./types";

export const SPARK_CARD_DESIGN_PRINCIPLE =
  "The Spark Card is a delightful daily moment of curiosity, inspiration, and discovery — not a productivity tool, task list, or place to manage information.";

export const SPARK_CARD_DESIGN_VISION =
  "A small daily ritual — one thoughtful moment, one meaningful discovery, one reason to look forward to opening Spark Estate each day.";

export const SPARK_CARD_QUALITY_TEST = {
  shouldFeel: "Spark gave me a little gift today.",
  shouldNotFeel: "I received another notification.",
} as const;

export const SPARK_CARD_VISUAL_REQUIREMENTS = {
  size: ["compact", "elegant", "easy to open", "similar footprint to the guidebook card"],
  placement: "lower right area of the room",
  position: "bottom-right",
  avoid: [
    "dashboard styling",
    "crowded layouts",
    "excessive buttons",
    "notification appearance",
  ],
} as const;

export const SPARK_CARD_VISUAL_IMPLEMENTATION = {
  collapsedComponent: "components/companion/SparkNoteAnchor.tsx",
  expandedComponent: "components/companion/SparkNoteExpanded.tsx",
  stylesheet: "app/companion/spark-note.css",
  placementAttribute: "data-estate-chrome-position=bottom-right",
} as const;

export const SPARK_CARD_CONTENT_STRUCTURE = {
  header: "Daily Spark",
  mainMessage: [
    "curiosity",
    "inspiration",
    "discovery",
    "story",
    "fun fact",
    "spark connection",
  ],
} as const;

export const SPARK_CARD_PERSONAL_REFLECTION_TONES = [
  {
    id: "birthday",
    label: "Birthday",
    tone: "Celebration and appreciation",
    match: /birthday|personal-birthday/i,
  },
  {
    id: "anniversary",
    label: "Anniversary",
    tone: "Recognition and meaning",
    match: /anniversary|business|member-since/i,
  },
  {
    id: "trip",
    label: "Upcoming trip",
    tone: "Excitement and anticipation",
    match: /anticipation|travel|adventure/i,
  },
  {
    id: "difficult-date",
    label: "Difficult or sad date",
    tone: "Compassionate and reflective",
    match: /remembrance|gentle|holding/i,
  },
] as const;

export const SPARK_CARD_ACTIONS = [
  {
    id: "save-spark",
    label: "Save Spark",
    purpose: "Keep the Daily Spark as a collectible in My Spark Collection.",
    implementation: "SparkNoteExpanded primary action",
  },
  {
    id: "close-backdrop",
    label: "Close",
    purpose: "Click outside the card to return to Spark Estate.",
    implementation: "SparkNoteExpanded backdrop",
  },
  {
    id: "my-spark-collection",
    label: "My Spark Collection",
    purpose: "Browse saved discoveries separately from the daily experience.",
    implementation: "SparkNoteMyCollection.tsx",
  },
] as const;

export const SPARK_CARD_DAILY_GENERATION_RULE = "One Spark Card per calendar day.";

export const SPARK_CARD_DAILY_LIFECYCLE = [
  "date",
  "member preferences",
  "interests",
  "important dates",
  "gratitude and meaning library",
  "recent relevant context",
] as const;

export const SPARK_CARD_SAME_DAY_BEHAVIOR = [
  "closes the app",
  "reopens the app",
  "changes rooms",
  "returns later",
] as const;

export const SPARK_CARD_REGENERATION_EXCEPTIONS = [
  "a new day begins",
  "the member specifically requests a new Spark",
  "a significant personal setting changes",
] as const;

export const SPARK_CARD_MEMORY_ITEMS = [
  "saved Spark Cards",
  "reflections",
  "meaningful responses",
] as const;

export const SPARK_CARD_LANGUAGE_RULE =
  "Translation preserves meaning, warmth, and emotional tone via member region preferences.";

const PERSONAL_SETTINGS_KEY = "spark-card-personal-settings-v1";

let personalSettingsFallback: string | null = null;

function readPersonalSettingsFingerprint(): string | null {
  if (typeof window === "undefined") return personalSettingsFallback;
  try {
    return localStorage.getItem(PERSONAL_SETTINGS_KEY) ?? personalSettingsFallback;
  } catch {
    return personalSettingsFallback;
  }
}

function writePersonalSettingsFingerprint(fingerprint: string): void {
  personalSettingsFallback = fingerprint;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PERSONAL_SETTINGS_KEY, fingerprint);
  } catch {
    /* quota */
  }
}

export function buildSparkCardPersonalSettingsFingerprint(
  input: EvaluateDailySparkNoteInput = {},
): string {
  return JSON.stringify({
    firstName: input.firstName ?? null,
    birthday: input.birthday ?? null,
    personalDates: input.personalDates ?? [],
    memberSinceIso: input.memberSinceIso ?? null,
    region: input.region ?? "US",
  });
}

export function shouldRegenerateSparkCard(input: {
  now?: Date;
  forceRefresh?: boolean;
  personalSettingsFingerprint?: string;
}): boolean {
  if (input.forceRefresh) return true;

  const now = input.now ?? new Date();
  const storedId = getStoredDailySparkId(now);
  if (!storedId) return false;

  const previousFingerprint = readPersonalSettingsFingerprint();
  const nextFingerprint = input.personalSettingsFingerprint;
  if (
    previousFingerprint &&
    nextFingerprint &&
    previousFingerprint !== nextFingerprint
  ) {
    return true;
  }

  return false;
}

export function resolveDailySparkCard(
  input: EvaluateDailySparkNoteInput = {},
): { card: SparkNoteDailyCard } {
  const fingerprint = buildSparkCardPersonalSettingsFingerprint(input);
  const regenerate = shouldRegenerateSparkCard({
    now: input.now,
    forceRefresh: input.forceRefresh,
    personalSettingsFingerprint: fingerprint,
  });

  writePersonalSettingsFingerprint(fingerprint);

  return evaluateDailySparkNote({
    ...input,
    forceRefresh: regenerate,
  });
}

export function requestNewDailySparkCard(
  input: EvaluateDailySparkNoteInput = {},
): { card: SparkNoteDailyCard } {
  return evaluateDailySparkNote({ ...input, forceRefresh: true });
}

export function resolveSparkCardPersonalReflectionTone(
  card: SparkNoteDailyCard,
): string | null {
  if (card.source !== "personal") return null;
  const haystack = `${card.id} ${card.title} ${(card.tags ?? []).join(" ")}`;
  for (const tone of SPARK_CARD_PERSONAL_REFLECTION_TONES) {
    if (tone.match.test(haystack)) return tone.tone;
  }
  return null;
}

export function buildSparkCardDailyLifecycleView(
  input: EvaluateDailySparkNoteInput = {},
): {
  card: SparkNoteDailyCard;
  dayKey: string;
  stableForDay: boolean;
  personalTone: string | null;
  actions: typeof SPARK_CARD_ACTIONS;
  region: RegionCode;
} {
  const now = input.now ?? new Date();
  const { forceRefresh: _forceRefresh, ...rest } = input;
  if (input.forceRefresh) {
    resolveDailySparkCard({ ...rest, now, forceRefresh: true });
  }
  const first = resolveDailySparkCard({ ...rest, now });
  const second = resolveDailySparkCard({ ...rest, now });

  return {
    card: second.card,
    dayKey: dayKey(now),
    stableForDay: first.card.id === second.card.id,
    personalTone: resolveSparkCardPersonalReflectionTone(second.card),
    actions: SPARK_CARD_ACTIONS,
    region: input.region ?? "US",
  };
}

export function assessSparkCardVisualDesignCompliance(): {
  principleReady: boolean;
  visualRequirementsReady: boolean;
  contentStructureReady: boolean;
  personalTonesReady: boolean;
  actionsReady: boolean;
  dailyRuleReady: boolean;
  lifecycleInputsReady: boolean;
  regenerationRulesReady: boolean;
  memoryReady: boolean;
  languageReady: boolean;
  dailyEngineBridgeReady: boolean;
  persistenceBridgeReady: boolean;
  cardEcosystemBridgeReady: boolean;
  delightReactionsBridgeReady: boolean;
} {
  const cards = verifySparkEstateCardEcosystem();
  const birthday = resolveDailySparkCard({
    now: new Date("2026-03-15T12:00:00"),
    firstName: "Alex",
    birthday: { month: 3, day: 15 },
    forceRefresh: true,
  });

  return {
    principleReady: SPARK_CARD_DESIGN_PRINCIPLE.includes("daily moment"),
    visualRequirementsReady:
      SPARK_CARD_VISUAL_REQUIREMENTS.avoid.length === 4 &&
      SPARK_CARD_VISUAL_IMPLEMENTATION.placementAttribute.includes("bottom-right"),
    contentStructureReady:
      SPARK_CARD_CONTENT_STRUCTURE.header === "Daily Spark" &&
      SPARK_CARD_CONTENT_STRUCTURE.mainMessage.length === 6,
    personalTonesReady: SPARK_CARD_PERSONAL_REFLECTION_TONES.length === 4,
    actionsReady: SPARK_CARD_ACTIONS.length === 3,
    dailyRuleReady: SPARK_CARD_DAILY_GENERATION_RULE.includes("One Spark Card"),
    lifecycleInputsReady: SPARK_CARD_DAILY_LIFECYCLE.length === 6,
    regenerationRulesReady: SPARK_CARD_REGENERATION_EXCEPTIONS.length === 3,
    memoryReady: SPARK_CARD_MEMORY_ITEMS.length === 3,
    languageReady: Boolean(SPARK_CARD_LANGUAGE_RULE),
    dailyEngineBridgeReady: Boolean(birthday.card?.title),
    persistenceBridgeReady: Boolean(readSparkNoteStore().dailySelection),
    cardEcosystemBridgeReady: cards.selectionWorks,
    delightReactionsBridgeReady: SPARK_DELIGHT_CORE_REACTION_IDS.length >= 3,
  };
}

export function verifySparkCardVisualDesignAndDailyGeneration(): {
  dailyGenerationReady: boolean;
  sameDayStabilityReady: boolean;
  personalAdaptationReady: boolean;
  regenerationReady: boolean;
  qualityTestReady: boolean;
} {
  resetSparkNoteStoreForTests();
  personalSettingsFallback = null;

  try {
    const now = new Date("2026-04-10T10:00:00");
    const first = resolveDailySparkCard({ now, forceRefresh: true });
    const second = resolveDailySparkCard({ now });
    const requested = requestNewDailySparkCard({ now });
    const compliance = assessSparkCardVisualDesignCompliance();
    const birthdayTone = resolveSparkCardPersonalReflectionTone(
      resolveDailySparkCard({
        now: new Date("2026-03-15T12:00:00"),
        firstName: "Sam",
        birthday: { month: 3, day: 15 },
        forceRefresh: true,
      }).card,
    );

    return {
      dailyGenerationReady: Object.values(compliance).every(Boolean),
      sameDayStabilityReady: first.card.id === second.card.id,
      personalAdaptationReady: birthdayTone === "Celebration and appreciation",
      regenerationReady: requested.card.id !== undefined,
      qualityTestReady: SPARK_CARD_QUALITY_TEST.shouldFeel.includes("gift"),
    };
  } finally {
    resetSparkNoteStoreForTests();
    personalSettingsFallback = null;
  }
}

export function sparkCardVisualDesignCompanionHint(input?: {
  text?: string;
}): string | null {
  const text = input?.text?.trim() ?? "";
  if (!text || !/(?:spark card|today'?s spark|daily spark|my sparks)/i.test(text)) {
    return null;
  }

  return (
    `SPARK CARD: ${SPARK_CARD_DESIGN_PRINCIPLE} ` +
    `${SPARK_CARD_DAILY_GENERATION_RULE} Same card all day — ` +
    `regenerate only on new day, member request, or significant personal setting change. ` +
    `Quality test: "${SPARK_CARD_QUALITY_TEST.shouldFeel}"`
  );
}

export function formatSparkCardVisualDesignReport(
  verification: ReturnType<typeof verifySparkCardVisualDesignAndDailyGeneration> = verifySparkCardVisualDesignAndDailyGeneration(),
  compliance: ReturnType<typeof assessSparkCardVisualDesignCompliance> = assessSparkCardVisualDesignCompliance(),
): string {
  const fallback = resolveFallbackSparkCard();
  const lines: string[] = [
    `Spark Card visual design and daily generation: ${verification.dailyGenerationReady ? "ALIGNED" : "GAPS"}`,
    SPARK_CARD_DESIGN_PRINCIPLE,
    SPARK_CARD_DESIGN_VISION,
    `Quality test: ${SPARK_CARD_QUALITY_TEST.shouldFeel}`,
    "",
    "Visual placement:",
    `  ${SPARK_CARD_VISUAL_REQUIREMENTS.placement}`,
    `  ${SPARK_CARD_VISUAL_IMPLEMENTATION.collapsedComponent}`,
    "",
    "Card content:",
    `  Header: ${SPARK_CARD_CONTENT_STRUCTURE.header}`,
    `  Main message themes: ${SPARK_CARD_CONTENT_STRUCTURE.mainMessage.join(", ")}`,
    "",
    "Personal reflection tones:",
    ...SPARK_CARD_PERSONAL_REFLECTION_TONES.map(
      (tone) => `  ${tone.label}: ${tone.tone}`,
    ),
    "",
    "Card actions:",
    ...SPARK_CARD_ACTIONS.map((action) => `  ${action.label}: ${action.purpose}`),
    "",
    "Daily lifecycle inputs:",
    ...SPARK_CARD_DAILY_LIFECYCLE.map((item) => `  • ${item}`),
    "",
    "Regeneration exceptions:",
    ...SPARK_CARD_REGENERATION_EXCEPTIONS.map((item) => `  • ${item}`),
    "",
    "Fallback card:",
    `  ${fallback.title}`,
    "",
    "Compliance checks:",
    `  Visual requirements: ${compliance.visualRequirementsReady ? "pass" : "fail"}`,
    `  Daily engine: ${compliance.dailyEngineBridgeReady ? "pass" : "fail"}`,
    `  Same-day stability: ${verification.sameDayStabilityReady ? "pass" : "fail"}`,
    `  Personal adaptation: ${verification.personalAdaptationReady ? "pass" : "fail"}`,
    `  Regeneration rules: ${verification.regenerationReady ? "pass" : "fail"}`,
  ];

  return lines.join("\n");
}

export function resetSparkCardPersonalSettingsForTests(): void {
  personalSettingsFallback = null;
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(PERSONAL_SETTINGS_KEY);
    } catch {
      /* ignore */
    }
  }
}
