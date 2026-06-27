import { SHARI_VOICE_BIBLE_ENTRIES } from "./entries";
import {
  isLineOnCooldown,
  recordOpeningComposite,
  recordVoiceUsage,
} from "./cooldownStore";
import {
  assertShariVoice,
  sanitizeShariVoice,
  trimToOpeningLength,
  violatesShariVoice,
} from "./rules";
import {
  applyNameNaturally,
  evaluateNameIntelligence,
  type NameLineContext,
} from "@/lib/relationshipIntelligence";
import type {
  ShariVoiceContext,
  ShariVoiceKind,
  ShariVoiceLine,
  ShariVoiceSelection,
} from "./types";

function dayKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}

function stableHash(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function matchesStage(line: ShariVoiceLine, stage: ShariVoiceContext["relationshipStage"]): boolean {
  if (!line.relationshipStages?.length) return true;
  return line.relationshipStages.includes(stage);
}

function matchesTime(line: ShariVoiceLine, time: ShariVoiceContext["timeOfDay"]): boolean {
  if (!line.timeOfDay?.length) return true;
  return line.timeOfDay.includes(time);
}

function matchesSeason(line: ShariVoiceLine, season?: ShariVoiceContext["season"]): boolean {
  if (!line.seasons?.length || !season) return true;
  return line.seasons.includes(season);
}

function matchesEmotion(
  line: ShariVoiceLine,
  tag?: ShariVoiceContext["emotionalTag"],
): boolean {
  if (!line.emotionalTags?.length) return true;
  if (!tag) return line.emotionalTags.includes("neutral");
  return line.emotionalTags.includes(tag);
}

function matchesRoom(line: ShariVoiceLine, room?: ShariVoiceContext["lastRoom"]): boolean {
  if (!line.rooms?.length) return true;
  if (!room) return false;
  return line.rooms.includes(room);
}

function scoreLine(line: ShariVoiceLine, ctx: ShariVoiceContext, categoryBoost: boolean): number {
  let score = line.frequencyWeight ?? 1;
  if (categoryBoost && line.category === ctx.visitCategory) score += 3;
  if (ctx.birthdayToday && line.category === "birthday") score += 5;
  if (ctx.isMonday && line.tags?.includes("monday")) score += 2;
  if (ctx.isFriday && line.tags?.includes("friday")) score += 2;
  if (ctx.isWeekend && line.tags?.includes("weekend")) score += 2;
  if (ctx.weather === "rain" && line.tags?.includes("rain")) score += 2;
  if (ctx.weather === "snow" && line.tags?.includes("snow")) score += 2;
  if (ctx.projectRecentlyCompleted && line.tags?.includes("win")) score += 2;
  return score;
}

function filterCandidates(
  kind: ShariVoiceKind,
  ctx: ShariVoiceContext,
  options?: {
    category?: ShariVoiceContext["visitCategory"];
    tag?: string;
    strictCategory?: boolean;
  },
): ShariVoiceLine[] {
  const pool = SHARI_VOICE_BIBLE_ENTRIES.filter((line) => {
    if (line.kind !== kind) return false;
    if (violatesShariVoice(line.text)) return false;
    if (!matchesStage(line, ctx.relationshipStage)) return false;
    if (!matchesTime(line, ctx.timeOfDay)) return false;
    if (!matchesSeason(line, ctx.season)) return false;
    if (!matchesEmotion(line, ctx.emotionalTag)) return false;
    if (!matchesRoom(line, ctx.lastRoom ?? undefined)) return false;
    if (options?.tag && !line.tags?.includes(options.tag)) return false;
    if (
      options?.strictCategory &&
      options.category &&
      line.category !== options.category
    ) {
      return false;
    }
    if (
      isLineOnCooldown(
        line.id,
        kind,
        ctx.sessionVisitIndex,
        line.cooldownVisits,
      )
    ) {
      return false;
    }
    return true;
  });

  return pool;
}

function pickWeighted(
  candidates: ShariVoiceLine[],
  ctx: ShariVoiceContext,
  kind: ShariVoiceKind,
  salt: string,
  categoryBoost: boolean,
): ShariVoiceLine | null {
  if (!candidates.length) return null;
  const now = ctx.now ?? new Date();
  const seed = `${dayKey(now)}:${ctx.sessionVisitIndex}:${kind}:${salt}`;
  const hash = stableHash(seed);
  const scored = candidates
    .map((line) => ({
      line,
      score: scoreLine(line, ctx, categoryBoost) * 100 + (stableHash(line.id) % 17),
    }))
    .sort((a, b) => b.score - a.score);

  const topBand = scored.slice(0, Math.min(8, scored.length));
  return topBand[hash % topBand.length]?.line ?? scored[0]!.line;
}

export function selectVoiceLine(
  kind: ShariVoiceKind,
  ctx: ShariVoiceContext,
  options?: {
    category?: ShariVoiceContext["visitCategory"];
    tag?: string;
    record?: boolean;
    salt?: string;
  },
): ShariVoiceSelection | null {
  const category =
    options?.category ??
    ctx.visitCategory ??
    (ctx.timeOfDay === "midday" ? "midday" : ctx.timeOfDay);

  let candidates = filterCandidates(kind, ctx, {
    category,
    tag: options?.tag,
    strictCategory: true,
  });

  if (!candidates.length) {
    candidates = filterCandidates(kind, ctx, { category, tag: options?.tag });
  }

  if (!candidates.length) {
    candidates = filterCandidates(kind, ctx);
  }

  const picked = pickWeighted(
    candidates,
    ctx,
    kind,
    options?.salt ?? "default",
    Boolean(category),
  );
  if (!picked) return null;

  const lineContext: NameLineContext =
    kind === "greeting" || kind === "invitation"
      ? "greeting"
      : kind === "echo"
        ? "echo"
        : kind === "question"
          ? "invite"
          : "chat";

  const isFirstGreetingOfDay =
    ctx.timeOfDay === "morning" &&
    (ctx.returnIntervalDays == null || ctx.returnIntervalDays < 1);

  const nameDecision = evaluateNameIntelligence({
    firstName: ctx.firstName,
    lineContext,
    isFirstGreetingOfDay: kind === "greeting" && isFirstGreetingOfDay,
    returnIntervalDays: ctx.returnIntervalDays,
    celebrationActive:
      ctx.birthdayToday || ctx.emotionalTag === "celebrating",
    projectRecentlyCompleted: ctx.projectRecentlyCompleted,
    recoveryGentle: ctx.recoveryGentle,
    scenario: ctx.birthdayToday
      ? "celebration"
      : kind === "greeting" && isFirstGreetingOfDay
        ? "first_greeting_of_day"
        : ctx.emotionalTag === "celebrating"
          ? "celebration"
          : ctx.returnIntervalDays != null && ctx.returnIntervalDays >= 3
            ? "reconnect_after_absence"
            : "ordinary",
  });

  const rawText = sanitizeShariVoice(picked.text);
  const namedText = applyNameNaturally(
    rawText,
    ctx.firstName,
    nameDecision.useName,
  );

  const text = assertShariVoice(trimToOpeningLength(namedText), picked.id);

  if (options?.record !== false) {
    recordVoiceUsage({
      lineId: picked.id,
      kind,
      visitIndex: ctx.sessionVisitIndex,
    });
  }

  return { line: picked, text };
}

export function selectEchoLine(
  ctx: ShariVoiceContext,
  emotionalTag: ShariVoiceContext["emotionalTag"],
  category?: ShariVoiceContext["visitCategory"],
): ShariVoiceSelection | null {
  return selectVoiceLine(
    "echo",
    { ...ctx, emotionalTag },
    {
      category: category ?? (emotionalTag === "overwhelmed" ? "overwhelmed" : undefined),
      salt: `echo-${emotionalTag ?? "neutral"}`,
    },
  );
}

export function selectClarifyQuestion(ctx: ShariVoiceContext): ShariVoiceSelection | null {
  return selectVoiceLine("question", ctx, { tag: "clarify", salt: "clarify" });
}

export function selectWalkingLine(
  ctx: ShariVoiceContext,
  room?: ShariVoiceContext["lastRoom"],
): ShariVoiceSelection | null {
  return selectVoiceLine("walking", { ...ctx, lastRoom: room ?? null }, {
    salt: `walk-${room ?? "any"}`,
  });
}
