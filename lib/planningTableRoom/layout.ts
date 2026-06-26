import type { WelcomeSeason, WelcomeTimeOfDay } from "@/lib/welcomeLivingRoom";
import type { WelcomeWeather } from "@/lib/companionEnvironmentIntelligence";
import type { PlanningTableLayoutZone, PlanningTableTimeProfile } from "./types";

export const PLANNING_TABLE_LAYOUT: PlanningTableLayoutZone[] = [
  {
    zone: "left-border",
    elements: [
      "built-in-shelves",
      "planner-collection",
      "leather-notebooks",
      "sticky-note-basket",
      "pen-cup",
      "table-lamp",
      "fresh-flowers",
      "companion-logo",
    ],
  },
  {
    zone: "center",
    elements: [
      "protected-workspace",
      "todays-plan",
      "tasks",
      "calendar",
      "conversation",
    ],
  },
  {
    zone: "right-border",
    elements: [
      "open-window",
      "linen-curtains",
      "summer-trees",
      "bird-feeder",
      "garden-flowers",
      "hummingbird",
      "morning-breeze",
      "moving-leaves",
      "changing-sunlight",
    ],
  },
  {
    zone: "lower-right",
    elements: [
      "fresh-coffee",
      "open-planner",
      "reading-glasses",
      "woven-basket",
      "comfortable-chair",
    ],
  },
];

export const PLANNING_TABLE_BORDER_MOTION = [
  "curtain-sway",
  "leaves-rustle",
  "branch-sway",
  "birds-at-feeder",
  "coffee-steam",
  "sunlight-shift",
  "cloud-shadow",
] as const;

export const PLANNING_TABLE_MEMORY_TRIGGERS = [
  "fresh-coffee",
  "open-windows",
  "cool-morning-breeze",
  "garden-flowers",
  "basil-from-herbs",
  "saturday-cinnamon-roll",
] as const;

export function resolvePlanningTimeProfile(input: {
  timeOfDay?: WelcomeTimeOfDay;
  season?: WelcomeSeason;
  weather?: WelcomeWeather;
}): PlanningTableTimeProfile {
  if (input.weather === "rain") return "rain";
  if (input.season === "winter" || input.season === "holiday") return "winter";
  return input.timeOfDay ?? "morning";
}

export function borderMotionForTimeProfile(
  profile: PlanningTableTimeProfile,
): readonly string[] {
  switch (profile) {
    case "morning":
      return [
        "curtain-sway",
        "leaves-rustle",
        "birds-at-feeder",
        "coffee-steam",
        "sunlight-shift",
      ];
    case "afternoon":
      return ["curtain-sway", "leaves-rustle", "branch-sway", "cloud-shadow"];
    case "evening":
      return ["lamp-warmth", "curtain-still", "soft-shadow"];
    case "rain":
      return ["rain-on-glass", "curtain-barely-moving", "lamp-warmth"];
    case "winter":
      return ["snow-outside", "steam-from-mug", "lamp-warmth"];
    default:
      return PLANNING_TABLE_BORDER_MOTION;
  }
}

export function cssVarsForTimeProfile(
  profile: PlanningTableTimeProfile,
): Record<string, string> {
  const base = {
    "--scene-image-position": "62% 44%",
    "--scene-panel-frosted-opacity": "0.54",
    "--planning-table-wash": "rgba(252, 246, 236, 0.22)",
  };
  switch (profile) {
    case "morning":
      return {
        ...base,
        "--planning-table-light": "golden-morning",
        "--scene-image-dominance": "0.52",
      };
    case "afternoon":
      return {
        ...base,
        "--planning-table-light": "bright-afternoon",
        "--scene-image-dominance": "0.5",
      };
    case "evening":
      return {
        ...base,
        "--planning-table-light": "warm-lamp",
        "--scene-image-dominance": "0.48",
      };
    case "rain":
      return {
        ...base,
        "--planning-table-light": "cozy-rain",
        "--scene-image-dominance": "0.46",
      };
    case "winter":
      return {
        ...base,
        "--planning-table-light": "winter-warm",
        "--scene-image-dominance": "0.47",
      };
    default:
      return base;
  }
}
