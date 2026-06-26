/**
 * Shari's Everyday Life™
 *
 * Environmental storytelling — the home feels lived in, never staged.
 * @see docs/companion-homestead/SHARIS_EVERYDAY_LIFE.md
 */

export type { EverydayLifeZone, EverydayMoment } from "./catalog";

export {
  EVERYDAY_LIFE_CATALOG,
} from "./catalog";

export {
  EVERYDAY_LIFE_NARRATION_BANS,
  EVERYDAY_LIFE_PRINCIPLE,
  violatesEverydayLifeNarration,
} from "./rules";

export {
  filterSilentConversationHints,
  resolveEverydayLifeChanges,
} from "./resolveEverydayLife";
