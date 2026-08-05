/**
 * resolveEstateBackground — the single authoritative background-precedence
 * function for Spark Estate.
 *
 * This is a pure function: no localStorage, no React state, no DOM access,
 * no audio coupling, no Date/Math.random. Every input is explicit data the
 * caller has already gathered (from chatBackdropPreference, room registries,
 * remembered session state, time/emotion-derived suggestions, etc.). The
 * caller is responsible for reading storage and passing correctly-scoped
 * candidates in — this function only decides which candidate wins and why.
 *
 * Precedence order (highest wins; each tier falls through when absent or
 * invalid — invalid meaning missing a backgroundId or imageUrl):
 *
 *   1. dedicatedExperience, when `required: true` — a ceremony/immersive
 *      plate a specific experience must show regardless of member choice
 *      (e.g. Journal Gazebo's canonical plate, a manifest video). Wins
 *      unconditionally, even over an explicit member choice.
 *   2. memberChoice — the member's explicit, saved choice for this exact
 *      place. Once present, it always wins over every tier below.
 *   3. roomRequired — a room's own necessary default plate (distinct from
 *      the generic app default), used only when there is no member choice
 *      yet. Reserve this for rooms that genuinely need their own identity,
 *      not as a routine substitute for `default`.
 *   4. remembered — the last background actually shown for this place,
 *      used when there is no member choice or room requirement.
 *   5. default — the hard fallback when nothing else applies. Always used
 *      as literally given; this function never invents placeholder data.
 *
 * `systemRecommendation` (time-of-day, emotion, topic seed, Plan/Adapt My
 * Day, or any other suggestion source) is orthogonal to this chain — it is
 * carried through in the `recommendation` field for a caller to optionally
 * surface as a suggestion, but it can never become the resolved background
 * on its own. Recommendations are proposed, never silently applied.
 */

export type EstateBackgroundCandidate = {
  /** Opaque id for the background (e.g. "library", "welcome-home", a room's canonical plate id). */
  backgroundId: string;
  /** The resolved image URL for this candidate. */
  imageUrl: string;
};

export type EstateBackgroundSource =
  | "dedicated-experience"
  | "member-choice"
  | "room-required"
  | "remembered"
  | "default";

export type EstateBackgroundPersistencePolicy =
  | "member-preference"
  | "session-remembered"
  | "fixed"
  | "not-persisted";

export type EstateBackgroundRecommendation = EstateBackgroundCandidate & {
  /** Why this was suggested (e.g. "time-of-day:evening", "emotion:overwhelmed", "plan-my-day"). */
  reason: string;
};

export type EstateBackgroundRequest = {
  /** Canonical room id, or a named scope such as "home" / "clear-my-mind". */
  place: string;

  /**
   * A ceremony/immersive plate that must show regardless of member choice.
   * Only wins when `required` is true — present-but-not-required is treated
   * as informational and ignored for precedence purposes.
   */
  dedicatedExperience?:
    | (EstateBackgroundCandidate & { required: boolean; reason: string })
    | null;

  /** The member's explicit, currently-saved choice for this exact place. */
  memberChoice?: EstateBackgroundCandidate | null;

  /** A room's own necessary plate, used only when there is no member choice yet. */
  roomRequired?: (EstateBackgroundCandidate & { reason: string }) | null;

  /** The last background actually shown for this place. */
  remembered?: EstateBackgroundCandidate | null;

  /** A suggestion only — never applied automatically. */
  systemRecommendation?: EstateBackgroundRecommendation | null;

  /** The hard fallback. Always required; used as literally given. */
  default: EstateBackgroundCandidate;
};

export type EstateBackgroundResolution = {
  place: string;
  backgroundId: string;
  imageUrl: string;
  source: EstateBackgroundSource;
  /** Human-readable explanation of why this candidate won. */
  reason: string;
  memberSelected: boolean;
  /** True only for dedicated-experience plates — they don't reflect lasting preference. */
  temporary: boolean;
  /** Always false on a resolution: recommendations never win on their own. */
  recommendationOnly: boolean;
  persistencePolicy: EstateBackgroundPersistencePolicy;
  /** A pending suggestion the caller may choose to surface — never auto-applied. */
  recommendation: EstateBackgroundRecommendation | null;
  /** Explains any skipped/invalid higher tiers; null when nothing was skipped. */
  fallbackReason: string | null;
};

function isValidCandidate(
  candidate: EstateBackgroundCandidate | null | undefined,
): candidate is EstateBackgroundCandidate {
  return Boolean(candidate && candidate.backgroundId && candidate.imageUrl);
}

function resolveRecommendation(
  request: EstateBackgroundRequest,
): EstateBackgroundRecommendation | null {
  return isValidCandidate(request.systemRecommendation ?? null)
    ? (request.systemRecommendation as EstateBackgroundRecommendation)
    : null;
}

export function resolveEstateBackground(
  request: EstateBackgroundRequest,
): EstateBackgroundResolution {
  const recommendation = resolveRecommendation(request);
  const fallbackReasons: string[] = [];

  if (request.dedicatedExperience?.required) {
    if (isValidCandidate(request.dedicatedExperience)) {
      return {
        place: request.place,
        backgroundId: request.dedicatedExperience.backgroundId,
        imageUrl: request.dedicatedExperience.imageUrl,
        source: "dedicated-experience",
        reason: request.dedicatedExperience.reason,
        memberSelected: false,
        temporary: true,
        recommendationOnly: false,
        persistencePolicy: "fixed",
        recommendation,
        fallbackReason: null,
      };
    }
    fallbackReasons.push("dedicated experience was required but invalid");
  }

  if (request.memberChoice) {
    if (isValidCandidate(request.memberChoice)) {
      return {
        place: request.place,
        backgroundId: request.memberChoice.backgroundId,
        imageUrl: request.memberChoice.imageUrl,
        source: "member-choice",
        reason: "member's saved choice for this place",
        memberSelected: true,
        temporary: false,
        recommendationOnly: false,
        persistencePolicy: "member-preference",
        recommendation,
        fallbackReason: fallbackReasons.length ? fallbackReasons.join("; ") : null,
      };
    }
    fallbackReasons.push("member choice was present but invalid");
  }

  if (request.roomRequired) {
    if (isValidCandidate(request.roomRequired)) {
      return {
        place: request.place,
        backgroundId: request.roomRequired.backgroundId,
        imageUrl: request.roomRequired.imageUrl,
        source: "room-required",
        reason: request.roomRequired.reason,
        memberSelected: false,
        temporary: false,
        recommendationOnly: false,
        persistencePolicy: "fixed",
        recommendation,
        fallbackReason: fallbackReasons.length ? fallbackReasons.join("; ") : null,
      };
    }
    fallbackReasons.push("room-required background was present but invalid");
  }

  if (request.remembered) {
    if (isValidCandidate(request.remembered)) {
      return {
        place: request.place,
        backgroundId: request.remembered.backgroundId,
        imageUrl: request.remembered.imageUrl,
        source: "remembered",
        reason: "last background shown for this place",
        memberSelected: false,
        temporary: false,
        recommendationOnly: false,
        persistencePolicy: "session-remembered",
        recommendation,
        fallbackReason: fallbackReasons.length ? fallbackReasons.join("; ") : null,
      };
    }
    fallbackReasons.push("remembered background was present but invalid");
  }

  if (!isValidCandidate(request.default)) {
    fallbackReasons.push(
      "default background was missing a backgroundId or imageUrl",
    );
  }

  return {
    place: request.place,
    backgroundId: request.default.backgroundId,
    imageUrl: request.default.imageUrl,
    source: "default",
    reason:
      "no dedicated experience, member choice, room requirement, or remembered background applied",
    memberSelected: false,
    temporary: false,
    recommendationOnly: false,
    persistencePolicy: "not-persisted",
    recommendation,
    fallbackReason: fallbackReasons.length ? fallbackReasons.join("; ") : null,
  };
}
