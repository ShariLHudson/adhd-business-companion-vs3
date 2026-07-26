/**
 * Canonical full-bleed estate backgrounds for Create, Projects, and Profile.
 * All shells and registries for these destinations should read from here
 * so surfaces stay visually consistent.
 */

/** Create — art studio; warm creative atmosphere (“ideas are born”). */
export const CREATE_BACKGROUND_SRC =
  "/backgrounds/art-studio-background.png" as const;

/** Projects — inspiring vision room; brighter momentum (“ideas become reality”). */
export const PROJECTS_BACKGROUND_SRC =
  "/backgrounds/inspiring-vision-room-background.png" as const;

/** My Profile — sunlit writing room; calm, personal, reflective. */
export const PROFILE_BACKGROUND_SRC =
  "/backgrounds/writing-room-background.png" as const;

/**
 * Client Avatar / People I Help builder — the ideal-client room. One canonical
 * source so every entry path (direct `client-avatars` section and the
 * People I Help panel) paints the same room instead of the estate exterior.
 */
export const CLIENT_AVATAR_BACKGROUND_SRC =
  "/backgrounds/client-avatar-building-background.png" as const;
