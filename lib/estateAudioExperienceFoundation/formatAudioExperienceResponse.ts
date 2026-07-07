/**
 * Audio Experience Foundation™ — member-facing response formatting.
 */

import type { AudioExperience } from "./types";

export function formatAudioExperienceSummary(
  experience: AudioExperience,
): string {
  const purpose = experience.purpose[0];
  return purpose
    ? `${experience.name} — ${purpose}`
    : `${experience.name} — ${experience.description}`;
}

export function formatAudioExperienceInvitation(
  experiences: readonly AudioExperience[],
  options: {
    intro?: string;
    currentLocationName?: string;
  } = {},
): string {
  if (experiences.length === 0) {
    return "We can talk here quietly — or I can point you toward calm sound when you'd like it.";
  }

  const intro =
    options.intro ??
    (options.currentLocationName
      ? `Here in ${options.currentLocationName}, gentle audio is always optional.`
      : "Audio on the Estate is always optional — here when it helps.");

  const lines = experiences.map(formatAudioExperienceSummary);

  return [
    intro,
    "",
    ...lines,
    "",
    "Would you like to try one, or stay here?",
  ].join("\n");
}

export function formatAudioHowToResponse(
  experience: AudioExperience,
): string {
  const access = experience.accessRoute
    ? `You can open it from ${experience.name}, or just tell me what kind of calm you want.`
    : "Tell me what kind of calm you want — focus, music, or quiet company — and I'll go with you.";

  return [
    experience.description,
    "",
    access,
    "",
    "Want me to take you there?",
  ].join("\n");
}
