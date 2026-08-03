/**
 * Integrated runtime volumes — the single aggregate the manifest generator reads.
 *
 * Runtime boundary: everything here is transformed catalog data copied into
 * `lib/sparkNote/volumes/`. Nothing imports from the `Intelligence Library/`
 * authoring folder. Add each new volume's entries here as it is integrated.
 */

import type { SparkNoteCatalogEntry } from "../types";
import { VOLUME_2_ENTRIES } from "./volume2";

export const INTEGRATED_VOLUME_ENTRIES: readonly SparkNoteCatalogEntry[] = [
  ...VOLUME_2_ENTRIES,
];

export { VOLUME_2_ENTRIES, VOLUME_2_METADATA } from "./volume2";
