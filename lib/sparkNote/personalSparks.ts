import type { PersonalDate } from "@/lib/recognition/types";
import { isAppAnniversaryToday } from "@/lib/shariMemberSince";
import { dayKey } from "./persistence";
import type { SparkNoteDailyCard } from "./types";

const DAY_MS = 86_400_000;
const UPCOMING_WINDOW_DAYS = 7;

function sameMonthDay(month: number, day: number, now: Date): boolean {
  return now.getMonth() + 1 === month && now.getDate() === day;
}

function parseIsoDateLocal(isoDate: string): Date {
  const [y, m, d] = isoDate.slice(0, 10).split("-").map(Number);
  const target = new Date(y!, m! - 1, d!);
  target.setHours(0, 0, 0, 0);
  return target;
}

function daysUntil(isoDate: string, now: Date): number {
  const target = parseIsoDateLocal(isoDate);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / DAY_MS);
}

function isGentleMoment(pd: PersonalDate): boolean {
  return pd.kind === "remembrance" || pd.tonePreference === "gentle";
}

function isBusinessMoment(pd: PersonalDate): boolean {
  return pd.category === "business";
}

function isTravelMoment(pd: PersonalDate): boolean {
  return pd.kind === "vacation" || pd.category === "travel";
}

export function buildBirthdaySpark(
  firstName: string | null | undefined,
  now = new Date(),
): SparkNoteDailyCard {
  const name = firstName?.trim();
  const greeting = name ? `Happy Birthday, ${name}!` : "Happy Birthday!";
  return {
    id: `personal-birthday:${dayKey(now)}`,
    category: "personal",
    categoryLabel: "Personal Moment",
    sparkType: "story",
    title: greeting,
    shortTitle: "Happy Birthday Spark",
    teaser:
      "Today is a reminder of your story, your experiences, and everything you have created along the way.",
    whatHappened:
      "Birthdays mark more than candles and cake. They're a natural pause — a moment to notice how far you've come, who you've become, and what still excites you about what's ahead.",
    whyItMatters:
      "Taking time to celebrate yourself isn't selfish — it's recognition that your presence matters. Every year brings new wisdom, new connections, and new possibilities.",
    sparkApplication:
      "What is one thing you want to celebrate about yourself today?",
    tags: ["birthday", "celebration", "personal"],
    source: "personal",
  };
}

export function buildAnticipationSpark(
  label: string,
  firstName: string | null | undefined,
  personalDateId: string,
  daysUntilEvent: number,
  now = new Date(),
): SparkNoteDailyCard {
  const name = firstName?.trim();
  const countdown =
    daysUntilEvent === 0
      ? "Today is the day."
      : daysUntilEvent === 1
        ? "Tomorrow is almost here."
        : `${daysUntilEvent} days to go.`;
  return {
    id: `personal-anticipation:${personalDateId}:${dayKey(now)}`,
    category: "personal",
    categoryLabel: "Personal Moment",
    sparkType: "story",
    title: label,
    shortTitle: "Adventure Ahead",
    teaser: name
      ? `${name}, something new is coming — ${countdown}`
      : `Something new is coming — ${countdown}`,
    whatHappened:
      "New places, meetings, and beginnings often create new memories, ideas, and perspectives. Anticipation is part of the experience — not just the destination.",
    whyItMatters:
      "Looking forward with intention helps you arrive present. A little excitement today can sharpen what you notice when the moment arrives.",
    sparkApplication: "What experience are you most looking forward to?",
    tags: ["anticipation", "travel", "personal"],
    source: "personal",
  };
}

export function buildBusinessAnniversarySpark(
  label: string,
  firstName: string | null | undefined,
  personalDateId: string,
  now = new Date(),
): SparkNoteDailyCard {
  const name = firstName?.trim();
  return {
    id: `personal-business:${personalDateId}:${dayKey(now)}`,
    category: "personal",
    categoryLabel: "Personal Moment",
    sparkType: "story",
    title: "Look How Far You Have Come",
    shortTitle: label,
    teaser: name
      ? `${name}, today marks ${label} — a moment worth noticing.`
      : `Today marks ${label} — a moment worth noticing.`,
    whatHappened:
      "Every business is built through hundreds of decisions, lessons, and small steps. Anniversaries and launch days are reminders that progress is rarely one dramatic leap — it's steady showing up.",
    whyItMatters:
      "Recognizing how far you've come keeps ambition humane. You don't have to wait for a finish line to honor the work already done.",
    sparkApplication: "What accomplishment deserves recognition?",
    tags: ["business", "milestone", "personal"],
    source: "personal",
  };
}

export function buildRemembranceSpark(
  label: string,
  firstName: string | null | undefined,
  personalDateId: string,
  now = new Date(),
): SparkNoteDailyCard {
  const name = firstName?.trim();
  return {
    id: `personal-remembrance:${personalDateId}:${dayKey(now)}`,
    category: "personal",
    categoryLabel: "Personal Moment",
    sparkType: "story",
    title: "A Meaningful Day",
    shortTitle: label,
    teaser: name
      ? `${name}, some days carry memories that matter.`
      : "Some days carry memories that matter.",
    whatHappened: `"${label}" is on your calendar today — a date you chose to remember. Spark is with you. There is no need to perform cheerfulness or rush past what this day holds.`,
    whyItMatters:
      "Honoring difficult or tender dates keeps your story whole. Reflection and remembrance are as valid as celebration.",
    sparkApplication:
      "What memory or lesson would you like to carry forward?",
    tags: ["remembrance", "reflection", "personal"],
    source: "personal",
  };
}

export function buildAnniversarySpark(
  label: string,
  firstName: string | null | undefined,
  personalDateId: string,
  now = new Date(),
): SparkNoteDailyCard {
  const name = firstName?.trim();
  return {
    id: `personal-anniversary:${personalDateId}:${dayKey(now)}`,
    category: "personal",
    categoryLabel: "Personal Moment",
    sparkType: "story",
    title: label,
    shortTitle: label,
    teaser: name
      ? `${name}, today marks a date worth remembering.`
      : "Today marks a date worth remembering.",
    whatHappened: `You chose to remember "${label}" — a personal milestone that belongs to your story. Anniversaries are anchors: they remind us where we've been and what we've built.`,
    whyItMatters:
      "Pausing to honor meaningful dates keeps us connected to purpose. Celebration isn't only for big public wins — private milestones matter too.",
    sparkApplication:
      "What has changed since this date first mattered to you? What do you want the next chapter to hold?",
    tags: ["anniversary", "reflection", "personal"],
    source: "personal",
  };
}

export function buildMembershipAnniversarySpark(
  firstName: string | null | undefined,
  now = new Date(),
): SparkNoteDailyCard {
  const name = firstName?.trim();
  return {
    id: `personal-membership:${dayKey(now)}`,
    category: "personal",
    categoryLabel: "Personal Moment",
    sparkType: "story",
    title: name ? `Another Year Together, ${name}` : "Another Year Together",
    shortTitle: "Companion Anniversary",
    teaser: "Today marks your Spark companion anniversary.",
    whatHappened:
      "You've been showing up here — in conversations, ideas, and quiet moments of focus. That consistency builds something real over time.",
    whyItMatters:
      "Longevity in a creative practice isn't about perfection. It's about returning, learning, and letting small sessions add up.",
    sparkApplication:
      "What's one thing you've discovered about yourself since you first arrived here?",
    tags: ["membership", "anniversary", "personal"],
    source: "personal",
  };
}

export function buildMilestoneSpark(
  label: string,
  firstName: string | null | undefined,
  personalDateId: string,
  now = new Date(),
): SparkNoteDailyCard {
  const name = firstName?.trim();
  return {
    id: `personal-milestone:${personalDateId}:${dayKey(now)}`,
    category: "personal",
    categoryLabel: "Personal Moment",
    sparkType: "story",
    title: label,
    shortTitle: label,
    teaser: name
      ? `${name}, today is a milestone on your calendar.`
      : "Today is a milestone on your calendar.",
    whatHappened: `"${label}" is on your mind today — a marker you set for yourself. Milestones turn vague ambition into moments you can actually notice.`,
    whyItMatters:
      "Recognizing progress keeps momentum humane. You don't have to wait for a finish line to acknowledge how far you've come.",
    sparkApplication:
      "What small win from this milestone deserves a moment of appreciation before you move on?",
    tags: ["milestone", "achievement", "personal"],
    source: "personal",
  };
}

export function buildCelebrationSpark(
  label: string,
  firstName: string | null | undefined,
  personalDateId: string,
  now = new Date(),
): SparkNoteDailyCard {
  const name = firstName?.trim();
  return {
    id: `personal-celebration:${personalDateId}:${dayKey(now)}`,
    category: "personal",
    categoryLabel: "Personal Moment",
    sparkType: "story",
    title: label,
    shortTitle: label,
    teaser: name
      ? `${name}, today is worth celebrating.`
      : "Today is worth celebrating.",
    whatHappened: `"${label}" is a saved celebration on your calendar — something you chose to remember and honor. Marking these moments keeps encouragement personal and intentional.`,
    whyItMatters:
      "Celebrating achievements, launches, and meaningful days reinforces that your progress counts — even when no one else is watching.",
    sparkApplication:
      "What part of this celebration do you want to carry with you into what comes next?",
    tags: ["celebration", "achievement", "personal"],
    source: "personal",
  };
}

function targetDateMatchesToday(targetDate: string, now: Date): boolean {
  return targetDate.slice(0, 10) === dayKey(now);
}

function resolvePersonalDateSpark(
  pd: PersonalDate,
  firstName: string | null | undefined,
  now: Date,
): SparkNoteDailyCard | null {
  if (isTravelMoment(pd) && pd.targetDate) {
    const days = daysUntil(pd.targetDate, now);
    if (days === 0) {
      return buildAnticipationSpark(pd.label, firstName, pd.id, 0, now);
    }
    return null;
  }

  if (
    pd.kind === "due_date" &&
    pd.targetDate &&
    targetDateMatchesToday(pd.targetDate, now)
  ) {
    return buildAnticipationSpark(pd.label, firstName, pd.id, 0, now);
  }

  if (!sameMonthDay(pd.month, pd.day, now)) return null;

  if (isGentleMoment(pd)) {
    return buildRemembranceSpark(pd.label, firstName, pd.id, now);
  }

  if (
    isBusinessMoment(pd) &&
    (pd.kind === "anniversary" ||
      pd.kind === "launch" ||
      pd.kind === "milestone")
  ) {
    return buildBusinessAnniversarySpark(pd.label, firstName, pd.id, now);
  }

  if (pd.kind === "anniversary" || pd.tonePreference === "reflection") {
    return buildAnniversarySpark(pd.label, firstName, pd.id, now);
  }
  if (pd.kind === "milestone" || pd.kind === "launch" || pd.kind === "custom") {
    return buildMilestoneSpark(pd.label, firstName, pd.id, now);
  }
  if (pd.kind === "workshop" || pd.kind === "speaking") {
    return buildCelebrationSpark(pd.label, firstName, pd.id, now);
  }

  return null;
}

function resolveUpcomingPersonalSpark(
  personalDates: PersonalDate[],
  firstName: string | null | undefined,
  now: Date,
): SparkNoteDailyCard | null {
  let nearest: { card: SparkNoteDailyCard; days: number } | null = null;

  for (const pd of personalDates) {
    if (!pd.targetDate) continue;
    const days = daysUntil(pd.targetDate, now);
    if (days < 1 || days > UPCOMING_WINDOW_DAYS) continue;

    const isUpcoming =
      isTravelMoment(pd) ||
      pd.kind === "workshop" ||
      pd.kind === "speaking" ||
      pd.kind === "due_date" ||
      pd.tonePreference === "anticipation";
    if (!isUpcoming) continue;

    const card = buildAnticipationSpark(pd.label, firstName, pd.id, days, now);
    if (!nearest || days < nearest.days) {
      nearest = { card, days };
    }
  }

  return nearest?.card ?? null;
}

export type ResolvePersonalSparkInput = {
  now: Date;
  firstName?: string | null;
  birthday?: { month: number; day: number } | null;
  personalDates?: PersonalDate[];
  memberSinceIso?: string | null;
};

/**
 * Personal Sparks — highest priority in daily selection.
 * Today: birthday > saved personal dates > membership anniversary.
 * Then: major upcoming personal events (within 7 days).
 */
export function resolvePersonalSpark(
  input: ResolvePersonalSparkInput,
): SparkNoteDailyCard | null {
  const { now, firstName, birthday, personalDates = [], memberSinceIso } =
    input;

  if (birthday && sameMonthDay(birthday.month, birthday.day, now)) {
    return buildBirthdaySpark(firstName, now);
  }

  for (const pd of personalDates) {
    const spark = resolvePersonalDateSpark(pd, firstName, now);
    if (spark) return spark;
  }

  if (memberSinceIso && isAppAnniversaryToday(memberSinceIso, now)) {
    return buildMembershipAnniversarySpark(firstName, now);
  }

  return resolveUpcomingPersonalSpark(personalDates, firstName, now);
}

export function isPersonalSparkId(id: string): boolean {
  return id.startsWith("personal-");
}

function parsePersonalSparkId(
  id: string,
): { kind: string; personalDateId?: string } | null {
  const parts = id.split(":");
  if (parts.length < 2) return null;
  const kind = parts[0]!;
  if (kind === "personal-birthday" || kind === "personal-membership") {
    return { kind };
  }
  if (
    (kind === "personal-anniversary" ||
      kind === "personal-milestone" ||
      kind === "personal-celebration" ||
      kind === "personal-anticipation" ||
      kind === "personal-remembrance" ||
      kind === "personal-business") &&
    parts.length >= 3
  ) {
    return { kind, personalDateId: parts[1] };
  }
  return null;
}

export function rebuildPersonalSparkFromId(
  id: string,
  input: ResolvePersonalSparkInput,
): SparkNoteDailyCard | null {
  const { now, firstName, birthday, personalDates = [], memberSinceIso } =
    input;
  const parsed = parsePersonalSparkId(id);
  if (!parsed) return null;

  if (parsed.kind === "personal-birthday") {
    if (birthday && sameMonthDay(birthday.month, birthday.day, now)) {
      return buildBirthdaySpark(firstName, now);
    }
    return null;
  }

  if (parsed.kind === "personal-membership") {
    if (memberSinceIso && isAppAnniversaryToday(memberSinceIso, now)) {
      return buildMembershipAnniversarySpark(firstName, now);
    }
    return null;
  }

  if (parsed.personalDateId) {
    const pd = personalDates.find((d) => d.id === parsed.personalDateId);
    if (!pd) return null;

    if (parsed.kind === "personal-anticipation" && pd.targetDate) {
      const days = daysUntil(pd.targetDate, now);
      if (days >= 0 && days <= UPCOMING_WINDOW_DAYS) {
        return buildAnticipationSpark(pd.label, firstName, pd.id, days, now);
      }
      return null;
    }

    if (parsed.kind === "personal-remembrance") {
      if (!sameMonthDay(pd.month, pd.day, now)) return null;
      return buildRemembranceSpark(pd.label, firstName, pd.id, now);
    }

    if (parsed.kind === "personal-business") {
      if (!sameMonthDay(pd.month, pd.day, now)) return null;
      return buildBusinessAnniversarySpark(pd.label, firstName, pd.id, now);
    }

    if (
      (pd.kind === "vacation" || pd.kind === "due_date") &&
      pd.targetDate &&
      targetDateMatchesToday(pd.targetDate, now)
    ) {
      return buildAnticipationSpark(pd.label, firstName, pd.id, 0, now);
    }

    if (!sameMonthDay(pd.month, pd.day, now)) return null;

    if (parsed.kind === "personal-anniversary") {
      return buildAnniversarySpark(pd.label, firstName, pd.id, now);
    }
    if (parsed.kind === "personal-celebration") {
      return buildCelebrationSpark(pd.label, firstName, pd.id, now);
    }
    return buildMilestoneSpark(pd.label, firstName, pd.id, now);
  }

  return null;
}
