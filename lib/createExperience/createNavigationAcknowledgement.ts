/**
 * Canonical Create-navigation acknowledgement policy.
 *
 * For a Create navigation the prepared-state placeholder is the SINGLE
 * user-visible arrival response. No separate transition line ("Let's go to the
 * Creative Studio") and no "I can help you build that in Create" acknowledgement
 * may render for the same navigation event.
 *
 * The workspace is internally routed as `creative-studio` / the create sections,
 * but the approved user-visible destination name is "Create". "Creative Studio"
 * must not appear in the user-facing Create flow (it remains only as an internal
 * route identifier / Chamber member, which this module does not touch).
 *
 * Destination-ownership based — keyed on the create sections, never on matching
 * user-visible strings.
 */

import {
  CREATE_ROOM_PREPARED_STATE_MESSAGE,
  isUnreadyCreateRoomRoutingIntent,
  resolveLegacyCreateWorkspaceGuard,
} from "./blockLegacyCreateWorkspaceRouting";

/** Approved user-visible name for the Create destination. */
export const CREATE_CANONICAL_DESTINATION_NAME = "Create";

/** Internal section ids that resolve to the Create workspace. */
export const CREATE_DESTINATION_SECTIONS = ["create", "content-generator"] as const;

/** True when a navigation command targets the Create workspace. */
export function isCreateDestinationSection(
  section?: string | null,
): boolean {
  return Boolean(
    section &&
      (CREATE_DESTINATION_SECTIONS as readonly string[]).includes(section),
  );
}

/**
 * The single arrival message for a Create navigation. Callers render only this
 * and suppress every other acknowledgement for the same event.
 */
export function createNavigationArrivalMessage(): string {
  return CREATE_ROOM_PREPARED_STATE_MESSAGE;
}

/**
 * True when a frictionless `immediateCreateOpen` will land on the unfinished
 * Create dead-end and render the prepared-state placeholder — mirrors
 * `completeImmediateCreateOpen`. When true the placeholder OWNS the arrival, so
 * the general voiced reply ("I can help you build that in Create.") must not be
 * appended for the same event. Document-guided creates (which open the guided
 * flow, not the placeholder) return false so their voiced reply is preserved.
 */
export function immediateCreateOpenRendersPlaceholder(input: {
  userText: string;
  itemType?: string | null;
  alreadyOpen?: boolean;
}): boolean {
  if (isUnreadyCreateRoomRoutingIntent(input.userText, input.itemType ?? null)) {
    return false;
  }
  const guard = resolveLegacyCreateWorkspaceGuard({
    section: "content-generator",
    userText: input.userText,
    itemType: input.itemType ?? null,
    alreadyOpen: input.alreadyOpen,
  });
  return guard.kind === "prepared_state";
}
