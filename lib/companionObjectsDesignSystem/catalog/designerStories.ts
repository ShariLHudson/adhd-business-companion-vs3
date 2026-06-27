import type { ObjectSeed } from "./builder";
import { BUSINESS_DESIGNER_STORIES } from "./designerStories/business";
import { COFFEE_DESIGNER_STORIES } from "./designerStories/coffeeComfort";
import { CREATIVE_DESIGNER_STORIES } from "./designerStories/creative";
import { HOME_DESIGNER_STORIES } from "./designerStories/home";
import { HOSPITALITY_DESIGNER_STORIES } from "./designerStories/hospitality";
import { KINSEY_DESIGNER_STORIES } from "./designerStories/kinsey";
import { NATURE_DESIGNER_STORIES } from "./designerStories/nature";
import { READING_DESIGNER_STORIES } from "./designerStories/reading";
import { SEASONAL_DESIGNER_STORIES } from "./designerStories/seasonal";
import { WRITING_DESIGNER_STORIES } from "./designerStories/writing";

/**
 * Designer Stories — merged lookup. Never surfaced to guests.
 * @see docs/companion-homestead/COMPANION_OBJECTS_DESIGN_SYSTEM.md#designer-stories
 */
export const DESIGNER_STORIES: Readonly<Record<string, string>> = {
  ...WRITING_DESIGNER_STORIES,
  ...COFFEE_DESIGNER_STORIES,
  ...NATURE_DESIGNER_STORIES,
  ...CREATIVE_DESIGNER_STORIES,
  ...BUSINESS_DESIGNER_STORIES,
  ...READING_DESIGNER_STORIES,
  ...HOME_DESIGNER_STORIES,
  ...KINSEY_DESIGNER_STORIES,
  ...HOSPITALITY_DESIGNER_STORIES,
  ...SEASONAL_DESIGNER_STORIES,
};

export function resolveDesignerStory(seed: ObjectSeed): string {
  const story = DESIGNER_STORIES[seed.id];
  if (story) return story;
  return `Shari's ${seed.name.toLowerCase()} belongs in this home because it is part of how she actually lives — not chosen to decorate a screen.`;
}

export function designerStoryForObjectId(id: string): string | undefined {
  return DESIGNER_STORIES[id];
}
