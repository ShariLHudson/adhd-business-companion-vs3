import { pickFlame, FLAME_MORNING_MESSAGES } from "../sample/mentorData";
import type { FlameMorningMessage } from "../types";

export function getMorningMessages(): FlameMorningMessage[] {
  return [...FLAME_MORNING_MESSAGES];
}

export function getMorningMessage(date = new Date()): FlameMorningMessage {
  return pickFlame(FLAME_MORNING_MESSAGES, date);
}
