import { imageContextById } from "./imageContextRegistry";
import {
  COMPANION_PRESENCE_SCENE_CATALOG,
  COMPANION_PRESENCE_WELCOME_IMAGE_ID,
} from "@/lib/companionPresenceLibrary/sceneCatalog";
import type { CompanionEnvironmentInput } from "./types";

function dayKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}

function scoreFromRegistry(
  id: string,
  input: CompanionEnvironmentInput,
): number {
  const context = imageContextById(id);
  if (!context) return 0;

  let score = 0;
  if (context.timeOfDay.includes(input.timeOfDay)) score += 30;
  if (context.seasons.includes(input.season)) score += 25;
  if (input.recoveryGentle && context.emotionalTone.includes("recovery")) {
    score += 40;
  }
  if (input.lowEnergy && context.emotionalTone.includes("gentle")) score += 35;
  if (input.businessFocus && context.emotionalTone.includes("business")) {
    score += 35;
  }
  if (input.birthdayToday && context.emotionalTone.includes("celebratory")) {
    score += 50;
  }
  return score;
}

function photographReason(
  id: string,
  input: CompanionEnvironmentInput,
): string {
  if (input.isFirstMeeting) return "first welcome — the room was already waiting";
  if (input.birthdayToday) return "birthday — someone expected you";
  if (input.recoveryGentle) return "gentle day — softer light, softer pace";
  if (input.lowEnergy) return "low energy — honest and unhurried";
  if (input.businessFocus) return "business focus — desk energy when you need it";
  if (input.timeOfDay === "evening" || input.timeOfDay === "night") {
    return "evening — lamp already on";
  }
  if (input.timeOfDay === "morning") return "morning — coffee and calm";
  const context = imageContextById(id);
  return context
    ? `${input.season} ${input.weather ?? "clear"} — ${context.compositionNotes.toLowerCase()}`
    : "today felt like this room";
}

export function selectWelcomePhotograph(input: CompanionEnvironmentInput): {
  id: string;
  reason: string;
} {
  const now = input.now ?? new Date();
  const candidates = COMPANION_PRESENCE_SCENE_CATALOG.filter(
    (entry) => entry.surfaces?.includes("chat-welcome") || entry.welcomeHero,
  );
  const pool = candidates.length > 0 ? candidates : COMPANION_PRESENCE_SCENE_CATALOG;

  let best = pool[0]!;
  let bestScore = -1;
  for (const entry of pool) {
    let score = scoreFromRegistry(entry.id, input);
    if (entry.welcomeHero) score += 15;
    if (entry.timeOfDay?.includes(input.timeOfDay)) score += 20;

    const tieSeed = `${dayKey(now)}:${entry.id}`;
    const tie = score * 1000 + (tieSeed.charCodeAt(0) % 100);
    if (tie > bestScore) {
      bestScore = tie;
      best = entry;
    }
  }

  if (input.isFirstMeeting) {
    best =
      pool.find((e) => e.id === COMPANION_PRESENCE_WELCOME_IMAGE_ID) ?? best;
  }

  return {
    id: best.id,
    reason: photographReason(best.id, input),
  };
}
