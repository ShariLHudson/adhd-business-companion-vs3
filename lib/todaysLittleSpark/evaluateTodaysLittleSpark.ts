import type { RegionCode } from "@/lib/companionLanguage";
import { isAppAnniversaryToday } from "@/lib/shariMemberSince";
import {
  DEFAULT_SPARK_COOLDOWN_DAYS,
  SPARK_CATALOG,
  SPARK_FREQUENCY_TARGET_PERCENT,
} from "./catalog";
import { formatSparkDelivery } from "./delivery";
import {
  alreadySparkedToday,
  dayKey,
  readSparkStore,
  recordSparkShown,
  sparkOnCooldown,
} from "./persistence";
import type {
  EvaluateTodaysLittleSparkInput,
  EvaluateTodaysLittleSparkOutput,
  SparkCatalogEntry,
  SparkInterestTag,
  TodaysLittleSparkResult,
} from "./types";

const CONVERSATION_MILESTONE_SPARKS: { count: number; id: string; body: string }[] =
  [
    {
      count: 100,
      id: "personal-100-conversations",
      body: "I noticed something quietly wonderful — this is around your hundredth conversation here. That matters. Thank you for showing up.",
    },
    {
      count: 50,
      id: "personal-50-conversations",
      body: "We've had quite a few conversations now — and I don't take that for granted. Glad you're here.",
    },
    {
      count: 25,
      id: "personal-25-conversations",
      body: "We've talked a fair number of times now. I hope this place has started to feel like yours.",
    },
  ];

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function frequencyGateOpen(now: Date, memberSinceIso: string | null): boolean {
  const seed = `${dayKey(now)}:${memberSinceIso ?? "guest"}`;
  return hashSeed(seed) % 100 < SPARK_FREQUENCY_TARGET_PERCENT;
}

/** Approximate full moon — good enough for delight, not astronomy. */
export function isNearFullMoon(now = new Date()): boolean {
  const epoch = new Date("2023-01-06T18:00:00Z").getTime();
  const days = (now.getTime() - epoch) / (1000 * 60 * 60 * 24);
  const phase = ((days % 29.53) + 29.53) % 29.53;
  return phase < 1.2 || phase > 28.3;
}

function inferInterestTags(input: EvaluateTodaysLittleSparkInput): SparkInterestTag[] {
  const tags = new Set<SparkInterestTag>(input.interestTags ?? []);
  if (input.favoriteDrink === "coffee") tags.add("coffee");
  if (input.favoriteDrink === "tea") tags.add("tea");
  const affinity = readSparkStore().affinity;
  const ranked = Object.entries(affinity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([tag]) => tag as SparkInterestTag);
  for (const tag of ranked) tags.add(tag);
  return [...tags];
}

function personalMilestoneSpark(
  input: EvaluateTodaysLittleSparkInput,
  now: Date,
): TodaysLittleSparkResult | null {
  const name = input.firstName?.trim();
  const nameBit = name ? `${name}, ` : "";

  if (input.memberSinceIso && isAppAnniversaryToday(input.memberSinceIso, now)) {
    return {
      id: `personal-app-anniversary-${now.getFullYear()}`,
      category: "personal",
      priority: 120,
      deliveryText: `${nameBit}today marks another year you've been here — and I'm glad you are.`,
      environmentObjects: [{ kind: "cake", placement: "table" }],
    };
  }

  const starts = input.conversationStarts ?? 0;
  for (const milestone of CONVERSATION_MILESTONE_SPARKS) {
    if (starts === milestone.count) {
      return {
        id: milestone.id,
        category: "personal",
        priority: 110,
        deliveryText: milestone.body,
      };
    }
  }

  return null;
}

function matchesEntry(
  entry: SparkCatalogEntry,
  input: {
    now: Date;
    region: RegionCode;
    season: EvaluateTodaysLittleSparkInput["season"];
    timeOfDay: EvaluateTodaysLittleSparkInput["timeOfDay"];
  },
): boolean {
  const month = input.now.getMonth() + 1;
  const day = input.now.getDate();

  if (entry.regions && !entry.regions.includes(input.region)) return false;
  if (entry.monthDay) {
    if (entry.monthDay.month !== month || entry.monthDay.day !== day) return false;
  }
  if (entry.months && !entry.months.includes(month)) return false;
  if (entry.seasons && !entry.seasons.includes(input.season)) return false;
  if (entry.timeOfDay && !entry.timeOfDay.includes(input.timeOfDay)) return false;
  if (entry.requiresFullMoon && !isNearFullMoon(input.now)) return false;

  // Entries with only category defaults need at least one anchor
  const hasAnchor =
    entry.monthDay ||
    entry.months ||
    entry.seasons ||
    entry.requiresFullMoon ||
    entry.regions;
  if (!hasAnchor) return false;

  return true;
}

function scoreEntry(
  entry: SparkCatalogEntry,
  interests: SparkInterestTag[],
  seed: string,
): number {
  let score = entry.priority * 100;
  for (const tag of entry.interestTags ?? []) {
    if (interests.includes(tag)) score += 8;
    const affinity = readSparkStore().affinity[tag] ?? 0;
    score += Math.min(affinity * 2, 12);
  }
  score += hashSeed(`${seed}:${entry.id}`) % 5;
  return score;
}

function pickBody(entry: SparkCatalogEntry, seed: string): string {
  const idx = hashSeed(`${seed}:body`) % entry.bodies.length;
  return entry.bodies[idx] ?? entry.bodies[0]!;
}

function buildFromCatalog(
  input: EvaluateTodaysLittleSparkInput,
  now: Date,
  region: RegionCode,
): TodaysLittleSparkResult | null {
  const seed = `${dayKey(now)}:${input.memberSinceIso ?? "guest"}`;
  const interests = inferInterestTags(input);

  const candidates = SPARK_CATALOG.filter(
    (entry) =>
      matchesEntry(entry, {
        now,
        region,
        season: input.season,
        timeOfDay: input.timeOfDay,
      }) &&
      !sparkOnCooldown(
        entry.id,
        entry.cooldownDays ?? DEFAULT_SPARK_COOLDOWN_DAYS,
        now,
      ),
  );

  if (candidates.length === 0) return null;

  const ranked = [...candidates].sort(
    (a, b) => scoreEntry(b, interests, seed) - scoreEntry(a, interests, seed),
  );
  const chosen = ranked[0]!;
  const body = pickBody(chosen, seed);

  return {
    id: chosen.id,
    category: chosen.category,
    priority: chosen.priority,
    deliveryText: formatSparkDelivery(body, `${seed}:${chosen.id}`, {
      includeOpener: false,
    }),
    environmentObjects: chosen.environmentObjects,
  };
}

function shouldSuppress(input: EvaluateTodaysLittleSparkInput): string | null {
  if (!input.isFirstVisitOfDay) return "not_first_visit_of_day";
  if (input.isFirstMeeting) return "first_meeting";
  if (input.onboardingActive) return "onboarding";
  if (input.recoveryGentle) return "recovery";
  if (input.lowEnergy) return "low_energy";
  if (input.presencePreferSilence) return "prefer_silence";
  if (input.birthdayToday) return "birthday_greeting";
  if (input.celebrationActive) return "celebration_greeting";
  if (
    input.greetingCategory === "birthday" ||
    input.greetingCategory === "celebration"
  ) {
    return "greeting_celebration";
  }
  if (alreadySparkedToday(input.now)) return "already_sparked_today";
  return null;
}

/**
 * Today's Little Spark — Life Experience Intelligence daily delight.
 * Quiet, occasional, never forced. Personal milestones bypass frequency gate.
 */
export function evaluateTodaysLittleSpark(
  input: EvaluateTodaysLittleSparkInput,
): EvaluateTodaysLittleSparkOutput {
  const now = input.now ?? new Date();
  const region = input.region ?? "US";

  const suppressed = shouldSuppress(input);
  if (suppressed) {
    return { spark: null, suppressedReason: suppressed };
  }

  const personal = personalMilestoneSpark(input, now);
  if (personal) {
    if (input.record) {
      recordSparkShown(personal.id, undefined, now);
    }
    return { spark: personal };
  }

  const gateOpen = input.forceEligible || frequencyGateOpen(now, input.memberSinceIso ?? null);
  if (!gateOpen) {
    return { spark: null, suppressedReason: "frequency_gate" };
  }

  const spark = buildFromCatalog(input, now, region);
  if (!spark) {
    return { spark: null, suppressedReason: "no_candidate" };
  }

  if (input.record) {
    const entry = SPARK_CATALOG.find((e) => e.id === spark.id);
    recordSparkShown(spark.id, entry?.interestTags, now);
  }

  return { spark };
}

export function mergeSparkEnvironmentObjects<T extends { layer2: { kind: string }[] }>(
  room: T,
  spark: TodaysLittleSparkResult | null,
): T {
  if (!spark?.environmentObjects?.length) return room;
  const existing = new Set(room.layer2.map((o) => o.kind));
  const additions = spark.environmentObjects.filter((o) => !existing.has(o.kind));
  if (additions.length === 0) return room;
  return {
    ...room,
    layer2: [...room.layer2, ...additions],
  };
}
