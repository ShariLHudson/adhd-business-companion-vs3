import { getChallenge, getEncouragement, getSuggestedQuestion } from "../guidance";
import { getExecutiveObservation } from "../insights";
import { getMorningMessage } from "../messages";
import { getMentorOverview, getWeeklyReflection } from "../mentor";
import type { FlameMentorOverview } from "../types";

/** FLAME Executive Mentor — Founder personality layer (sample data only). */
export const FounderFlameService = {
  getMorningMessage(date?: Date) {
    return getMorningMessage(date);
  },

  getExecutiveObservation(date?: Date) {
    return getExecutiveObservation(date);
  },

  getEncouragement(date?: Date) {
    return getEncouragement(date);
  },

  getChallenge(date?: Date) {
    return getChallenge(date);
  },

  getWeeklyReflection(date?: Date) {
    return getWeeklyReflection(date);
  },

  getSuggestedQuestion(date?: Date) {
    return getSuggestedQuestion(date);
  },

  getMentorOverview(date?: Date): FlameMentorOverview {
    return getMentorOverview(date);
  },
};

export function getFlameMorningMessage(date?: Date) {
  return FounderFlameService.getMorningMessage(date);
}

export function getFlameMentorOverview(date?: Date) {
  return FounderFlameService.getMentorOverview(date);
}
