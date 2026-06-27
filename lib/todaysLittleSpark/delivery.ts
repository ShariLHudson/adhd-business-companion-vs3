const OPENERS = [
  "Before we get started…",
  "I thought of you when I saw this…",
  "Something small made me smile today…",
  "I almost didn't mention this, but…",
] as const;

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Format spark delivery — conversational, never trivia-calendar tone.
 * Bodies in the catalog are already written in Shari's voice; openers rotate for variety.
 */
export function formatSparkDelivery(
  body: string,
  seed: string,
  options?: { includeOpener?: boolean },
): string {
  const trimmed = body.trim();
  if (!options?.includeOpener) return trimmed;

  const alreadyConversational =
    /^(before we|i thought|something small|i almost|today's little|it's |there's )/i.test(
      trimmed,
    );
  if (alreadyConversational) return trimmed;

  const opener = OPENERS[hashSeed(seed) % OPENERS.length]!;
  return `${opener} ${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)}`;
}
