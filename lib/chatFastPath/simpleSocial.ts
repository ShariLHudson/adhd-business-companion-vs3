/**
 * Lightweight local replies for simple social openers — no API round-trip.
 */

const SIMPLE_SOCIAL_GREETING_RE =
  /^(?:good\s+(?:morning|afternoon|evening)|hello|hi|hey|yo|howdy)(?:\s+there)?[!.]?\s*$/i;

const GREETING_REPLIES = [
  "Hey — good to see you. What's on your mind?",
  "Hi there. I'm here whenever you're ready.",
  "Hello. Want to talk something through, or just land for a minute?",
  "Hey. What's going on today?",
] as const;

function stablePick(seed: string, options: readonly string[]): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return options[Math.abs(hash) % options.length]!;
}

export function isSimpleSocialGreeting(userText: string): boolean {
  return SIMPLE_SOCIAL_GREETING_RE.test(userText.trim());
}

/** Warm one-line reply for hi/hello — instant, no questionnaire. */
export function simpleSocialGreetingReply(userText: string): string {
  const day = new Date().toISOString().slice(0, 10);
  return stablePick(`${day}:${userText.trim().toLowerCase()}`, GREETING_REPLIES);
}
