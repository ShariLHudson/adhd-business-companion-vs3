import { getTimeOfDay, type TimeOfDay } from "@/lib/companionBackgrounds";
import {
  homesteadLivingRoomImageUrl,
  resolveHomesteadSceneState,
} from "@/lib/homesteadScene";

export type LivingRoomSeasonAccent =
  | "spring"
  | "summer"
  | "autumn"
  | "winter"
  | "none";
export type LivingRoomChatWeather = "clear" | "rain" | "snow" | "cloudy";

export type LivingRoomChatAtmosphere = {
  imageUrl: string;
  timeOfDay: TimeOfDay;
  season: LivingRoomSeasonAccent;
  weather: LivingRoomChatWeather;
};

function seasonAccent(
  season: ReturnType<typeof resolveHomesteadSceneState>["season"],
): LivingRoomSeasonAccent {
  if (season === "holiday") return "winter";
  return season;
}

/** Soft ambient living-room canvas for everyday chat — fixed homestead photograph. */
export function resolveLivingRoomChatAtmosphere(
  now: Date = new Date(),
): LivingRoomChatAtmosphere {
  const state = resolveHomesteadSceneState({ now, surface: "chat" });
  return {
    imageUrl: homesteadLivingRoomImageUrl(),
    timeOfDay: state.timeOfDay,
    season: seasonAccent(state.season),
    weather: state.weather,
  };
}
