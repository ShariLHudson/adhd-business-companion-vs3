/**
 * Client Avatar visual references — estate-style symbolic archetype emblems.
 *
 * A Client Avatar represents a TYPE of client, not one specific person, so
 * these are archetype/context cues (roles, ways of working, dossier objects) —
 * never portraits, faces, or emoji. They are optional recognition cues and do
 * not need to match a client exactly. Grounded in the platform's own role
 * vocabulary (Coach / Consultant / Author / Speaker / Service Business /
 * Creative / Entrepreneur), expanded slightly.
 *
 * Pure module (ids + labels) so it can be referenced by the store type; the SVG
 * glyphs live in `components/companion/clientAvatarVisualReferences.tsx`.
 */

export const CLIENT_AVATAR_VISUAL_REFERENCE_IDS = [
  "coach",
  "consultant",
  "author",
  "speaker",
  "service",
  "creative",
  "entrepreneur",
  "online",
  "maker",
  "community",
] as const;

export type ClientAvatarVisualReferenceId =
  (typeof CLIENT_AVATAR_VISUAL_REFERENCE_IDS)[number];

/** Neutral role/context labels — never demographic identity. */
export const CLIENT_AVATAR_VISUAL_REFERENCE_LABELS: Record<
  ClientAvatarVisualReferenceId,
  string
> = {
  coach: "Coach or advisor",
  consultant: "Consultant",
  author: "Author",
  speaker: "Speaker",
  service: "Service business owner",
  creative: "Creative founder",
  entrepreneur: "Entrepreneur",
  online: "Online business builder",
  maker: "Hands-on maker",
  community: "Community or nonprofit leader",
};

export function isClientAvatarVisualReferenceId(
  value: unknown,
): value is ClientAvatarVisualReferenceId {
  return (
    typeof value === "string" &&
    (CLIENT_AVATAR_VISUAL_REFERENCE_IDS as readonly string[]).includes(value)
  );
}
