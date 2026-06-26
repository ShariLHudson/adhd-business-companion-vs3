import { voiceLines } from "../entryBuilder";
import type { ShariVoiceLine } from "../types";

export const SEASONAL_GREETINGS: ShariVoiceLine[] = [
  ...voiceLines("rainy_day", "greeting", [
    "Rainy one out there.",
    "Hi. Cozy day for it.",
    "Wet outside — come in.",
    "Rain on the roof. Hi.",
  ], { seasons: ["spring", "autumn"], tags: ["rain"] }),
  ...voiceLines("snowy_iowa_day", "greeting", [
    "Snow's coming down.",
    "Cold one. Come in.",
    "Hi. Warm in here.",
    "Iowa snow. Hi.",
  ], { seasons: ["winter"], tags: ["snow"] }),
  ...voiceLines("sunny_summer_day", "greeting", [
    "Beautiful day out.",
    "Sun's out. Hi.",
    "Warm one. Come in.",
    "Hi. Iowa summer.",
  ], { seasons: ["summer"], tags: ["sun"] }),
  ...voiceLines("holiday_season", "greeting", [
    "Hi.",
    "Holiday season.",
    "Cozy time of year. Hi.",
    "Hi — lights are on.",
  ], { seasons: ["holiday", "winter"] }),
];

export const CALENDAR_GREETINGS: ShariVoiceLine[] = [
  ...voiceLines("monday_morning", "greeting", [
    "Monday.",
    "Morning. New week.",
    "Hi. Monday again.",
  ], { timeOfDay: ["morning"], tags: ["monday"] }),
  ...voiceLines("friday_evening", "greeting", [
    "Friday.",
    "End of the week.",
    "Hi. Friday night.",
  ], { timeOfDay: ["evening"], tags: ["friday"] }),
  ...voiceLines("weekend", "greeting", [
    "Weekend.",
    "Hi. Slow morning?",
    "Saturday. Hi.",
    "Sunday. Hi.",
  ], { tags: ["weekend"] }),
  ...voiceLines("birthday", "greeting", [
    "Happy birthday.",
    "Today's your day.",
    "Happy birthday — glad you're here.",
  ], { tags: ["birthday"] }),
];
