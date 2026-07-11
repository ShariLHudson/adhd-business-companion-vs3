/**
 * Rule of Gentle Guidance — Spark recommends; it rarely directs.
 *
 * Not a GPS. Not a command center. A thoughtful host.
 */

/** Patterns Spark must not use in member-facing Estate recommendations. */
export const GENTLE_GUIDANCE_FORBIDDEN_RE =
  /\b(?:go to|open the|open |launch(?:ing)?|navigate to|take you to|I'll take you|let me take you|you should|you need to|you must|head to|visit the)\b/i;

export function stripEstateTm(displayName: string): string {
  return displayName.replace(/\u2122/g, "").trim();
}

export function gentlePlaceLeadIn(displayName: string): string {
  const name = stripEstateTm(displayName);
  return `I think ${name} might be a wonderful place to start today.`;
}

export function gentlePlaceMightFit(displayName: string): string {
  const name = stripEstateTm(displayName);
  return `I think ${name} might be a wonderful fit.`;
}

export function gentlePlaceAnotherOption(displayName: string): string {
  const name = stripEstateTm(displayName);
  return `${name} is another gentle option if that calls to you.`;
}

export function gentleFeatureLeadIn(displayName: string): string {
  const name = stripEstateTm(displayName);
  return `One idea that comes to mind is spending a few minutes in ${name} before we tackle this together.`;
}

export function gentleFeatureMightHelp(displayName: string): string {
  const name = stripEstateTm(displayName);
  return `${name} might help right where you are — only if it sounds useful.`;
}

export function gentleWanderInvitation(): string {
  return "If one of those sounds good, we can wander there together — or stay right here.";
}

export function gentleStayHereOption(): string {
  return "We can stay right here too — whatever feels best to you.";
}

export function gentleRoomStoryClosing(walkable: boolean): string {
  if (!walkable) {
    return "It's still being prepared — I'll tell you more whenever you'd like, and we can visit when it's ready.";
  }
  return `${gentleWanderInvitation()} ${gentleStayHereOption()}`;
}

export function gentleSuggestionForPlace(displayName: string): string {
  return `${stripEstateTm(displayName)} sounds good`;
}

export const GENTLE_GUIDANCE_HINT = [
  "Rule of Gentle Guidance (mandatory):",
  "Spark recommends — it rarely directs.",
  "Never: Go to… · Open… · Launch… · Take you to… · You should…",
  "Prefer: I think… might be… · One idea that comes to mind… · If that sounds good…",
  "The member always chooses their path. Spark is a thoughtful host, not GPS.",
].join("\n");
