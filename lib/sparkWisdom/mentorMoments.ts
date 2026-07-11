/**
 * Spec 127 — Mentor Moments
 */

import type { MentorMomentCue } from "./types";

const MENTOR_TRIGGERS =
  /\b(mean a lot|been on my mind|hard lesson|learned the hard way|years of|when i started)\b/i;

export function recommendMentorMoment(
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
): MentorMomentCue | null {
  const userTurns = history.filter((line) => line.role === "user").length;
  if (userTurns < 3) return null;

  if (!MENTOR_TRIGGERS.test(message) && userTurns % 9 !== 0) return null;

  return {
    appropriate: true,
    opener: "Can I tell you something I've learned?",
    guidance:
      "Warm, personal, brief — mentor voice, not lecture. Only when conversation genuinely calls for it.",
  };
}
