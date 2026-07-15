/**
 * Daily welcome lines inside the frosted panel — human, not dashboard copy.
 */

const QUIET_DAYS = new Set([0, 3]); // Sunday + Wednesday — presence only

const MORNING_LINES = [
  "Good morning.",
  "What's on your mind today?",
  "What would you like to create today?",
  "What's the most important thing we can accomplish together today?",
] as const;

const RETURN_LINES = [
  "Welcome back.",
  "What feels most important today?",
  "I'm glad you're here.",
] as const;

const PRESENCE_ONLY = "I'm here whenever you're ready." as const;

function daySeed(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

function pickLine<T extends readonly string[]>(lines: T, seed: number): string {
  return lines[seed % lines.length]!;
}

export type WelcomeHomeDailyGreetingInput = {
  isFirstVisit?: boolean;
  isReturningSameDay?: boolean;
  now?: Date;
};

export function resolveWelcomeHomeDailyGreeting(
  input: WelcomeHomeDailyGreetingInput = {},
): string | null {
  const now = input.now ?? new Date();
  const seed = daySeed(now);

  if (QUIET_DAYS.has(now.getDay()) && seed % 5 !== 0) {
    return PRESENCE_ONLY;
  }

  if (input.isFirstVisit) {
    return pickLine(MORNING_LINES, seed);
  }

  const hour = now.getHours();
  if (hour < 12) {
    return pickLine(MORNING_LINES, seed);
  }

  return pickLine(RETURN_LINES, seed + hour);
}
