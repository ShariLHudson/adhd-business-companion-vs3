/**
 * Volume 3 runtime module — core (96) + Iowa Winter seasonal (12).
 *
 * Same runtime-boundary pattern as volume2.ts: the card DATA is a verbatim copy
 * in the `*.cards.ts` files beside this one (never read from the authoring
 * `Intelligence Library/` folder); here we run them through the approved
 * transform and document provenance in `VOLUME_3_METADATA`.
 */

import { futureSparkCardsToCatalog } from "../futureSparkCard";
import type { SparkNoteCatalogEntry } from "../types";
import { sparkVolume3 } from "./volume3.cards";
import { iowaWinterSparkCards } from "./iowaWinter.cards";

export const VOLUME_3_CORE_ENTRIES: SparkNoteCatalogEntry[] =
  futureSparkCardsToCatalog(sparkVolume3);

export const IOWA_WINTER_ENTRIES: SparkNoteCatalogEntry[] =
  futureSparkCardsToCatalog(iowaWinterSparkCards);

/** Volume 3 package = 96 core + 12 Iowa Winter seasonal. */
export const VOLUME_3_ENTRIES: SparkNoteCatalogEntry[] = [
  ...VOLUME_3_CORE_ENTRIES,
  ...IOWA_WINTER_ENTRIES,
];

/** Provenance + validation metadata for the generated runtime volume. */
export const VOLUME_3_METADATA = {
  version: "1.0.0",
  generationDate: "2026-08-02",
  sourceAuthoringFiles: [
    "Intelligence Library/Spark-card-files/spark-volume-3.ts",
    "Intelligence Library/Spark-card-files/spark-iowa-winter-seasonal.ts",
  ],
  collections: [
    { collection: "core", volume: 3, cardCount: VOLUME_3_CORE_ENTRIES.length },
    {
      collection: "iowa-seasons",
      volume: 3,
      season: "winter",
      region: "US-IA",
      cardCount: IOWA_WINTER_ENTRIES.length,
    },
  ],
  cardCount: VOLUME_3_ENTRIES.length,
  validationStatus: "passed",
} as const;
