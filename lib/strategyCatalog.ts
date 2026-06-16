/**
 * Strategies hub — separates ADHD (apply now) from Business (create plans).
 */

import type { AppSection } from "./companionUi";
import { compareDropdownLabels } from "./dropdownSort";

export type AdhdStrategyRoute =
  | { kind: "builtin"; strategyId: string }
  | { kind: "activity"; activityId: string }
  | { kind: "section"; section: AppSection };

export type AdhdStrategyHubEntry = {
  id: string;
  label: string;
  route: AdhdStrategyRoute;
};

/** ADHD strategies — tools and techniques to apply right now. */
const ADHD_STRATEGY_HUB_RAW: AdhdStrategyHubEntry[] = [
  { id: "body-double", label: "Body Double", route: { kind: "builtin", strategyId: "body-double" } },
  {
    id: "brain-parking-lot",
    label: "Brain Parking Lot",
    route: { kind: "activity", activityId: "brain-parking-lot" },
  },
  {
    id: "clear-my-mind",
    label: "Clear My Mind",
    route: { kind: "section", section: "brain-dump" },
  },
  {
    id: "decision-helper",
    label: "Decision Helper",
    route: { kind: "activity", activityId: "two-option" },
  },
  {
    id: "first-physical-step",
    label: "First Physical Step",
    route: { kind: "activity", activityId: "first-step-finder" },
  },
  {
    id: "momentum-builder",
    label: "Momentum Builder",
    route: { kind: "activity", activityId: "momentum-restart" },
  },
  {
    id: "safe-for-today",
    label: "Safe For Today",
    route: { kind: "activity", activityId: "safe-for-today" },
  },
  {
    id: "time-blindness-reset",
    label: "Time Blindness Reset",
    route: { kind: "activity", activityId: "time-block-builder" },
  },
  {
    id: "tiny-step-challenge",
    label: "Tiny Step Challenge",
    route: { kind: "builtin", strategyId: "first-tiny-step" },
  },
  {
    id: "waiting-mode-rescue",
    label: "Waiting Mode Rescue",
    route: { kind: "activity", activityId: "what-can-wait" },
  },
];

export const ADHD_STRATEGY_HUB: AdhdStrategyHubEntry[] = [...ADHD_STRATEGY_HUB_RAW].sort(
  (a, b) => compareDropdownLabels(a.label, b.label),
);

export const BUSINESS_STRATEGY_TEMPLATES = [
  "Content Strategy",
  "Launch Strategy",
  "Marketing Strategy",
  "Product Strategy",
  "Sales Strategy",
  "Visibility Strategy",
  "Other Strategy",
] as const;

export type BusinessStrategyTemplate = (typeof BUSINESS_STRATEGY_TEMPLATES)[number];

export const STRATEGIES_HUB = {
  adhd: {
    title: "ADHD Strategies",
    description: "Tools and techniques that help you work with your brain.",
  },
  business: {
    title: "Business Strategies",
    description: "Plans and systems that help grow your business.",
  },
  recommended: {
    title: "Recommended For You",
    description: "Personalized suggestions to try next.",
  },
  saved: {
    title: "Saved Strategies",
    description: "Strategies you created or saved.",
  },
} as const;

export function adhdHubEntry(id: string): AdhdStrategyHubEntry | undefined {
  return ADHD_STRATEGY_HUB.find((e) => e.id === id);
}
