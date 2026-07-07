/**
 * Discovery trigger evaluation — V1 rules from discovery-library.json triggerRules.
 */

import type {
  DiscoveryLibraryItem,
  DiscoveryMemberContext,
  DiscoveryTriggerRule,
} from "./types";

function ruleEnabled(rule: DiscoveryTriggerRule): boolean {
  return rule.enabled !== false;
}

function evaluateRule(
  rule: DiscoveryTriggerRule,
  item: DiscoveryLibraryItem,
  context: DiscoveryMemberContext,
): boolean {
  if (!ruleEnabled(rule)) return false;

  const config = rule.config ?? {};

  switch (rule.type) {
    case "first-estate-visit": {
      const visits = Object.values(context.roomVisitCounts).reduce(
        (sum, count) => sum + count,
        0,
      );
      const maxVisits = Number(config.maxRoomVisits ?? 1);
      return visits <= maxVisits;
    }
    case "first-room-visit": {
      const roomId = String(config.roomId ?? item.relatedRoom ?? "");
      if (!roomId) return false;
      const visits = context.roomVisitCounts[roomId] ?? 0;
      return visits <= 1;
    }
    case "never-visited-room": {
      const roomId = String(config.roomId ?? item.relatedRoom ?? "");
      if (!roomId) return false;
      return (context.roomVisitCounts[roomId] ?? 0) === 0;
    }
    case "feature-never-used": {
      const featureId = String(config.featureId ?? item.relatedFeature ?? "");
      if (!featureId) return false;
      return !context.featuresUsed.includes(featureId);
    }
    case "season-active": {
      const seasonId = String(config.seasonId ?? "");
      if (!seasonId || !context.activeSeasonId) return false;
      return context.activeSeasonId === seasonId;
    }
    case "favorite-room": {
      const roomId = String(config.roomId ?? item.relatedRoom ?? "");
      if (!roomId) return false;
      return (context.favoriteRoomIds ?? []).includes(roomId);
    }
    case "manual":
    case "member-pattern-detected":
    case "time-based":
      return false;
    default:
      return false;
  }
}

export function discoveryTriggersMatch(
  item: DiscoveryLibraryItem,
  context: DiscoveryMemberContext,
): boolean {
  const rules = item.triggerRules ?? [];
  if (rules.length === 0) return true;

  const enabledRules = rules.filter(ruleEnabled);
  if (enabledRules.length === 0) return false;

  return enabledRules.some((rule) => evaluateRule(rule, item, context));
}
