import { voiceLines } from "../entryBuilder";
import type { ShariVoiceLine } from "../types";

export const ROOM_RETURN_GREETINGS: ShariVoiceLine[] = [
  ...voiceLines("from_planning_table", "greeting", [
    "Back from the table.",
    "Hi.",
    "Planner closed?",
  ], { rooms: ["planning-table"] }),
  ...voiceLines("from_clear_my_mind", "greeting", [
    "Hi.",
    "Lighter?",
    "Come sit.",
  ], { rooms: ["window-seat"] }),
  ...voiceLines("from_reading_nook", "greeting", [
    "Hi.",
    "Good read?",
    "Back from the nook.",
  ], { rooms: ["reading-nook"] }),
  ...voiceLines("from_creative_studio", "greeting", [
    "Hi.",
    "Studio time?",
    "Back from the studio.",
  ], { rooms: ["creative-studio"] }),
];

export const WALKING_LINES: ShariVoiceLine[] = [
  ...voiceLines("walking", "walking", [
    "This way.",
    "Come on.",
    "Right through here.",
    "Follow me.",
  ]),
  ...voiceLines("from_planning_table", "walking", [
    "Table's this way.",
    "Planning table.",
  ], { rooms: ["planning-table"] }),
  ...voiceLines("from_clear_my_mind", "walking", [
    "Window seat.",
    "This way — by the window.",
  ], { rooms: ["window-seat"] }),
  ...voiceLines("from_creative_studio", "walking", [
    "Studio's open.",
    "This way to the studio.",
  ], { rooms: ["creative-studio"] }),
];
