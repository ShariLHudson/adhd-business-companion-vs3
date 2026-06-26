/**
 * Shari's Life Moments™
 *
 * First-person invitations into Shari's life — never advice.
 * @see docs/companion-homestead/SHARIS_LIFE_MOMENTS.md
 */

export type { LifeMomentCategory, LifeMomentEntry } from "./catalog";

export {
  LIFE_MOMENT_CATALOG,
  LIFE_MOMENT_CATEGORIES,
  lifeMomentTag,
} from "./catalog";

export {
  LIFE_MOMENT_ADVICE_PATTERNS,
  assertLifeMomentVoice,
  violatesLifeMomentVoice,
} from "./rules";

export {
  resolveLifeMomentCategory,
  shouldOfferLifeMoment,
} from "./resolveCategory";

export { composeLifeMoment } from "./composeLifeMoment";
