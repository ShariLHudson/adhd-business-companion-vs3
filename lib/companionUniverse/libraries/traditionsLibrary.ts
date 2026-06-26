import type { WelcomeSeason } from "@/lib/welcomeLivingRoom";

/**
 * Layer 4 — Traditions Library™
 * These happen because it's Shari's home — not because of the guest.
 */
export type HomeTradition = {
  id: string;
  label: string;
  seasons?: WelcomeSeason[];
  months?: number[];
  preparation: string;
  /** Never guest-triggered — calendar and home rhythm only. */
  belongsTo: "home";
};

export const HOME_TRADITIONS_LIBRARY: HomeTradition[] = [
  {
    id: "october-pumpkins",
    label: "October pumpkins",
    months: [10],
    seasons: ["autumn"],
    preparation: "Pumpkins appear on the porch and table",
    belongsTo: "home",
  },
  {
    id: "december-tree",
    label: "December tree",
    months: [12],
    seasons: ["holiday", "winter"],
    preparation: "The tree is quietly decorated",
    belongsTo: "home",
  },
  {
    id: "spring-tulips",
    label: "Spring tulips",
    months: [3, 4, 5],
    seasons: ["spring"],
    preparation: "Tulips bloom outside the window",
    belongsTo: "home",
  },
  {
    id: "summer-porch-ferns",
    label: "Summer porch ferns",
    months: [6, 7, 8],
    seasons: ["summer"],
    preparation: "Porch ferns return for summer",
    belongsTo: "home",
  },
  {
    id: "holiday-cookies",
    label: "Holiday cookies",
    months: [11, 12],
    seasons: ["holiday", "winter"],
    preparation: "Fresh cookies during the holidays",
    belongsTo: "home",
  },
];

export function activeTraditions(now = new Date()): HomeTradition[] {
  const month = now.getMonth() + 1;
  return HOME_TRADITIONS_LIBRARY.filter(
    (tradition) =>
      tradition.months?.includes(month) ??
      false,
  );
}
