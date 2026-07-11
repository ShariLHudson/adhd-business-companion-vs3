/**
 * Estate Object Intelligence — object registry loader.
 */

import estateObjectsJson from "@/docs/estate-knowledge-base/estate-objects.json";
import type { EstateObjectRecord } from "./types";

type EstateObjectsFile = {
  objects: EstateObjectRecord[];
};

const FILE = estateObjectsJson as EstateObjectsFile;

export function getEstateObjects(): EstateObjectRecord[] {
  return FILE.objects;
}

export function getEstateObjectById(
  objectId: string,
): EstateObjectRecord | null {
  return FILE.objects.find((object) => object.objectId === objectId) ?? null;
}

export function getLiveEstateObjects(): EstateObjectRecord[] {
  return FILE.objects.filter((object) => object.status === "Live");
}

export function isMemberVisibleObject(
  object: EstateObjectRecord | null,
): boolean {
  if (!object) return false;
  return object.status === "Live";
}

export function isInteractiveObjectAvailable(
  object: EstateObjectRecord | null,
): boolean {
  if (!object?.interactive) return false;
  return object.status === "Live";
}

export function objectsForLocation(locationId: string): EstateObjectRecord[] {
  return FILE.objects.filter((object) =>
    object.appearsInLocations.includes(locationId),
  );
}
