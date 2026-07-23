/**
 * Master visibility rule — do not loosen.
 *
 * isUserVisible =
 *   lifecycleStatus === "ready" &&
 *   routeVerified && saveVerified && reopenVerified && requiredActionsVerified
 */

import type { CreationRegistryItem } from "./types";

/** Required verification flags for member-facing visibility. */
export function hasRequiredVerificationFlags(
  item: Pick<
    CreationRegistryItem,
    | "routeVerified"
    | "saveVerified"
    | "reopenVerified"
    | "requiredActionsVerified"
  >,
): boolean {
  return (
    item.routeVerified === true &&
    item.saveVerified === true &&
    item.reopenVerified === true &&
    item.requiredActionsVerified === true
  );
}

/**
 * Computed visibility gate. Prefer this over any stored boolean.
 * Print / export / project handoff are not required for every type.
 */
export function computeIsUserVisible(
  item: Pick<
    CreationRegistryItem,
    | "lifecycleStatus"
    | "routeVerified"
    | "saveVerified"
    | "reopenVerified"
    | "requiredActionsVerified"
  >,
): boolean {
  return item.lifecycleStatus === "ready" && hasRequiredVerificationFlags(item);
}
