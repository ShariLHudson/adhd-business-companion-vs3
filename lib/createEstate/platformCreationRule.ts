/**
 * 056 — Global platform rule (binding).
 *
 * Every Chamber member, Board member, Create, Projects, Visual Thinking, Shari,
 * Search, Dashboard, and Cartography must use the same Universal Creation Engine
 * and the same Creation Context. There is never separate logic for Create versus
 * Events versus Marketing — only different front doors to one creation process.
 */

export const PLATFORM_UNIVERSAL_CREATION_SURFACES = [
  "chamber",
  "board",
  "create",
  "projects",
  "visual_thinking",
  "shari",
  "search",
  "dashboard",
  "cartography",
] as const;

export type PlatformUniversalCreationSurface =
  (typeof PLATFORM_UNIVERSAL_CREATION_SURFACES)[number];

export const PLATFORM_UNIVERSAL_CREATION_RULE =
  "One Universal Creation Engine and one Creation Context for every front door. Never fork Create vs Events vs Marketing into separate creation logic.";

/** Sprint 2 — permanent. Re-export from universalCreationPlatform. */
export { ONE_CREATION_PLATFORM_RULE } from "@/lib/universalCreationPlatform";

/**
 * Global Create scroll / reachability rule (binding — entrance + Workspace + every Create surface).
 * Not Event-specific.
 */
export const CREATE_SCROLL_AND_REACHABILITY_RULE = [
  "The Create experience must never clip content.",
  "The page must vertically scroll if content exceeds the viewport.",
  "No button, recommendation, or section may become unreachable.",
  "Keyboard navigation must work throughout the scrollable area.",
  "The primary “I want to create…” input must remain immediately visible on initial load.",
  "On smaller screens and increased browser zoom, all controls must remain accessible without layout breakage.",
].join(" ");

/** One scrollport owner for Create estate rooms. */
export const CREATE_SCROLLPORT_TESTID = "create-estate-shared-scroll" as const;
