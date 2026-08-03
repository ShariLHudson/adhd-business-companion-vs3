/**
 * Volume 2 runtime module — core (96) + Iowa Fall seasonal (12).
 *
 * The card DATA is copied verbatim from the authoring repository into the
 * `*.cards.ts` files beside this one (runtime boundary — the runtime never reads
 * the `Intelligence Library/` authoring folder). Here we run those copies
 * through the approved transform (`futureSparkCardsToCatalog`) into runtime
 * `SparkNoteCatalogEntry[]`, and document provenance in `VOLUME_2_METADATA`.
 */

import { futureSparkCardsToCatalog } from "../futureSparkCard";
import type { SparkNoteCatalogEntry } from "../types";
import { sparkVolume2 } from "./volume2.cards";
import { iowaFallSparkCards } from "./iowaFall.cards";

export const VOLUME_2_CORE_ENTRIES: SparkNoteCatalogEntry[] =
  futureSparkCardsToCatalog(sparkVolume2);

export const IOWA_FALL_ENTRIES: SparkNoteCatalogEntry[] =
  futureSparkCardsToCatalog(iowaFallSparkCards);

/** Volume 2 package = 96 core + 12 Iowa Fall seasonal. */
export const VOLUME_2_ENTRIES: SparkNoteCatalogEntry[] = [
  ...VOLUME_2_CORE_ENTRIES,
  ...IOWA_FALL_ENTRIES,
];

/** Provenance + validation metadata for the generated runtime volume. */
export const VOLUME_2_METADATA = {
  version: "1.0.0",
  generationDate: "2026-08-02",
  sourceAuthoringFiles: [
    "Intelligence Library/Spark-card-files/spark-volume-2.ts",
    "Intelligence Library/Spark-card-files/spark-iowa-fall-seasonal.ts",
  ],
  collections: [
    { collection: "core", volume: 2, cardCount: VOLUME_2_CORE_ENTRIES.length },
    {
      collection: "iowa-seasons",
      volume: 2,
      season: "autumn",
      region: "US-IA",
      cardCount: IOWA_FALL_ENTRIES.length,
    },
  ],
  cardCount: VOLUME_2_ENTRIES.length,
  validationStatus: "passed",
} as const;
