/**
 * Resolve OpenAI API key from env — tolerates alternate names and whitespace.
 */

const CANDIDATE_KEYS = [
  "OPENAI_API_KEY",
  "OPENAI_KEY",
  "OPENAI_SECRET_KEY",
] as const;

export function resolveOpenAiApiKey(): string | null {
  for (const name of CANDIDATE_KEYS) {
    const value = process.env[name]?.trim();
    if (value && value.length >= 20) return value;
  }
  return null;
}

export function requireOpenAiApiKey(): string {
  const key = resolveOpenAiApiKey();
  if (!key) {
    throw new Error("OpenAI API key is not configured.");
  }
  return key;
}
