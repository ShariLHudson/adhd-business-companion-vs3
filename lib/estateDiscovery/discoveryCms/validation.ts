/**
 * Discovery CMS — validation before Live activation.
 */

import { getKnowledgeItem } from "@/lib/estateKnowledgeBase/loader";
import { officialNameFor } from "@/lib/estateKnowledgeBase/vocabulary";
import {
  getEstateIntelligenceItem,
  isLiveEstateIntelligenceItem,
  resolveRegistryNavigationRoute,
} from "../estateIntelligenceLoader";
import { isResolvableDiscoveryRoute } from "../discoveryNavigation";
import type {
  DiscoveryCmsRecord,
  DiscoveryContentValidationResult,
  DiscoveryValidationIssue,
} from "./types";
import { lintDiscoveryVoice } from "./voiceLint";
import { editorialStatus, isMemberFacingDiscoveryStatus } from "./workflow";

function stripTm(value: string): string {
  return value.replace(/™/g, "").trim().toLowerCase();
}

function titleUsesOfficialName(title: string, official: string): boolean {
  const normalizedTitle = stripTm(title);
  const normalizedOfficial = stripTm(official);
  return (
    normalizedTitle.includes(normalizedOfficial) ||
    normalizedOfficial.includes(normalizedTitle)
  );
}

function issue(
  code: string,
  message: string,
  severity: DiscoveryValidationIssue["severity"] = "error",
  field?: string,
): DiscoveryValidationIssue {
  return { code, message, severity, field };
}

function registryToKnowledgeId(
  registry: DiscoveryCmsRecord["targetRegistry"],
): "rooms" | "features" | "tools" | "settings" | "routes" | null {
  switch (registry) {
    case "estate-rooms":
      return "rooms";
    case "estate-features":
      return "features";
    case "estate-tools":
      return "tools";
    case "estate-settings":
      return "settings";
    case "estate-routes":
      return "routes";
    default:
      return null;
  }
}

export function validateDiscoveryContent(
  record: DiscoveryCmsRecord,
): DiscoveryContentValidationResult {
  const issues: DiscoveryValidationIssue[] = [];

  if (!record.id?.trim()) {
    issues.push(issue("missing-id", "Discovery id is required", "error", "id"));
  }

  if (!record.title?.trim()) {
    issues.push(issue("missing-title", "Title is required", "error", "title"));
  }

  if (!record.discoveryText?.trim()) {
    issues.push(
      issue(
        "missing-discovery-text",
        "Discovery text is required",
        "error",
        "discoveryText",
      ),
    );
  }

  if (!record.author?.trim()) {
    issues.push(
      issue("missing-author", "Author is required", "error", "author"),
    );
  }

  if (!record.createdAt?.trim()) {
    issues.push(
      issue(
        "missing-created-at",
        "Created date is required",
        "error",
        "createdAt",
      ),
    );
  }

  if (!record.lastUpdated?.trim()) {
    issues.push(
      issue(
        "missing-last-updated",
        "Last updated date is required",
        "error",
        "lastUpdated",
      ),
    );
  }

  if (record.version < 1) {
    issues.push(
      issue("invalid-version", "Version must be at least 1", "error", "version"),
    );
  }

  const target = getEstateIntelligenceItem(
    record.targetRegistry,
    record.targetId,
  );
  if (!target) {
    issues.push(
      issue(
        "invalid-target",
        `Target ${record.targetRegistry}/${record.targetId} not found in Estate Knowledge Base`,
        "error",
        "targetId",
      ),
    );
  }

  if (record.relatedRoom) {
    const room = getKnowledgeItem("rooms", record.relatedRoom);
    if (!room) {
      issues.push(
        issue(
          "invalid-related-room",
          `Related room "${record.relatedRoom}" not in Knowledge Base`,
          "error",
          "relatedRoom",
        ),
      );
    }
  }

  if (record.relatedFeature) {
    const feature = getKnowledgeItem("features", record.relatedFeature);
    if (!feature) {
      issues.push(
        issue(
          "invalid-related-feature",
          `Related feature "${record.relatedFeature}" not in Knowledge Base`,
          "error",
          "relatedFeature",
        ),
      );
    }
  }

  const registryRoute = resolveRegistryNavigationRoute(
    record.targetRegistry,
    record.targetId,
  );

  if (record.destinationRoute) {
    if (!isResolvableDiscoveryRoute(record.destinationRoute)) {
      issues.push(
        issue(
          "invalid-route",
          "Destination route is not a valid companion section path",
          "error",
          "destinationRoute",
        ),
      );
    }
    if (registryRoute && record.destinationRoute !== registryRoute) {
      issues.push(
        issue(
          "route-mismatch",
          "Destination route does not match Knowledge Base registry route",
          "error",
          "destinationRoute",
        ),
      );
    }
  } else if (record.destinationType && !registryRoute) {
    issues.push(
      issue(
        "missing-destination",
        "Destination type set but no resolvable route",
        "error",
        "destinationRoute",
      ),
    );
  }

  const knowledgeRegistry = registryToKnowledgeId(record.targetRegistry);
  if (knowledgeRegistry && target) {
    const official = officialNameFor(knowledgeRegistry, record.targetId);
    const skipTerminology =
      record.category === "welcome" ||
      record.category === "estate-story" ||
      record.category === "personal-discovery" ||
      record.category === "hidden-treasure" ||
      record.category === "seasonal-discovery";
    if (official && !skipTerminology && !titleUsesOfficialName(record.title, official)) {
      issues.push(
        issue(
          "terminology-title",
          `Title should use official name "${official}" from Estate Knowledge Base`,
          "warning",
          "title",
        ),
      );
    }
  }

  const voice = lintDiscoveryVoice(record);
  if (!voice.passed) {
    for (const violation of voice.violations) {
      issues.push(
        issue(
          `voice-${violation.pattern}`,
          `Voice standard violation in ${violation.field}: "${violation.excerpt}"`,
          "error",
          violation.field,
        ),
      );
    }
  }

  return {
    discoveryId: record.id,
    valid: issues.filter((i) => i.severity === "error").length === 0,
    issues,
  };
}

export function validateDiscoveryForLive(
  record: DiscoveryCmsRecord,
): DiscoveryContentValidationResult {
  const base = validateDiscoveryContent(record);
  const issues = [...base.issues];

  if (!isMemberFacingDiscoveryStatus(record.status)) {
    issues.push(
      issue(
        "not-live-status",
        `Status must be Live for member activation (current: ${record.status})`,
        "error",
        "status",
      ),
    );
  }

  const target = getEstateIntelligenceItem(
    record.targetRegistry,
    record.targetId,
  );
  if (!isLiveEstateIntelligenceItem(target)) {
    issues.push(
      issue(
        "target-not-live",
        "Target must be Live in Estate Knowledge Base",
        "error",
        "targetId",
      ),
    );
  }

  if (record.relatedRoom) {
    const room = getKnowledgeItem("rooms", record.relatedRoom);
    if (room && room.status !== "Live") {
      issues.push(
        issue(
          "related-room-not-live",
          "Related room must be Live in Knowledge Base",
          "error",
          "relatedRoom",
        ),
      );
    }
  }

  if (record.relatedFeature) {
    const feature = getKnowledgeItem("features", record.relatedFeature);
    if (feature && feature.status !== "Live") {
      issues.push(
        issue(
          "related-feature-not-live",
          "Related feature must be Live in Knowledge Base",
          "error",
          "relatedFeature",
        ),
      );
    }
  }

  if (editorialStatus(record.status) === "Live") {
    const editorial = record.editorial;
    if (!editorial?.approvedAt) {
      issues.push(
        issue(
          "missing-approval",
          "Live discoveries should have editorial.approvedAt set",
          "warning",
          "editorial",
        ),
      );
    }
  }

  return {
    discoveryId: record.id,
    valid: issues.filter((i) => i.severity === "error").length === 0,
    issues,
  };
}

export function isDiscoveryEligibleForMembers(
  record: DiscoveryCmsRecord,
): boolean {
  if (!isMemberFacingDiscoveryStatus(record.status)) return false;
  return validateDiscoveryForLive(record).valid;
}
