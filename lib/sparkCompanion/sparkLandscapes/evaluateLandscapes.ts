import type { SparkLandscapeDecision, SparkLandscapeId } from "./types";
import { SPARK_LANDSCAPES } from "./landscapes";

const FOG_RE =
  /\b(?:brain fog|foggy|can'?t focus|too much information|mental overload|poor sleep|hard to concentrate|everything at once)\b/i;

const BACKPACK_RE =
  /\b(?:perfectionism|compare myself|guilt|ashamed|expectations|emotional weight|weighing on me|heavy feeling|fear of)\b/i;

const CROSSROADS_RE =
  /\b(?:too many choices|decision fatigue|competing priorities|which path|can'?t decide between|crossroads)\b/i;

const MAZE_RE =
  /\b(?:confused|tangled|can'?t organize|thoughts are everywhere|no clarity|all over the place)\b/i;

const BRIDGE_RE =
  /\b(?:can'?t start|too big|overwhelming project|don'?t know where to begin|hard to get going|just can'?t seem to get going|feel stuck|feels so hard)\b/i;

const MIRROR_POND_RE =
  /\b(?:lost confidence|negative self[- ]talk|forget (?:my |how far|what i)|not good enough|self[- ]doubt|harsh on myself)\b/i;

const MOUNTAIN_RE =
  /\b(?:long[- ]term goal|slow progress|big project|years away|so far to go|large project)\b/i;

const RIVER_RE =
  /\b(?:transition|life change|everything changing|pivot|new chapter|uncertain future|in between)\b/i;

const SEED_RE =
  /\b(?:early stage|just started|no results yet|nothing to show|building foundation|before it shows)\b/i;

const CAMPFIRE_RE =
  /\b(?:need to process|reflect|just talk|not ready to act|sit with|need connection|restoration)\b/i;

const MEMBER_USED_LANDSCAPE_RE =
  /\b(?:in the fog|carrying (?:the )?backpack|at the crossroads|the bridge|mirror pond|campfire|the maze)\b/i;

type ScoredLandscape = { id: SparkLandscapeId; score: number };

function scoreLandscape(text: string, id: SparkLandscapeId, re: RegExp, weight = 1): ScoredLandscape | null {
  if (re.test(text)) return { id, score: weight };
  if (MEMBER_USED_LANDSCAPE_RE.test(text) && text.toLowerCase().includes(id.replace("_", " "))) {
    return { id, score: 2 };
  }
  return null;
}

export function evaluateSparkLandscapes(input: {
  userText: string;
  overwhelmed?: boolean;
}): SparkLandscapeDecision {
  const text = input.userText.trim();

  if (!text) {
    return {
      primary: "campfire",
      secondary: [],
      confidence: "low",
      optionalMetaphor: null,
      reason: "empty — gentle presence",
    };
  }

  const scores: ScoredLandscape[] = [];

  const checks: Array<[SparkLandscapeId, RegExp, number?]> = [
    ["fog", FOG_RE, input.overwhelmed ? 2 : 1],
    ["backpack", BACKPACK_RE],
    ["crossroads", CROSSROADS_RE],
    ["maze", MAZE_RE],
    ["bridge", BRIDGE_RE, 1.5],
    ["mirror_pond", MIRROR_POND_RE],
    ["mountain", MOUNTAIN_RE],
    ["river", RIVER_RE],
    ["seed", SEED_RE],
    ["campfire", CAMPFIRE_RE],
  ];

  for (const [id, re, weight] of checks) {
    const hit = scoreLandscape(text, id, re, weight ?? 1);
    if (hit) scores.push(hit);
  }

  if (/\b(?:i feel stuck|can'?t explain|don'?t know why this feels so hard)\b/i.test(text)) {
    scores.push({ id: "bridge", score: 1.2 });
    scores.push({ id: "fog", score: 0.8 });
  }

  if (input.overwhelmed && !scores.some((s) => s.id === "fog")) {
    scores.push({ id: "fog", score: 1 });
  }

  scores.sort((a, b) => b.score - a.score);

  if (scores.length === 0) {
    return {
      primary: "bridge",
      secondary: [],
      confidence: "low",
      optionalMetaphor: null,
      reason: "default — gentle next plank",
    };
  }

  const primary = scores[0]!.id;
  const secondary = scores.slice(1, 3).map((s) => s.id);
  const confidence =
    scores[0]!.score >= 2 ? "high" : scores[0]!.score >= 1.2 ? "medium" : "low";

  const optionalMetaphor =
    confidence === "high"
      ? SPARK_LANDSCAPES[primary].gentleMetaphor
      : null;

  return {
    primary,
    secondary,
    confidence,
    optionalMetaphor,
    reason: `landscape: ${primary}${secondary.length ? ` + ${secondary.join(", ")}` : ""}`,
  };
}

export function memberUsedLandscapeLanguage(text: string): boolean {
  return MEMBER_USED_LANDSCAPE_RE.test(text.trim());
}
