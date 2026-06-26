import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import type {
  HomesteadRoomTimeProfile,
  HomesteadTimePeriod,
} from "./types";

function livingRoomProfile(period: HomesteadTimePeriod): HomesteadRoomTimeProfile {
  switch (period) {
    case "dawn":
    case "morning":
      return {
        placeId: "living-room",
        openWindows: true,
        primaryDrink: "coffee",
        lampEmphasis: false,
        candleEmphasis: false,
        fireplaceEmphasis: false,
        aquariumGlow: false,
        movementLevel: "gentle",
        note: "Open windows, fresh breeze, birds, coffee steaming.",
      };
    case "midday":
    case "afternoon":
      return {
        placeId: "living-room",
        openWindows: true,
        primaryDrink: "coffee",
        lampEmphasis: false,
        candleEmphasis: false,
        fireplaceEmphasis: false,
        aquariumGlow: false,
        movementLevel: "active",
        note: "Bright natural work light, strong greens outside.",
      };
    case "golden-hour":
      return {
        placeId: "living-room",
        openWindows: true,
        primaryDrink: "tea",
        lampEmphasis: false,
        candleEmphasis: false,
        fireplaceEmphasis: false,
        aquariumGlow: false,
        movementLevel: "gentle",
        note: "Warm amber sunlight, long shadows, tea may replace coffee.",
      };
    case "evening":
      return {
        placeId: "living-room",
        openWindows: false,
        primaryDrink: "tea",
        lampEmphasis: true,
        candleEmphasis: true,
        fireplaceEmphasis: false,
        aquariumGlow: false,
        movementLevel: "gentle",
        note: "Lamp on, candles, cozy atmosphere.",
      };
    case "night":
      return {
        placeId: "living-room",
        openWindows: false,
        primaryDrink: "tea",
        lampEmphasis: true,
        candleEmphasis: true,
        fireplaceEmphasis: false,
        aquariumGlow: false,
        movementLevel: "minimal",
        note: "Only warm lamps, very quiet, minimal movement.",
      };
  }
}

const ROOM_BUILDERS: Partial<
  Record<CompanionPlaceId, (period: HomesteadTimePeriod) => HomesteadRoomTimeProfile>
> = {
  "living-room": livingRoomProfile,
  "window-seat": (period) => ({
    placeId: "window-seat",
    openWindows: period !== "night" && period !== "evening",
    primaryDrink: period === "night" || period === "evening" ? "tea" : "coffee",
    lampEmphasis: period === "evening" || period === "night",
    candleEmphasis: period === "evening" || period === "night",
    fireplaceEmphasis: period === "evening" || period === "night",
    aquariumGlow: false,
    movementLevel: period === "night" ? "minimal" : "gentle",
    note:
      period === "night"
        ? "The quietest room — almost meditative."
        : period === "evening"
          ? "Fireplace focal point, candles on stone."
          : "Soft daylight entering.",
  }),
  "planning-table": (period) => ({
    placeId: "planning-table",
    openWindows: period === "morning" || period === "midday" || period === "afternoon",
    primaryDrink: period === "evening" || period === "night" ? "tea" : "coffee",
    lampEmphasis: period === "evening" || period === "night",
    candleEmphasis: false,
    fireplaceEmphasis: false,
    aquariumGlow: false,
    movementLevel: period === "midday" ? "active" : "gentle",
    note:
      period === "evening" || period === "night"
        ? "Desk lamp, tea, gentler pace."
        : "Bright workspace, fresh notebook, coffee.",
  }),
  "reading-nook": (period) => ({
    placeId: "reading-nook",
    openWindows: false,
    primaryDrink: period === "evening" || period === "night" ? "tea" : "none",
    lampEmphasis: period === "evening" || period === "night",
    candleEmphasis: false,
    fireplaceEmphasis: false,
    aquariumGlow: true,
    movementLevel: period === "night" ? "minimal" : "gentle",
    note:
      period === "night"
        ? "Soft blue reef light, peaceful."
        : period === "evening"
          ? "Aquarium lighting becomes the primary glow."
          : "Natural daylight through the aquarium.",
  }),
  "creative-studio": (period) => ({
    placeId: "creative-studio",
    openWindows: period !== "night",
    primaryDrink: period === "evening" || period === "night" ? "tea" : "coffee",
    lampEmphasis: period === "evening" || period === "night",
    candleEmphasis: period === "evening",
    fireplaceEmphasis: false,
    aquariumGlow: false,
    movementLevel:
      period === "midday" || period === "morning" ? "active" : "gentle",
    note:
      period === "evening" || period === "night"
        ? "Soft task lighting, projects resting for tomorrow."
        : "Bright creative energy.",
  }),
  "sunroom-over-pond": (period) => ({
    placeId: "sunroom-over-pond",
    openWindows: period !== "night",
    primaryDrink: period === "evening" || period === "night" ? "tea" : "coffee",
    lampEmphasis: period === "evening" || period === "night",
    candleEmphasis: false,
    fireplaceEmphasis: false,
    aquariumGlow: false,
    movementLevel: period === "night" ? "minimal" : "gentle",
    note:
      period === "night"
        ? "Water still flowing softly — pond light, minimal plant motion."
        : period === "evening"
          ? "Warm lamp inside sunroom; water reflections golden."
          : "Filtered sunlight, flowing water, goldfish beneath lilies.",
  }),
};

export function resolveRoomTimeProfile(input: {
  period: HomesteadTimePeriod;
  placeId?: CompanionPlaceId;
}): HomesteadRoomTimeProfile {
  const placeId = input.placeId ?? "living-room";
  const builder = ROOM_BUILDERS[placeId] ?? livingRoomProfile;
  return builder(input.period);
}
