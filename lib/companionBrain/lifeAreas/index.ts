export type * from "./types";
export { SYSTEM_LIFE_AREAS, getSystemLifeArea } from "./systemLifeAreas";
export {
  readUserLifeAreas,
  createUserLifeArea,
  readRecentLifeAreaIds,
  touchRecentLifeArea,
  resetUserLifeAreasForTests,
} from "./userLifeAreasStore";
export {
  normalizeLifeAreaPhrase,
  readLifeAreaCorrections,
  recordLifeAreaCorrection,
  resetLifeAreaLearningForTests,
} from "./lifeAreaLearningStore";
export {
  detectSmartLifeAreaSuggestions,
  readSuppressedSmartLifeAreas,
  suppressSmartLifeArea,
  resetSmartLifeAreaSuppressForTests,
} from "./smartLifeAreaSuggestions";
export { LIFE_AREA_AUTO_APPLY_THRESHOLD } from "./types";

import { SYSTEM_LIFE_AREAS } from "./systemLifeAreas";
import { readUserLifeAreas } from "./userLifeAreasStore";
import type { LifeArea } from "./types";

export function getAllLifeAreas(): LifeArea[] {
  return [...SYSTEM_LIFE_AREAS, ...readUserLifeAreas()];
}

export function getLifeAreaById(id: string): LifeArea | undefined {
  return getAllLifeAreas().find((a) => a.id === id);
}
