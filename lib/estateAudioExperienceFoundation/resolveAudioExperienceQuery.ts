/**
 * Audio Experience Foundation™
 *
 * Understands what audio exists, where it lives, when it helps, and how it
 * connects to rooms and experiences — without inventing a full music library.
 */

import { matchMemberNeedSignal } from "@/lib/estateRecommendationIntelligence/memberNeedSignals";
import { getEstateLocationById } from "@/lib/estateKnowledgeBase/estateLocations";
import { audioExperiencesAtLocation } from "./audioExperiences";
import {
  audioExperiencesForEntity,
  audioExperiencesForExperienceGroup,
  audioExperiencesForNeedSignal,
} from "./audioMappings";
import { classifyAudioIntent } from "./classifyAudioIntent";
import { shouldBlockAutoPlayForAudioQuery } from "@/lib/estate/audioPlaybackGuard";
import {
  formatAudioExperienceInvitation,
  formatAudioHowToResponse,
} from "./formatAudioExperienceResponse";
import type {
  AudioExperience,
  AudioExperienceContext,
  AudioExperienceDecision,
} from "./types";

const MAX_DEFAULT = 3;

function pickExperiences(
  candidates: AudioExperience[],
  max: number,
): AudioExperience[] {
  const seen = new Set<string>();
  const picked: AudioExperience[] = [];

  for (const experience of candidates) {
    if (picked.length >= max) break;
    if (seen.has(experience.audioExperienceId)) continue;
    seen.add(experience.audioExperienceId);
    picked.push(experience);
  }

  return picked;
}

function experiencesForQuery(
  query: string,
  context: AudioExperienceContext,
): AudioExperience[] {
  const max = context.maxResults ?? MAX_DEFAULT;
  const collected: AudioExperience[] = [];

  if (context.currentLocationId) {
    collected.push(
      ...audioExperiencesAtLocation(context.currentLocationId),
      ...audioExperiencesForEntity("room", context.currentLocationId),
    );
  }

  const needMatch = matchMemberNeedSignal(query);
  if (needMatch) {
    collected.push(...audioExperiencesForNeedSignal(needMatch.signal.signalId));
  }

  if (context.memberNeedSignalId) {
    collected.push(
      ...audioExperiencesForNeedSignal(context.memberNeedSignalId),
    );
  }

  if (/\bmusic\b/i.test(query)) {
    collected.push(...audioExperiencesForExperienceGroup("music-and-sound"));
  }

  if (/\bpeaceful places\b|\bfocus audio\b/i.test(query)) {
    collected.push(...audioExperiencesForEntity("feature", "focus-audio"));
  }

  if (collected.length === 0) {
    collected.push(...audioExperiencesForExperienceGroup("music-and-sound"));
  }

  return pickExperiences(collected, max);
}

/**
 * Resolve member audio questions to KB-backed audio experiences.
 */
export function resolveAudioExperienceQuery(
  query: string,
  context: AudioExperienceContext = {},
): AudioExperienceDecision {
  const trimmed = query.trim();
  const unresolved: AudioExperienceDecision = {
    kind: "unresolved",
    query: trimmed,
    route: "audio_experience",
    experiences: [],
    reason: "not_audio_query",
  };

  if (!trimmed) return unresolved;

  const classification = classifyAudioIntent(trimmed);
  if (!classification?.kind) return unresolved;

  if (
    classification.kind === "browse_audio" ||
    classification.kind === "recommend_audio"
  ) {
    const experiences = experiencesForQuery(trimmed, context);
    const intro =
      classification.kind === "browse_audio"
        ? "Here are a few audio categories on the Estate:"
        : "Here are some calming nature audio options — tell me if you'd like to play one:";

    return {
      kind: "resolved",
      query: trimmed,
      route: "audio_experience",
      matchedPhrase: classification.matchedPhrase,
      experiences,
      memberFacingResponse: formatAudioExperienceInvitation(experiences, {
        intro,
      }),
      offerNavigation: false,
      navigationRoute: null,
      reason:
        classification.kind === "browse_audio"
          ? "audio_browse_no_autoplay"
          : "audio_recommend_no_autoplay",
    };
  }

  if (classification.kind === "stop_audio") {
    return {
      kind: "resolved",
      query: trimmed,
      route: "audio_experience",
      matchedPhrase: classification.matchedPhrase,
      experiences: [],
      memberFacingResponse: "Got it — the room is quiet now.",
      offerNavigation: false,
      navigationRoute: null,
      reason: "audio_stop",
    };
  }

  const experiences = experiencesForQuery(trimmed, context);
  if (experiences.length === 0) {
    return {
      ...unresolved,
      route:
        classification.kind === "how_audio" ? "audio_how_to" : "audio_experience",
      reason: "no_live_audio_experiences",
    };
  }

  const location = context.currentLocationId
    ? getEstateLocationById(context.currentLocationId)
    : null;

  if (classification.kind === "how_audio") {
    const primary = experiences[0];
    return {
      kind: "resolved",
      query: trimmed,
      route: "audio_how_to",
      matchedPhrase: classification.matchedPhrase,
      experiences: [primary],
      memberFacingResponse: formatAudioHowToResponse(primary),
      offerNavigation: Boolean(primary.accessRoute),
      navigationRoute: primary.accessRoute,
      reason: "audio_how_to",
    };
  }

  const intro =
    classification.kind === "where_audio"
      ? "A few places on the Estate where audio lives:"
      : classification.kind === "want_music"
        ? "When you want music or gentle sound:"
        : undefined;

  return {
    kind: "resolved",
    query: trimmed,
    route:
      classification.kind === "where_audio"
        ? "audio_location"
        : "audio_experience",
    matchedPhrase: classification.matchedPhrase,
    experiences,
    memberFacingResponse: formatAudioExperienceInvitation(experiences, {
      intro,
      currentLocationName: location?.officialDisplayName,
    }),
    offerNavigation: Boolean(experiences[0]?.accessRoute),
    navigationRoute: experiences[0]?.accessRoute ?? null,
    reason: `audio_${classification.kind}`,
  };
}

export function isResolvedAudioExperience(
  decision: AudioExperienceDecision,
): decision is AudioExperienceDecision & {
  memberFacingResponse: string;
} {
  return decision.kind === "resolved" && Boolean(decision.memberFacingResponse);
}
