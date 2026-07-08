import type { SparkNoteCatalogEntry } from "./types";
import { loadSparkLibrary } from "./contentDatabase/loadSparkLibrary";

export const DEFAULT_SPARK_NOTE_COOLDOWN_DAYS = 45;

/**
 * Curated Spark Note library — loaded from `spark-library/manifest.json`.
 * Add Sparks as JSON under `spark-library/` and run `npm run spark-library:export`.
 */
export const SPARK_NOTE_CATALOG: readonly SparkNoteCatalogEntry[] =
  loadSparkLibrary();
