import { pickFlame, FLAME_OBSERVATIONS } from "../sample/mentorData";
import type { FlameExecutiveObservation } from "../types";

export function getExecutiveObservation(
  date = new Date(),
): FlameExecutiveObservation {
  return pickFlame(FLAME_OBSERVATIONS, date);
}

export function listExecutiveObservations(): FlameExecutiveObservation[] {
  return [...FLAME_OBSERVATIONS];
}
