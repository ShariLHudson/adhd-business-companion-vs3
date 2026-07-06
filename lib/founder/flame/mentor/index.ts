import {
  pickFlame,
  pickFlamePanels,
  FLAME_WEEKLY_REFLECTIONS,
} from "../sample/mentorData";
import type { FlameMentorOverview, FlameWeeklyReflection } from "../types";
import { getMorningMessage } from "../messages";
import { getChallenge, getEncouragement, getSuggestedQuestion } from "../guidance";
import { getExecutiveObservation } from "../insights";

export function getWeeklyReflection(date = new Date()): FlameWeeklyReflection {
  return pickFlame(FLAME_WEEKLY_REFLECTIONS, date);
}

export function getMentorOverview(date = new Date()): FlameMentorOverview {
  return {
    morningMessage: getMorningMessage(date),
    observation: getExecutiveObservation(date),
    encouragement: getEncouragement(date),
    challenge: getChallenge(date),
    suggestedQuestion: getSuggestedQuestion(date),
    weeklyReflection: getWeeklyReflection(date),
    panels: pickFlamePanels(date),
  };
}
