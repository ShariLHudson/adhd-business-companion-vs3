/**
 * Estate Knowledge Base™ — visual asset directory loader.
 */

import estateAssetsJson from "@/docs/estate-knowledge-base/estate-assets.json";
import type { EstateAsset } from "./types";

type EstateAssetsFile = {
  assets: EstateAsset[];
};

const FILE = estateAssetsJson as EstateAssetsFile;

export function getEstateAssets(): EstateAsset[] {
  return FILE.assets;
}

export function getEstateAssetByFileName(
  assetFileName: string,
): EstateAsset | null {
  return FILE.assets.find((asset) => asset.assetFileName === assetFileName) ?? null;
}

export function getEstateAssetsForPlaceId(placeId: string): EstateAsset[] {
  return FILE.assets.filter(
    (asset) =>
      asset.primaryPlaceId === placeId ||
      asset.sharedByPlaceIds.includes(placeId),
  );
}
