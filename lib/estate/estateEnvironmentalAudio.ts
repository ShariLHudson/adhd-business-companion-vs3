import { stopEstateRoomAmbience } from "@/lib/estate/estateRoomAmbience";
import { stopEstateSoundscapeOverlay } from "@/lib/estate/estateSoundscapeOverlay";
import { stopGardenCardAmbience } from "@/lib/peacefulPlaces/gardenCardAmbience";
import { stopGardenFlagAmbience } from "@/lib/peacefulPlaces/gardenFlagAmbience";

/** Stop Layer 1 place ambience and Layer 2 soundscape overlay immediately. */
export async function stopAllEstateEnvironmentalAudio(): Promise<void> {
  if (typeof window === "undefined") return;
  await Promise.all([
    stopEstateRoomAmbience(),
    stopEstateSoundscapeOverlay(),
    stopGardenCardAmbience(),
    stopGardenFlagAmbience(),
  ]);
}

const STOP_ESTATE_AMBIENCE_RE =
  /\b(?:stop|turn\s+off|silence|quiet|enough|no\s+more|end)\b.{0,40}\b(?:coffee(?:\s+house)?|chatter|ambience|room\s+sound|background\s+(?:noise|sound)|that\s+sound|the\s+music|serenade)\b/i;

const STOP_WITH_ROOM_SOUND_RE =
  /\bstop\s+with\s+the\s+(?:coffee(?:\s+house)?|room|chatter)\b/i;

/** Member asked to silence environmental audio (e.g. coffee house serenade). */
export function isStopEstateAmbienceRequest(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return (
    STOP_ESTATE_AMBIENCE_RE.test(trimmed) ||
    STOP_WITH_ROOM_SOUND_RE.test(trimmed) ||
    /\b(?:coffee(?:\s+house)?)\s+chatter\b/i.test(trimmed)
  );
}

export function stopEstateAmbienceReply(): string {
  return "Got it — the room is quiet now.";
}
