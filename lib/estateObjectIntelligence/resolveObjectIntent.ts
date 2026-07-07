/**
 * Estate Object Intelligence™ — resolve member questions about objects they see.
 *
 * Connects: estate-objects.json · object-locations.json · object-aliases.json
 */

import { getEstateObjectById } from "./estateObjects";
import { matchObjectAlias } from "./objectAliases";
import { selectPlacementForContext } from "./objectLocations";
import {
  formatObjectIdentification,
  suggestedActionForObject,
} from "./formatObjectResponse";
import type {
  ObjectIntentKind,
  ObjectIntentResolution,
  ObjectResolutionContext,
} from "./types";

const OBJECT_QUESTION_RE =
  /\b(?:what is (?:that|the)|what's (?:that|the)|who is|tell me about(?: the)?|can i (?:use|open)|may i (?:use|open))\b/i;

const USE_REQUEST_RE =
  /\b(?:can i (?:use|open)|may i (?:use|open)|open (?:the|that)|use (?:the|that))\b/i;

function classifyIntent(query: string): ObjectIntentKind {
  if (USE_REQUEST_RE.test(query)) return "use_request";
  if (/\b(?:story|legend|history)\b/i.test(query)) return "story_request";
  if (OBJECT_QUESTION_RE.test(query)) return "identify";
  return "unresolved";
}

function isObjectRelatedQuery(query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return false;
  if (OBJECT_QUESTION_RE.test(trimmed)) return true;
  return matchObjectAlias(trimmed) != null;
}

/**
 * Resolve natural language about a visible estate object.
 * Returns unresolved when the message is not object-related.
 */
export function resolveObjectIntent(
  query: string,
  context: ObjectResolutionContext = {},
): ObjectIntentResolution {
  const trimmed = query.trim();
  const base: ObjectIntentResolution = {
    kind: "unresolved",
    query: trimmed,
    reason: "not_object_query",
  };

  if (!trimmed) return base;
  if (!isObjectRelatedQuery(trimmed)) return base;

  const alias = matchObjectAlias(trimmed);
  if (!alias) {
    return {
      ...base,
      reason: "no_alias_match",
    };
  }

  const object = getEstateObjectById(alias.objectId);
  if (!object) {
    return {
      kind: "unresolved",
      query: trimmed,
      matchedPhrase: alias.phrase,
      reason: "unknown_object",
    };
  }

  const intentKind = classifyIntent(trimmed);
  const placement = selectPlacementForContext(
    object.objectId,
    context.currentLocationId,
  );

  const memberFacingAnswer =
    intentKind === "story_request"
      ? [object.story, object.purpose].filter(Boolean).join(" ")
      : formatObjectIdentification(object, intentKind);

  return {
    kind: intentKind === "unresolved" ? "identify" : intentKind,
    query: trimmed,
    matchedPhrase: alias.phrase,
    object,
    placement: placement ?? undefined,
    memberFacingAnswer,
    suggestedAction: suggestedActionForObject(object),
    reason: "object_resolved",
  };
}

/** True when resolution found a known estate object. */
export function isResolvedObjectIntent(
  resolution: ObjectIntentResolution,
): resolution is ObjectIntentResolution & { object: NonNullable<ObjectIntentResolution["object"]> } {
  return resolution.kind !== "unresolved" && resolution.object != null;
}
