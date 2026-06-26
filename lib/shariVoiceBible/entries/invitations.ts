import { voiceLines } from "../entryBuilder";
import type { ShariVoiceLine } from "../types";

/** Gentle room invitations — relationship before guidance. No "Let's…" */
export const ROOM_INVITATIONS: ShariVoiceLine[] = [
  ...voiceLines(
    "from_clear_my_mind",
    "invitation",
    [
      "The window seat might help — a little quieter.",
      "Window seat's open if you want quieter.",
      "Could sit by the window — softer light.",
    ],
    { rooms: ["window-seat"], emotionalTags: ["overwhelmed", "grief", "discouraged"] },
  ),
  ...voiceLines(
    "from_creative_studio",
    "invitation",
    [
      "Studio's open if you want to spread that out.",
      "Creative studio — good energy in there today.",
      "Could work that out in the studio.",
    ],
    { rooms: ["creative-studio"], emotionalTags: ["excited", "creative", "celebrating"] },
  ),
  ...voiceLines(
    "from_planning_table",
    "invitation",
    [
      "If sorting the day would help, the planning table is open.",
      "Planning table's there if the day needs sorting.",
      "Table's open — only if that sounds right.",
    ],
    { rooms: ["planning-table"] },
  ),
  ...voiceLines(
    "from_reading_nook",
    "invitation",
    [
      "Reading nook's quiet today.",
      "Nook might be a good spot for this.",
    ],
    { rooms: ["reading-nook"] },
  ),
  ...voiceLines(
    "quiet",
    "invitation",
    [
      "We can stay right here and talk.",
      "No need to go anywhere.",
      "Here is fine.",
    ],
    { rooms: ["living-room"] },
  ),
  ...voiceLines(
    "variable_question",
    "invitation",
    [
      "We could keep going on that — only if it still feels right.",
      "Want to pick that back up?",
      "Still feel like continuing?",
    ],
    { tags: ["continue_thread"] },
  ),
  ...voiceLines(
    "walking",
    "invitation",
    [
      "We could sit at the {place} — gently, if that sounds right.",
      "{place} might fit — quietly.",
    ],
    { tags: ["gentle_place"], emotionalTags: ["exhausted", "discouraged"] },
  ),
  ...voiceLines(
    "walking",
    "invitation",
    [
      "There's a spot in the house that might fit — the {place}.",
      "{place} — want to see?",
    ],
    { tags: ["generic_place"] },
  ),
];

export const INVITATION_BUTTON_LABELS: ShariVoiceLine[] = [
  ...voiceLines("placeholder", "invitation", ["Show me", "Sure", "Yes, gently", "Stay here"], {
    tags: ["button"],
  }),
];
