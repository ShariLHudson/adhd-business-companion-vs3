import {
  pickFlame,
  FLAME_CHALLENGES,
  FLAME_ENCOURAGEMENTS,
  FLAME_QUESTIONS,
} from "../sample/mentorData";
import type {
  FlameChallenge,
  FlameEncouragement,
  FlameSuggestedQuestion,
} from "../types";

export function getEncouragement(date = new Date()): FlameEncouragement {
  return pickFlame(FLAME_ENCOURAGEMENTS, date);
}

export function getChallenge(date = new Date()): FlameChallenge {
  return pickFlame(FLAME_CHALLENGES, date);
}

export function getSuggestedQuestion(date = new Date()): FlameSuggestedQuestion {
  return pickFlame(FLAME_QUESTIONS, date);
}

export function listThoughtfulQuestions() {
  return [...FLAME_QUESTIONS];
}
