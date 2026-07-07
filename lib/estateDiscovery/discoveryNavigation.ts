/**
 * Discovery navigation — resolve Estate Intelligence routes to AppSection.
 * Discovery Note never hardcodes destinations.
 */

import type { AppSection } from "@/lib/companionUi";

const KNOWN_SECTIONS = new Set<string>([
  "home",
  "focus-timer",
  "brain-dump",
  "breathe",
  "focus-audio",
  "settings",
  "projects",
  "playbook",
  "profile",
  "energy",
  "templates-library",
  "saved-work",
  "my-work",
  "focus",
  "progress",
  "time-block",
  "activities",
  "guided-exercises",
  "spin-wheel",
  "games",
  "quick-recharge",
  "grow",
  "momentum-builder",
  "momentum-institute",
  "stables",
  "grow-momentum-builders",
  "grow-spark-cards",
  "grow-guilds",
  "grow-daily-discoveries",
  "grow-business-history",
  "grow-observatory",
  "email-generator",
  "snippets",
  "content-types",
  "content-generator",
  "google-workspace",
  "business-profile",
  "client-avatars",
  "how-do-i",
  "decision-compass",
  "today",
  "plan-my-day",
  "visual-focus",
  "wins-this-week",
  "evidence-bank",
  "growth",
  "growth-capture",
  "growth-library",
  "growth-reports",
  "confidence-vault",
  "my-journey",
  "growth-journal",
  "growth-greenhouse",
  "growth-portfolio",
  "user-memory",
  "welcome-room",
  "life-experience",
  "the-gallery",
  "strategies",
  "focus-my-brain",
]);

export function parseCompanionSectionFromRoute(
  route: string | null | undefined,
): AppSection | null {
  if (!route?.trim()) return null;

  try {
    const url = route.startsWith("http")
      ? new URL(route)
      : new URL(route, "https://spark.local");

    const section = url.searchParams.get("section");
    if (section && KNOWN_SECTIONS.has(section)) {
      return section as AppSection;
    }
  } catch {
    return null;
  }

  return null;
}

export function isResolvableDiscoveryRoute(
  route: string | null | undefined,
): boolean {
  return parseCompanionSectionFromRoute(route) !== null;
}
