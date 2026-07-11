import type { CanonTopic } from "./types";

const ESTATE_IDENTITY_RE =
  /\bwhat\s+is\s+spark\s+estate\b|\btell\s+me\s+about\s+spark\s+estate\b|\babout\s+spark\s+estate\b|\bspark\s+estate\s+™?\s*\?/i;
const ESTATE_PURPOSE_RE =
  /\b(?:what\s+is\s+the\s+)?purpose\s+of\s+spark\s+estate\b|\bwhy\s+(?:does\s+)?spark\s+estate\s+exist\b/i;
const ESTATE_RE =
  /\bspark\s+estate\b|\bestate\b.*\b(?:room|place|fictional|real|iowa)\b/i;
const ESTATE_REALITY_RE =
  /\b(?:is\s+)?spark\s+estate\b.*\b(?:real|actual|physical|exist|really)\b|\b(?:real|actual)\s+(?:place|location|estate)\b.*\bspark\b/i;
const ESTATE_LOCATION_RE =
  /\bwhere\b.*\b(?:is\s+)?spark\s+estate\b|\bspark\s+estate\b.*\bwhere\b|\blocated\b.*\bspark\s+estate\b/i;
const ESTATE_CREATOR_RE =
  /\bwho\b.*\b(?:created|built|founded|made)\b.*\bspark\s+estate\b|\bwho\s+created\s+spark\b/i;
const KINSEY_RE =
  /\bkinsey\b|\b(?:the\s+)?dog(?:'s)?\b|\b(?:white\s+)?lhasa\s+poo\b/i;
const KINSEY_PICTURE_RE =
  /\b(?:dog|kinsey|puppy|pet)\b.*\b(?:picture|photo|image|pic)\b|\b(?:picture|photo|image|pic)\b.*\b(?:dog|kinsey|puppy|pet)\b|\bdog(?:'s)?\s+name\b/i;
const SHARI_RE =
  /\bshari\s+hudson\b|\bwho\s+(?:is|'s)\s+shari\b|\bwho\s+created\s+spark\b/i;
const ROOMS_RE =
  /\b(?:which|what)\s+rooms?\b.*\b(?:estate|spark)\b|\b(?:estate|spark)\s+rooms?\b|\brooms?\s+(?:are\s+)?(?:in|at)\s+(?:the\s+)?(?:estate|spark)\b|\bchamber\b|\bevidence\s+vault\b|\bhall\s+of\s+accomplishments\b/i;

export function detectCanonTopics(userText: string): CanonTopic[] {
  const text = userText.trim();
  if (!text) return [];

  const topics = new Set<CanonTopic>();

  if (ESTATE_IDENTITY_RE.test(text)) topics.add("estate_identity");
  if (ESTATE_PURPOSE_RE.test(text)) topics.add("estate_purpose");
  if (ESTATE_REALITY_RE.test(text)) topics.add("estate_reality");
  if (ESTATE_LOCATION_RE.test(text)) topics.add("estate_location");
  if (ESTATE_CREATOR_RE.test(text)) topics.add("estate_creator");
  if (ESTATE_RE.test(text)) topics.add("estate");
  if (KINSEY_PICTURE_RE.test(text)) topics.add("kinsey_picture");
  if (KINSEY_RE.test(text)) topics.add("kinsey");
  if (SHARI_RE.test(text)) topics.add("shari");
  if (ROOMS_RE.test(text)) topics.add("rooms");

  return [...topics];
}

export function isCanonIdentityQuestion(userText: string): boolean {
  return detectCanonTopics(userText).length > 0;
}
