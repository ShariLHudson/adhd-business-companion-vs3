import type { WelcomeSeason } from "@/lib/welcomeLivingRoom";
import type { HospitalityObjectId } from "@/lib/companionHospitalityPrototype";

export type HospitalityItem = {
  id: HospitalityObjectId | string;
  label: string;
  seasons: WelcomeSeason[];
  moods: string[];
  rooms: string[];
  contexts: string[];
  priority: number;
};

/**
 * Hospitality Library — everything Shari can prepare.
 * Tagged for season, mood, room, and context. Selection ranks by priority.
 */
export const HOSPITALITY_LIBRARY: HospitalityItem[] = [
  { id: "coffee", label: "Coffee", seasons: ["autumn", "winter", "spring"], moods: ["morning", "warm"], rooms: ["living-room", "kitchen-table"], contexts: ["daily", "welcome"], priority: 3 },
  { id: "tea-set", label: "Tea", seasons: ["spring", "autumn", "winter"], moods: ["recovery", "rain"], rooms: ["living-room", "window-seat", "kitchen-table"], contexts: ["recovery", "rain"], priority: 3 },
  { id: "cookies", label: "Cookies", seasons: ["autumn", "winter", "holiday"], moods: ["celebration", "friday"], rooms: ["living-room"], contexts: ["friday", "guest"], priority: 4 },
  { id: "cider", label: "Apple cider", seasons: ["autumn"], moods: ["golden-hour"], rooms: ["living-room", "back-deck"], contexts: ["autumn"], priority: 2 },
  { id: "flowers", label: "Fresh flowers", seasons: ["spring", "summer"], moods: ["celebration", "birthday"], rooms: ["living-room"], contexts: ["birthday", "friday"], priority: 2 },
  { id: "tulips", label: "Tulips", seasons: ["spring"], moods: ["morning"], rooms: ["living-room"], contexts: ["iowa-spring"], priority: 2 },
  { id: "cake", label: "Birthday cake", seasons: ["spring", "summer", "autumn", "winter"], moods: ["celebration"], rooms: ["living-room"], contexts: ["birthday"], priority: 1 },
  { id: "birthday-card", label: "Handwritten card", seasons: ["spring", "summer", "autumn", "winter"], moods: ["celebration"], rooms: ["living-room"], contexts: ["birthday"], priority: 1 },
  { id: "travel-guide", label: "Travel guide", seasons: ["summer"], moods: ["anticipation"], rooms: ["adventure-room", "living-room"], contexts: ["vacation"], priority: 1 },
  { id: "suitcase", label: "Suitcase", seasons: ["summer"], moods: ["anticipation"], rooms: ["adventure-room"], contexts: ["vacation"], priority: 1 },
  { id: "journal", label: "Journal", seasons: ["spring", "summer", "autumn", "winter"], moods: ["reflection", "recovery"], rooms: ["living-room", "reading-nook"], contexts: ["recovery", "friday"], priority: 4 },
  { id: "blanket", label: "Blanket", seasons: ["autumn", "winter"], moods: ["recovery", "snow"], rooms: ["living-room", "window-seat"], contexts: ["winter", "rain"], priority: 2 },
  { id: "puzzle", label: "Puzzle", seasons: ["winter"], moods: ["quiet"], rooms: ["living-room"], contexts: ["snow-day"], priority: 5 },
  { id: "holiday-decor", label: "Holiday treats", seasons: ["holiday", "winter"], moods: ["celebration"], rooms: ["living-room"], contexts: ["holiday"], priority: 2 },
];

export function hospitalityForContext(input: {
  season: WelcomeSeason;
  room: string;
  context: string;
  limit?: number;
}): HospitalityItem[] {
  const limit = input.limit ?? 5;
  return HOSPITALITY_LIBRARY.filter(
    (item) =>
      item.seasons.includes(input.season) &&
      item.rooms.includes(input.room) &&
      item.contexts.includes(input.context),
  )
    .sort((a, b) => a.priority - b.priority)
    .slice(0, limit);
}
