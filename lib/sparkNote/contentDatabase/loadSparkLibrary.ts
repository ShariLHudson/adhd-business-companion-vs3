import manifest from "@/spark-library/manifest.json";

import { SEED_SPARK_NOTE_CATALOG } from "../catalogSeed";
import { recordsToCatalog } from "./mapRecord";
import type { SparkContentRecord } from "./types";
import type { SparkNoteCatalogEntry } from "../types";

const manifestRecords = manifest as SparkContentRecord[];

/**
 * Load active Sparks from `spark-library/manifest.json`.
 * Falls back to seed catalog if manifest is empty (tests / bootstrap).
 */
export function loadSparkLibrary(): SparkNoteCatalogEntry[] {
  const fromManifest = recordsToCatalog(manifestRecords);
  if (fromManifest.length > 0) return fromManifest;
  return [...SEED_SPARK_NOTE_CATALOG];
}
