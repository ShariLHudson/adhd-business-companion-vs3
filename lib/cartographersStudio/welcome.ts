/**
 * Cartographer's Studio welcome / orientation (first visit + Help).
 * Not Welcome Home navigation — no Chat / Visit Another Room / Enjoy the Estate.
 */

import { CARTOGRAPHERS_FRAMED_MAPS } from "./framedMaps";

export const CARTOGRAPHERS_WELCOME_TITLE = "Cartographer's Studio" as const;

export const CARTOGRAPHERS_WELCOME_SUBTITLE =
  "Every map tells a story. Every story reveals a path." as const;

export const CARTOGRAPHERS_WELCOME_BODY = [
  "The Cartographer's Studio helps you think visually.",
  "Whether you're brainstorming, planning, solving problems, organizing information, or making decisions, Spark can help you build the right visual.",
] as const;

export const CARTOGRAPHERS_WELCOME_BEGIN_HEADING =
  "How would you like to begin?" as const;

export const CARTOGRAPHERS_WELCOME_TELL_SPARK = {
  heading: "Tell Spark what you want",
  examples: [
    "Create a Mind Map",
    "Build a Decision Map",
    "Make a Timeline",
    "Show me the best visual",
    "Organize these ideas",
  ],
} as const;

export const CARTOGRAPHERS_WELCOME_CLICK_FRAME = {
  heading: "Click any map",
  body: "Each map shows its name in the center — click it to open that map and start working.",
} as const;

export const CARTOGRAPHERS_WELCOME_ABOUT_HEADING = "About Visual Maps" as const;

/** One beginner-friendly sentence per framed method. */
export const CARTOGRAPHERS_WELCOME_MAP_BLURBS = CARTOGRAPHERS_FRAMED_MAPS.map(
  (map) => ({
    id: map.id,
    name: map.nameplate,
    sentence: map.hoverBlurb,
  }),
);

export const CARTOGRAPHERS_WELCOME_FOOTER =
  "Start typing, speaking, or click a map to begin." as const;

const DISMISS_KEY = "cartographers-studio-welcome-dismissed-v1";

export function hasDismissedCartographersWelcome(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissCartographersWelcome(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    /* noop */
  }
}

export function requestCartographersWelcome(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DISMISS_KEY);
    window.dispatchEvent(new Event("cartographers-studio-welcome-request"));
  } catch {
    /* noop */
  }
}

export const CARTOGRAPHERS_WELCOME_REQUEST_EVENT =
  "cartographers-studio-welcome-request" as const;
