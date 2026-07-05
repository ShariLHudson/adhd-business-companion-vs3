import { getCanonicalEstatePlaceById } from "./canonicalEstateRegistry";

/** Places members can actually walk into today — not planned/future canon only. */
export function isLiveEstatePlace(placeId: string): boolean {
  const place = getCanonicalEstatePlaceById(placeId);
  if (!place) return false;
  return place.status !== "planned" && place.status !== "future";
}
