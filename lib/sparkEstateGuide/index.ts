/**
 * Spark Estate Guidebook™ — re-exports from data layer.
 * @see data/estateGuideSpreads.ts
 */

import {
  ESTATE_GUIDE_SPREADS,
  getEstateGuideSpread,
  listEstateGuideSpreadIds,
} from "@/data/estateGuideSpreads";

export type { EstateGuideSpreadData } from "@/data/estateGuideSpreads";

export type {
  EstateGuideEditorialBlock,
  EstateGuideEditorialBlockType,
} from "@/lib/estate/estateGuideEditorial";

export {
  ESTATE_GUIDE_SPREADS,
  getEstateGuideSpread,
  listEstateGuideSpreadIds,
};

export function listEstateGuideRoomOptions() {
  return listEstateGuideSpreadIds().map((id, spreadIndex) => {
    const spread = getEstateGuideSpread(id)!;
    return { id, title: spread.title, spreadIndex };
  });
}

export function resolveEstateGuideSpreadAtIndex(spreadIndex: number) {
  const id = listEstateGuideSpreadIds()[spreadIndex];
  return id ? getEstateGuideSpread(id) : undefined;
}

/** @deprecated Use ESTATE_GUIDE_SPREADS */
export { ESTATE_GUIDE_SPREADS as ESTATE_GUIDE_ROOM_COPY };

/** @deprecated Use getEstateGuideSpread */
export { getEstateGuideSpread as resolveEstateGuideSpread };

/** @deprecated Use listEstateGuideSpreadIds */
export { listEstateGuideSpreadIds as listEstateGuidePlaceIds };

/** @deprecated Use listEstateGuideSpreadIds */
export const listSparkEstateGuidePlaceIds = listEstateGuideSpreadIds;

/** @deprecated */
export const listSparkEstateGuideRoomOptions = listEstateGuideRoomOptions;

/** @deprecated Use getEstateGuideSpread */
export const resolveSparkEstateGuideRoomSpread = getEstateGuideSpread;

/** @deprecated */
export const resolveSparkEstateGuideRoomSpreadAtIndex =
  resolveEstateGuideSpreadAtIndex;

/** @deprecated */
export function validateEstateGuideCopyKeys(): string[] {
  return [];
}

/** @deprecated */
export const validateSparkEstateGuideCopyKeys = validateEstateGuideCopyKeys;
