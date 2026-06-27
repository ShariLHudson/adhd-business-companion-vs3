import { objectsFromSeeds } from "./builder";
import { BUSINESS_OBJECT_SEEDS } from "./business";
import { COFFEE_COMFORT_OBJECT_SEEDS } from "./coffeeComfort";
import { CREATIVE_OBJECT_SEEDS } from "./creative";
import { HOME_OBJECT_SEEDS } from "./home";
import { HOSPITALITY_OBJECT_SEEDS } from "./hospitality";
import { KINSEY_OBJECT_SEEDS } from "./kinsey";
import { NATURE_OBJECT_SEEDS } from "./nature";
import { READING_OBJECT_SEEDS } from "./reading";
import { SEASONAL_OBJECT_SEEDS } from "./seasonal";
import { WRITING_OBJECT_SEEDS } from "./writing";

/** Companion Objects Master Catalog — permanent visual language registry. */
export const COMPANION_OBJECTS_MASTER_CATALOG = objectsFromSeeds([
  ...WRITING_OBJECT_SEEDS,
  ...COFFEE_COMFORT_OBJECT_SEEDS,
  ...NATURE_OBJECT_SEEDS,
  ...CREATIVE_OBJECT_SEEDS,
  ...BUSINESS_OBJECT_SEEDS,
  ...READING_OBJECT_SEEDS,
  ...HOME_OBJECT_SEEDS,
  ...KINSEY_OBJECT_SEEDS,
  ...HOSPITALITY_OBJECT_SEEDS,
  ...SEASONAL_OBJECT_SEEDS,
]);

export {
  WRITING_OBJECT_SEEDS,
  COFFEE_COMFORT_OBJECT_SEEDS,
  NATURE_OBJECT_SEEDS,
  CREATIVE_OBJECT_SEEDS,
  BUSINESS_OBJECT_SEEDS,
  READING_OBJECT_SEEDS,
  HOME_OBJECT_SEEDS,
  KINSEY_OBJECT_SEEDS,
  HOSPITALITY_OBJECT_SEEDS,
  SEASONAL_OBJECT_SEEDS,
};
