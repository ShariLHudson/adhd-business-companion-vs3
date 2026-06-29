import { getActivityById } from "@/lib/companionActivities";
import type { AppSection } from "@/lib/companionUi";
import {
  MOMENTUM_GAMES,
  playableMomentumGames,
  type MomentumNeedId,
} from "@/lib/momentumGames";
import type {
  MomentumBuilderCategory,
  MomentumBuilderCategoryId,
  MomentumBuilderItem,
} from "./types";

export const MOMENTUM_BUILDER_CATEGORIES: MomentumBuilderCategory[] = [
  {
    id: "reset-energy",
    title: "Reset My Energy",
    tagline: "Gentle ways to refill when your battery is low.",
  },
  {
    id: "wake-brain",
    title: "Wake Up My Brain",
    tagline: "Light stimulation when everything feels flat.",
  },
  {
    id: "refocus",
    title: "Refocus",
    tagline: "Small moves that help you re-enter the work.",
  },
  {
    id: "calm-nervous-system",
    title: "Calm My Nervous System",
    tagline: "Soften the noise and come back to steady ground.",
  },
  {
    id: "surprise-me",
    title: "Surprise Me",
    tagline: "Let the room choose — no decisions required.",
  },
];

const GAME_PRIMARY_CATEGORY: Record<MomentumNeedId, MomentumBuilderCategoryId> =
  {
    "focus-attention": "refocus",
    "momentum-action": "refocus",
    "creative-spark": "wake-brain",
    "mental-vacation": "calm-nervous-system",
    "just-for-fun": "surprise-me",
  };

function activityItem(
  activityId: string,
  categoryId: MomentumBuilderCategoryId,
  objectId: string,
): MomentumBuilderItem | null {
  const activity = getActivityById(activityId);
  if (!activity) return null;
  return {
    id: `activity-${activityId}`,
    title: activity.title,
    description: activity.helpsWith,
    timeLabel: activity.timeLabel,
    objectId,
    categoryId,
    launch: { kind: "activity", activityId },
  };
}

function sectionItem(
  id: string,
  title: string,
  description: string,
  timeLabel: string,
  objectId: string,
  categoryId: MomentumBuilderCategoryId,
  section: AppSection,
): MomentumBuilderItem {
  return {
    id,
    title,
    description,
    timeLabel,
    objectId,
    categoryId,
    launch: { kind: "section", section },
  };
}

const CURATED_ACTIVITIES: Array<{
  activityId: string;
  categoryId: MomentumBuilderCategoryId;
  objectId: string;
}> = [
  { activityId: "low-battery-mode", categoryId: "reset-energy", objectId: "breathing" },
  { activityId: "momentum-restart", categoryId: "refocus", objectId: "games" },
  { activityId: "first-step-finder", categoryId: "refocus", objectId: "games" },
  { activityId: "brain-parking-lot", categoryId: "refocus", objectId: "clear-my-mind" },
  { activityId: "priority-sort", categoryId: "refocus", objectId: "plan-my-day" },
  { activityId: "five-senses", categoryId: "calm-nervous-system", objectId: "breathing" },
  { activityId: "lower-the-noise", categoryId: "calm-nervous-system", objectId: "breathing" },
  { activityId: "safe-for-today", categoryId: "calm-nervous-system", objectId: "todays-reality" },
  { activityId: "one-thing-only", categoryId: "wake-brain", objectId: "clear-my-mind" },
];

const CURATED_SECTIONS: MomentumBuilderItem[] = [
  sectionItem(
    "section-breathe",
    "Breathe & Reset",
    "A short breathing reset when your nervous system needs care.",
    "3–5 min",
    "breathing",
    "calm-nervous-system",
    "breathe",
  ),
  sectionItem(
    "section-peaceful-places",
    "Peaceful Places",
    "Step into a calming place — sound, stillness, and room to breathe.",
    "5–10 min",
    "focus-audio",
    "calm-nervous-system",
    "focus-audio",
  ),
  sectionItem(
    "section-spin-wheel",
    "Spin The Wheel",
    "Let chance pick one small move when everything feels equally loud.",
    "2–4 min",
    "spin-wheel",
    "surprise-me",
    "spin-wheel",
  ),
];

const SURPRISE_PICK_ITEM: MomentumBuilderItem = {
  id: "surprise-pick",
  title: "Surprise Me",
  description: "One playful reset, chosen for you right now.",
  timeLabel: "1–5 min",
  objectId: "games",
  categoryId: "surprise-me",
  launch: { kind: "surprise-pick" },
};

function gamesForCategory(categoryId: MomentumBuilderCategoryId): MomentumBuilderItem[] {
  return playableMomentumGames()
    .filter((game) => GAME_PRIMARY_CATEGORY[game.need] === categoryId)
    .filter((game) => game.id !== "spin-the-wheel")
    .map((game) => ({
      id: `game-${game.id}`,
      title: game.label,
      description: game.description,
      timeLabel: game.time,
      objectId: game.objectId,
      categoryId,
      launch: { kind: "game", gameId: game.id },
    }));
}

function buildCatalog(): MomentumBuilderItem[] {
  const byId = new Map<string, MomentumBuilderItem>();

  for (const row of CURATED_ACTIVITIES) {
    const item = activityItem(row.activityId, row.categoryId, row.objectId);
    if (item) byId.set(item.id, item);
  }

  for (const item of CURATED_SECTIONS) {
    byId.set(item.id, item);
  }

  byId.set(SURPRISE_PICK_ITEM.id, SURPRISE_PICK_ITEM);

  for (const categoryId of MOMENTUM_BUILDER_CATEGORIES.map((c) => c.id)) {
    for (const item of gamesForCategory(categoryId)) {
      byId.set(item.id, item);
    }
  }

  return [...byId.values()];
}

export const MOMENTUM_BUILDER_CATALOG: MomentumBuilderItem[] = buildCatalog();

export function momentumBuilderCategory(
  id: MomentumBuilderCategoryId,
): MomentumBuilderCategory | undefined {
  return MOMENTUM_BUILDER_CATEGORIES.find((c) => c.id === id);
}

export function momentumBuildersForCategory(
  categoryId: MomentumBuilderCategoryId,
): MomentumBuilderItem[] {
  return MOMENTUM_BUILDER_CATALOG.filter((item) => item.categoryId === categoryId);
}

export function momentumBuilderById(id: string): MomentumBuilderItem | undefined {
  return MOMENTUM_BUILDER_CATALOG.find((item) => item.id === id);
}

export function momentumBuilderByGameId(
  gameId: string,
): MomentumBuilderItem | undefined {
  return MOMENTUM_BUILDER_CATALOG.find(
    (item) => item.launch.kind === "game" && item.launch.gameId === gameId,
  );
}

/** All catalog game ids — for surprise picker. */
export function surpriseEligibleGameIds(): string[] {
  return playableMomentumGames()
    .filter((g) => !g.externalTool)
    .map((g) => g.id);
}

export function getMomentumGameDef(gameId: string) {
  return MOMENTUM_GAMES.find((g) => g.id === gameId);
}
