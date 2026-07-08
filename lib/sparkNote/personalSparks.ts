import type { PersonalDate } from "@/lib/recognition/types";
import { isAppAnniversaryToday } from "@/lib/shariMemberSince";
import { dayKey } from "./persistence";
import type { SparkNoteDailyCard } from "./types";

function sameMonthDay(month: number, day: number, now: Date): boolean {
  return now.getMonth() + 1 === month && now.getDate() === day;
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
    shortTitle: "Happy Birthday",
    teaser: "Today is your day — celebrate, reflect, and dream forward.",
    whatHappened:
      "Birthdays mark more than candles and cake. They're a natural pause — a moment to notice how far you've come, who you've become, and what still excites you about what's ahead.",
    whyItMatters:
      "Taking time to celebrate yourself isn't selfish — it's recognition that your presence matters. Every year brings new wisdom, new connections, and new possibilities.",
    sparkApplication:
      "What's one thing you're proud of from this past year? What's one dream you'd like to carry into the year ahead?",
    tags: ["birthday", "celebration", "personal"],
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
    tags: ["anniversary", "personal"],
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
  if (
    (pd.kind === "vacation" || pd.kind === "due_date") &&
    pd.targetDate &&
    targetDateMatchesToday(pd.targetDate, now)
  ) {
    return buildCelebrationSpark(pd.label, firstName, pd.id, now);
  }

  if (!sameMonthDay(pd.month, pd.day, now)) return null;

  if (pd.kind === "anniversary") {
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

export type ResolvePersonalSparkInput = {
  now: Date;
  firstName?: string | null;
  birthday?: { month: number; day: number } | null;
  personalDates?: PersonalDate[];
  memberSinceIso?: string | null;
};

/**
 * Personal Sparks — highest priority in daily selection.
 * Birthday > saved personal dates > membership anniversary.
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

  return null;
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
      kind === "personal-celebration") &&
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

    if (
      (pd.kind === "vacation" || pd.kind === "due_date") &&
      pd.targetDate &&
      targetDateMatchesToday(pd.targetDate, now)
    ) {
      return buildCelebrationSpark(pd.label, firstName, pd.id, now);
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
