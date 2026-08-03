/**
 * Volume 4 runtime module — core (96) + Iowa Spring seasonal (12).
 *
 * Same runtime-boundary pattern as volume2.ts / volume3.ts: the card DATA is a
 * verbatim copy in the `*.cards.ts` files beside this one (never read from the
 * authoring `Intelligence Library/` folder); here we run them through the
 * approved transform and document provenance in `VOLUME_4_METADATA`.
 */

import { futureSparkCardsToCatalog } from "../futureSparkCard";
import type { SparkNoteCatalogEntry } from "../types";
import { sparkVolume4 } from "./volume4.cards";
import { iowaSpringSparkCards } from "./iowaSpring.cards";

export const VOLUME_4_CORE_ENTRIES: SparkNoteCatalogEntry[] =
  futureSparkCardsToCatalog(sparkVolume4);

export const IOWA_SPRING_ENTRIES: SparkNoteCatalogEntry[] =
  futureSparkCardsToCatalog(iowaSpringSparkCards);

/** Volume 4 package = 96 core + 12 Iowa Spring seasonal. */
export const VOLUME_4_ENTRIES: SparkNoteCatalogEntry[] = [
  ...VOLUME_4_CORE_ENTRIES,
  ...IOWA_SPRING_ENTRIES,
];

/** Provenance + validation metadata for the generated runtime volume. */
export const VOLUME_4_METADATA = {
  version: "1.0.0",
  generationDate: "2026-08-02",
  sourceAuthoringFiles: [
    "Intelligence Library/Spark-card-files/spark-volume-4.ts",
    "Intelligence Library/Spark-card-files/spark-iowa-spring-seasonal.ts",
  ],
  collections: [
    { collection: "core", volume: 4, cardCount: VOLUME_4_CORE_ENTRIES.length },
    {
      collection: "iowa-seasons",
      volume: 4,
      season: "spring",
      region: "US-IA",
      cardCount: IOWA_SPRING_ENTRIES.length,
    },
  ],
  cardCount: VOLUME_4_ENTRIES.length,
  validationStatus: "passed",
} as const;
