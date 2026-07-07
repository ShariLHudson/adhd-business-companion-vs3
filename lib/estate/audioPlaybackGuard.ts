/**
 * Audio Playback Guard™ — one intentional environmental track at a time.
 *
 * Rollback: NEXT_PUBLIC_AUDIO_PLAYBACK_GUARD=0
 */

import { stopEstateRoomAmbience } from "@/lib/estate/estateRoomAmbience";
import { stopEstateSoundscapeOverlay } from "@/lib/estate/estateSoundscapeOverlay";
import { stopGardenCardAmbience } from "@/lib/peacefulPlaces/gardenCardAmbience";
import { stopGardenFlagAmbience } from "@/lib/peacefulPlaces/gardenFlagAmbience";
import {
  kickstartEstateRoomAmbience,
  startEstateRoomAmbience,
} from "@/lib/estate/estateRoomAmbience";
import { startEstateSoundscapeOverlay } from "@/lib/estate/estateSoundscapeOverlay";
import { resolveEstatePlaceAmbientProfile } from "@/lib/estate/estatePlaceAmbientSound";
import type { EstateArrivalAmbienceProfile } from "@/lib/estate/estateArrivalExperienceTypes";

export type AudioPlaybackIntent =
  | "browse"
  | "recommend"
  | "play"
  | "stop"
  | "unknown";

export type AudioPlaybackTrace = {
  audioIntent: AudioPlaybackIntent;
  requestedAudio: string | null;
  currentActiveAudio: string | null;
  actionTaken: string;
  blockedAudio: string | null;
  reason: string;
};

export type GuardedEnvironmentalAudioRequest = {
  trackId: string;
  layer: "room" | "overlay";
  placeId?: string;
  profile?: EstateArrivalAmbienceProfile;
  soundscapeId?: string;
};

const BROWSE_AUDIO_RE =
  /\b(?:what(?:'s| is| are)?\s+(?:the\s+)?(?:other\s+)?(?:music|audio|soundscapes?|sounds?)(?:\s+(?:do\s+you\s+have|you\s+have|available|options?))?|what\s+audio\s+do\s+you\s+have|show\s+me\s+(?:the\s+)?(?:audio|music)\s+(?:options?|categories)|list\s+(?:audio|music|soundscapes?))\b/i;

const RECOMMEND_AUDIO_RE =
  /\b(?:calming\s+nature\s+sounds?|nature\s+sounds?|peaceful\s+(?:nature\s+)?sounds?|suggest\s+(?:some\s+)?(?:calm|calming|nature)\s+(?:audio|music|sounds?))\b/i;

const PLAY_AUDIO_RE =
  /\b(?:play|start|turn on|put on)\b.{0,40}\b(?:audio|music|soundscape|sounds?|birds?|bird\s+sounds?|coffee(?:\s+house)?\s+chatter|chatter|rain|brown\s+noise|white\s+noise)\b/i;

const STOP_AUDIO_RE =
  /\b(?:stop|turn\s+off|silence|quiet|enough|no\s+more|end)\b.{0,40}\b(?:audio|music|soundscape|sounds?|birds?|chatter|ambience|that\s+sound)\b/i;

const BIRD_PLAY_RE =
  /\b(?:play|start|turn on)\b.{0,30}\b(?:birds?|bird\s+sounds?)\b/i;

const COFFEE_CHATTER_PLAY_RE =
  /\b(?:play|start|turn on)\b.{0,30}\b(?:coffee(?:\s+house)?\s+chatter|chatter)\b/i;

let activeAudioId: string | null = null;
let lastTrace: AudioPlaybackTrace | null = null;

export function isAudioPlaybackGuardEnabled(): boolean {
  if (typeof process === "undefined") return true;
  return process.env.NEXT_PUBLIC_AUDIO_PLAYBACK_GUARD !== "0";
}

export function getActiveEnvironmentalAudioId(): string | null {
  return activeAudioId;
}

export function getAudioPlaybackTrace(): AudioPlaybackTrace | null {
  return lastTrace;
}

function recordTrace(trace: AudioPlaybackTrace): AudioPlaybackTrace {
  lastTrace = trace;
  if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
    console.debug("[audioPlaybackGuard]", trace);
  }
  return trace;
}

export function classifyAudioPlaybackIntent(
  query: string,
): { intent: AudioPlaybackIntent; matchedPhrase?: string } {
  const trimmed = query.trim();
  if (!trimmed) return { intent: "unknown" };

  if (STOP_AUDIO_RE.test(trimmed)) {
    return { intent: "stop", matchedPhrase: trimmed };
  }

  if (BROWSE_AUDIO_RE.test(trimmed)) {
    return { intent: "browse", matchedPhrase: trimmed };
  }

  if (PLAY_AUDIO_RE.test(trimmed) || BIRD_PLAY_RE.test(trimmed) || COFFEE_CHATTER_PLAY_RE.test(trimmed)) {
    return { intent: "play", matchedPhrase: trimmed };
  }

  if (RECOMMEND_AUDIO_RE.test(trimmed)) {
    return { intent: "recommend", matchedPhrase: trimmed };
  }

  return { intent: "unknown" };
}

export function shouldBlockAutoPlayForAudioQuery(query: string): boolean {
  if (!isAudioPlaybackGuardEnabled()) return false;
  const { intent } = classifyAudioPlaybackIntent(query);
  return intent === "browse" || intent === "recommend";
}

export function resolveGuardedEnvironmentalAudioRequest(
  query: string,
): GuardedEnvironmentalAudioRequest | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const { intent } = classifyAudioPlaybackIntent(trimmed);
  if (intent !== "play") return null;

  if (BIRD_PLAY_RE.test(trimmed) || /\bplay\s+birds?\b/i.test(trimmed)) {
    const profile = resolveEstatePlaceAmbientProfile("greenhouse");
    if (!profile) return null;
    return {
      trackId: "greenhouse-birds",
      layer: "room",
      placeId: "greenhouse",
      profile,
    };
  }

  if (COFFEE_CHATTER_PLAY_RE.test(trimmed) || /\bstart\s+coffee\s+chatter\b/i.test(trimmed)) {
    return {
      trackId: "coffee-shop-chatter",
      layer: "overlay",
      soundscapeId: "coffee-shop",
    };
  }

  return null;
}

async function stopAllEnvironmentalLayers(): Promise<void> {
  await Promise.all([
    stopEstateRoomAmbience(),
    stopEstateSoundscapeOverlay(),
    stopGardenCardAmbience(),
    stopGardenFlagAmbience(),
  ]);
}

export async function stopGuardedEnvironmentalAudio(
  reason = "member_stop",
): Promise<AudioPlaybackTrace> {
  const previous = activeAudioId;
  await stopAllEnvironmentalLayers();
  activeAudioId = null;
  return recordTrace({
    audioIntent: "stop",
    requestedAudio: null,
    currentActiveAudio: previous,
    actionTaken: "stopped_all",
    blockedAudio: null,
    reason,
  });
}

export async function executeGuardedEnvironmentalAudioPlay(
  request: GuardedEnvironmentalAudioRequest,
  opts?: { userInitiated?: boolean },
): Promise<AudioPlaybackTrace> {
  if (!isAudioPlaybackGuardEnabled()) {
    return recordTrace({
      audioIntent: "play",
      requestedAudio: request.trackId,
      currentActiveAudio: activeAudioId,
      actionTaken: "guard_disabled",
      blockedAudio: null,
      reason: "guard_disabled",
    });
  }

  const previous = activeAudioId;
  if (previous && previous !== request.trackId) {
    await stopAllEnvironmentalLayers();
  }

  if (request.layer === "room" && request.placeId && request.profile) {
    if (opts?.userInitiated) {
      kickstartEstateRoomAmbience(request.placeId, request.profile);
    } else {
      await startEstateRoomAmbience(request.placeId, request.profile, {
        userInitiated: true,
      });
    }
    activeAudioId = request.trackId;
    return recordTrace({
      audioIntent: "play",
      requestedAudio: request.trackId,
      currentActiveAudio: previous,
      actionTaken: "play_room_ambience",
      blockedAudio: previous && previous !== request.trackId ? previous : null,
      reason: "single_track_guard",
    });
  }

  if (request.layer === "overlay" && request.soundscapeId) {
    await startEstateSoundscapeOverlay(request.soundscapeId);
    activeAudioId = request.trackId;
    return recordTrace({
      audioIntent: "play",
      requestedAudio: request.trackId,
      currentActiveAudio: previous,
      actionTaken: "play_soundscape_overlay",
      blockedAudio: previous && previous !== request.trackId ? previous : null,
      reason: "single_track_guard",
    });
  }

  return recordTrace({
    audioIntent: "play",
    requestedAudio: request.trackId,
    currentActiveAudio: previous,
    actionTaken: "unresolved_play",
    blockedAudio: null,
    reason: "missing_playback_target",
  });
}

/** Stop overlay before room ambience (and vice versa) unless layered audio is enabled later. */
export async function prepareSingleTrackPlayback(
  nextTrackId: string,
): Promise<void> {
  if (!isAudioPlaybackGuardEnabled()) return;
  if (activeAudioId && activeAudioId !== nextTrackId) {
    await stopAllEnvironmentalLayers();
  }
}

export function clearActiveEnvironmentalAudioState(): void {
  activeAudioId = null;
}
