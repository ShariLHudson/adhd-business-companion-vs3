/**
 * Integrated runtime volumes — the single aggregate the manifest generator reads.
 *
 * Runtime boundary: everything here is transformed catalog data copied into
 * `lib/sparkNote/volumes/`. Nothing imports from the `Intelligence Library/`
 * authoring folder. Add each new volume's entries here as it is integrated.
 */

import type { SparkNoteCatalogEntry } from "../types";
import { VOLUME_2_ENTRIES } from "./volume2";
import { VOLUME_3_ENTRIES } from "./volume3";

export const INTEGRATED_VOLUME_ENTRIES: readonly SparkNoteCatalogEntry[] = [
  ...VOLUME_2_ENTRIES,
  ...VOLUME_3_ENTRIES,
];

export { VOLUME_2_ENTRIES, VOLUME_2_METADATA } from "./volume2";
export { VOLUME_3_ENTRIES, VOLUME_3_METADATA } from "./volume3";
