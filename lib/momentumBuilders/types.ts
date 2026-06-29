import type { AppSection } from "@/lib/companionUi";

/**
 * V1 Momentum Builders catalog — EF-focused resets (energy, refocus, calm).
 * Entrepreneurial practice Builders follow T-012: docs/MOMENTUM_BUILDER_FRAMEWORK.md
 * Framework types: lib/sparkMomentumBuilders/types.ts
 */

export const MOMENTUM_BUILDER_CATEGORY_IDS = [
  "reset-energy",
  "wake-brain",
  "refocus",
  "calm-nervous-system",
  "surprise-me",
] as const;

export type MomentumBuilderCategoryId =
  (typeof MOMENTUM_BUILDER_CATEGORY_IDS)[number];

export type MomentumBuilderLaunch =
  | { kind: "game"; gameId: string }
  | { kind: "activity"; activityId: string }
  | { kind: "section"; section: AppSection }
  | { kind: "surprise-pick" };

export type MomentumBuilderItem = {
  id: string;
  title: string;
  description: string;
  timeLabel: string;
  objectId: string;
  categoryId: MomentumBuilderCategoryId;
  launch: MomentumBuilderLaunch;
};

export type MomentumBuilderCategory = {
  id: MomentumBuilderCategoryId;
  title: string;
  tagline: string;
};

export type MomentumBuilderRecommendation = {
  item: MomentumBuilderItem;
  reason: string;
};
