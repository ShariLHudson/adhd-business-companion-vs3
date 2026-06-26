import type { WelcomeSeason, WelcomeTimeOfDay } from "@/lib/welcomeLivingRoom";
import type { WelcomeWeather } from "@/lib/companionEnvironmentIntelligence";
import type { SunroomLayoutZone, SunroomTimeProfile } from "./types";

export const SUNROOM_LAYOUT: SunroomLayoutZone[] = [
  {
    zone: "sunroom-frame",
    elements: [
      "glass-enclosure",
      "wood-framing",
      "comfortable-seating",
      "simple-workspace-surface",
    ],
  },
  {
    zone: "left-border",
    elements: [
      "layered-plants",
      "vines-foliage",
      "garden-depth",
      "natural-asymmetry",
    ],
  },
  {
    zone: "center",
    elements: [
      "protected-workspace",
      "embedded-not-overlay",
      "conversation",
      "thinking",
    ],
  },
  {
    zone: "right-border",
    elements: [
      "dense-greenery",
      "seasonal-growth",
      "peripheral-birds",
      "butterflies",
    ],
  },
  {
    zone: "pergola-arc",
    elements: [
      "pergola-half-circle",
      "hanging-vines",
      "filtered-sunlight",
      "shifting-shadows",
    ],
  },
  {
    zone: "pond-anchor",
    elements: [
      "flowing-water-feature",
      "goldfish",
      "water-lilies",
      "sky-reflections",
      "subtle-ripples",
    ],
  },
];

export const SUNROOM_BORDER_MOTION = [
  "water-flow",
  "goldfish-glide",
  "lily-shift",
  "leaf-sway",
  "plant-sway",
  "light-on-water",
  "pergola-shadow",
  "bird-crossing",
] as const;

export const SUNROOM_SENSORY_MEMORY = [
  "flowing-water-sound",
  "warm-humidity-near-plants",
  "soft-outdoor-air",
  "early-morning-stillness",
  "garden-freshness-after-rain",
  "quiet-pond-life",
] as const;

export function resolveSunroomTimeProfile(input: {
  timeOfDay?: WelcomeTimeOfDay;
  season?: WelcomeSeason;
  weather?: WelcomeWeather;
}): SunroomTimeProfile {
  if (input.weather === "rain") return "after-rain";
  return input.timeOfDay ?? "morning";
}

export function borderMotionForSunroomProfile(
  profile: SunroomTimeProfile,
): readonly string[] {
  switch (profile) {
    case "morning":
      return [
        "water-flow",
        "goldfish-glide",
        "lily-shift",
        "light-on-water",
        "bird-crossing",
      ];
    case "afternoon":
      return [
        "water-flow",
        "goldfish-glide",
        "plant-sway",
        "light-on-water",
        "pergola-shadow",
      ];
    case "evening":
      return ["water-flow", "lily-shift", "pergola-shadow", "leaf-sway"];
    case "after-rain":
      return [
        "water-flow",
        "goldfish-glide",
        "lily-shift",
        "garden-freshness",
        "leaf-sway",
      ];
    default:
      return SUNROOM_BORDER_MOTION;
  }
}

export function cssVarsForSunroomProfile(
  profile: SunroomTimeProfile,
): Record<string, string> {
  const base = {
    "--scene-image-position": "50% 68%",
    "--scene-panel-frosted-opacity": "0.42",
    "--room-protected-zone-expand": "0.48",
    "--sunroom-wash": "rgba(248, 252, 246, 0.18)",
  };
  switch (profile) {
    case "morning":
      return {
        ...base,
        "--sunroom-light": "golden-morning-stillness",
        "--scene-image-dominance": "0.58",
      };
    case "afternoon":
      return {
        ...base,
        "--sunroom-light": "bright-garden",
        "--scene-image-dominance": "0.56",
      };
    case "evening":
      return {
        ...base,
        "--sunroom-light": "warm-lamp-calm",
        "--scene-image-dominance": "0.52",
      };
    case "after-rain":
      return {
        ...base,
        "--sunroom-light": "fresh-after-rain",
        "--scene-image-dominance": "0.54",
      };
    default:
      return base;
  }
}
