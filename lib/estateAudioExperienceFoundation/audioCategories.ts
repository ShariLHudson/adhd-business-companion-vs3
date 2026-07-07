/**
 * Audio Experience Foundation™ — category registry loader.
 */

import audioCategoriesJson from "@/docs/estate-knowledge-base/audio-categories.json";
import type { AudioCategory } from "./types";

type AudioCategoriesFile = {
  categories: AudioCategory[];
};

const FILE = audioCategoriesJson as AudioCategoriesFile;

export function getAudioCategories(): AudioCategory[] {
  return FILE.categories;
}

export function getAudioCategoryById(categoryId: string): AudioCategory | null {
  return FILE.categories.find((cat) => cat.categoryId === categoryId) ?? null;
}

export function getLiveAudioCategories(): AudioCategory[] {
  return FILE.categories.filter((cat) => cat.status === "Live");
}
