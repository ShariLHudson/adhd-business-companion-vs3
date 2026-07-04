/**
 * Estate Recommendation Engine — 2–4 personal options, never overwhelm.
 */

import { capabilityById } from "./catalog";
import { consultEstateCapabilities } from "./consult";
import type { CapabilityRecommendationOption } from "./types";

type GoalSet = {
  patterns: readonly RegExp[];
  goalSummary: string;
  capabilityIds: readonly string[];
  reasons: Record<string, string>;
};

const GOAL_SETS: readonly GoalSet[] = [
  {
    patterns: [
      /\b(?:need to focus|can't focus|cannot focus|trouble focusing|distracted|concentrate|stay on task)\b/i,
      /\b(?:help me focus|i need focus)\b/i,
    ],
    goalSummary: "finding your focus",
    capabilityIds: [
      "focus.timer",
      "focus.music",
      "restore.clearmind",
      "place.coffee-house",
      "place.pool",
      "place.garden",
      "focus.breathing",
      "momentum.plan",
    ],
    reasons: {
      "focus.timer":
        "A short time block can hold one task without the pressure of a whole day.",
      "focus.music":
        "Quiet music might help you settle in — café calm or soft instrumentals.",
      "restore.clearmind":
        "Sometimes focus starts by unloading what is crowding your head.",
      "place.pool":
        "A change of air — the pool is peaceful when you need a reset first.",
      "place.coffee-house":
        "Warm café energy can make thinking feel less lonely.",
      "place.garden":
        "A few minutes in the garden before you dive back in.",
      "focus.breathing":
        "A minute of breathing can clear the static before you choose what's next.",
      "momentum.plan":
        "If the hard part is choosing what to focus on, we can sort that first.",
    },
  },
  {
    patterns: [
      /\b(?:overwhelm|overwhelmed|too much|can't keep up|drowning)\b/i,
    ],
    goalSummary: "easing the overwhelm",
    capabilityIds: [
      "restore.clearmind",
      "focus.breathing",
      "place.garden",
      "momentum.plan",
    ],
    reasons: {
      "restore.clearmind":
        "Unload everything onto the page — no organizing required yet.",
      "focus.breathing":
        "A gentle pause so your nervous system can catch up.",
      "place.garden":
        "Soft green space when everything feels loud inside.",
      "momentum.plan":
        "One humane next step when the whole list feels impossible.",
    },
  },
  {
    patterns: [
      /\b(?:stuck|don't know where to start|not sure what to do|what should i do)\b/i,
    ],
    goalSummary: "finding a starting point",
    capabilityIds: [
      "momentum.plan",
      "restore.clearmind",
      "journal.reflect",
      "business.strategy",
    ],
    reasons: {
      "momentum.plan": "Sort what matters and pick one move that counts.",
      "restore.clearmind": "Talk it out until the real block shows itself.",
      "journal.reflect": "Write without performance — clarity often follows.",
      "business.strategy":
        "Think it through with strategy and expert perspectives at the Round Table.",
    },
  },
  {
    patterns: [
      /\b(?:create|write|draft|build|make).*\b(?:sop|procedure|newsletter|email|plan|presentation)\b/i,
      /\b(?:sop|newsletter|business plan|marketing plan)\b/i,
    ],
    goalSummary: "creating something together",
    capabilityIds: [], // defer to consult — single-path creation
    reasons: {},
  },
];

function pickDiverseOptions(
  capabilityIds: readonly string[],
  reasons: Record<string, string>,
  limit: number,
): CapabilityRecommendationOption[] {
  const options: CapabilityRecommendationOption[] = [];
  const seenRooms = new Set<string>();

  for (const id of capabilityIds) {
    if (options.length >= limit) break;
    const entry = capabilityById(id);
    if (!entry?.canRecommend) continue;
    const roomKey = entry.requiredRoomId ?? `inline:${entry.category}`;
    if (seenRooms.has(roomKey) && options.length >= 2) continue;
    seenRooms.add(roomKey);
    options.push({
      capabilityId: id,
      name: entry.name,
      reason: reasons[id] ?? entry.purpose,
      roomId: entry.requiredRoomId,
    });
  }

  return options;
}

export function recommendCapabilitiesForGoal(
  userText: string,
  options?: { limit?: number },
): { goalSummary: string; options: CapabilityRecommendationOption[] } | null {
  const limit = Math.min(options?.limit ?? 4, 4);
  const text = userText.trim();
  if (!text) return null;

  for (const set of GOAL_SETS) {
    if (!set.patterns.some((re) => re.test(text))) continue;
    if (!set.capabilityIds.length) return null;

    const picked = pickDiverseOptions(set.capabilityIds, set.reasons, limit);
    if (picked.length >= 2) {
      return { goalSummary: set.goalSummary, options: picked };
    }
  }

  const consultMatches = consultEstateCapabilities(text, {
    minScore: 35,
    limit: 6,
  });
  const recommendable = consultMatches
    .map((m) => m.entry)
    .filter((e) => e.canRecommend);

  if (recommendable.length >= 2 && recommendable.length <= 6) {
    const isVagueGoal =
      /\b(?:help|need|want|trying)\b/i.test(text) &&
      !/\b(?:create|write|take me|open|go to)\b/i.test(text);
    if (isVagueGoal) {
      return {
        goalSummary: "what might help",
        options: pickDiverseOptions(
          recommendable.map((e) => e.id),
          Object.fromEntries(recommendable.map((e) => [e.id, e.purpose])),
          limit,
        ),
      };
    }
  }

  return null;
}

export function formatRecommendationLine(
  goalSummary: string,
  options: CapabilityRecommendationOption[],
): string {
  const lines = options.map(
    (o, i) => `${i + 1}. ${o.name} — ${o.reason}`,
  );
  return `For ${goalSummary}, a few paths that might help:\n\n${lines.join("\n\n")}\n\nWhich one feels closest — or would you rather stay here and talk it through?`;
}
