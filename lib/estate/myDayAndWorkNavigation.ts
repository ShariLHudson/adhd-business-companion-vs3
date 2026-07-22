/**
 * My Day & Work — approved destination routing contract.
 * Menu labels and chat aliases must resolve to these destinations only.
 *
 * @see lib/estate/sparkEstateTopNavigationAndProfileMenu.ts
 */

export const MY_DAY_AND_WORK_DESTINATIONS = [
  {
    id: "plan-my-day",
    label: "Plan My Day",
    opener: "plan-my-day",
    aliases: ["plan my day", "open plan my day", "today's plan"],
  },
  {
    id: "rhythms",
    label: "Rhythms",
    opener: "rhythms",
    aliases: ["rhythms", "take me to rhythms", "open rhythms"],
  },
  {
    id: "reminders",
    label: "Reminders",
    opener: "reminders",
    aliases: ["reminders", "open reminders", "my reminders"],
  },
  {
    id: "calendar",
    label: "Calendar",
    opener: "calendar",
    aliases: ["calendar", "calendars", "show my calendar", "open calendar"],
  },
  {
    id: "projects",
    label: "Projects",
    /** Approved current Projects experience — Project Homes (not legacy blue ProjectsPanel). */
    opener: "project-homes",
    aliases: [
      "projects",
      "open projects",
      "go to projects",
      "my projects",
      "project homes",
    ],
  },
  {
    id: "clear-my-mind",
    label: "Clear My Mind",
    opener: "clear-my-mind",
    aliases: ["clear my mind", "take me to clear my mind", "brain dump"],
  },
  {
    id: "parking-lot",
    label: "Parking Lot",
    opener: "parking-lot",
    aliases: ["parking lot", "open my parking lot", "open parking lot"],
  },
  {
    id: "destination-gallery",
    label: "Destination Gallery",
    opener: "destination-gallery",
    aliases: [
      "destination gallery",
      "show destination gallery",
      "open destination gallery",
    ],
  },
  {
    id: "cartographers-studio",
    label: "Cartographer's Studio",
    opener: "cartographers-studio",
    aliases: [
      "cartography",
      "cartography room",
      "cartographer's studio",
      "cartographers studio",
      "take me to cartography",
      "open cartography",
    ],
  },
] as const;

export type MyDayAndWorkDestinationId =
  (typeof MY_DAY_AND_WORK_DESTINATIONS)[number]["id"];

export type MyDayAndWorkOpener =
  (typeof MY_DAY_AND_WORK_DESTINATIONS)[number]["opener"];

/** Destinations that must never be used as silent fallbacks for My Day & Work. */
export const MY_DAY_AND_WORK_FORBIDDEN_FALLBACKS = [
  "brain-dump",
  "clear-my-mind",
  "creative-studio",
  "content-generator",
  "projects", // legacy blue-screen ProjectsPanel section
] as const;

export function getMyDayAndWorkDestination(
  id: MyDayAndWorkDestinationId,
): (typeof MY_DAY_AND_WORK_DESTINATIONS)[number] {
  const found = MY_DAY_AND_WORK_DESTINATIONS.find((d) => d.id === id);
  if (!found) {
    throw new Error(`Unknown My Day & Work destination: ${id}`);
  }
  return found;
}

/** Resolve a member phrase to a My Day & Work opener, or null. */
export function resolveMyDayAndWorkOpenerFromText(
  text: string,
): MyDayAndWorkOpener | null {
  const normalized = text.trim().toLowerCase().replace(/[?.!]+$/g, "");
  if (!normalized) return null;

  for (const dest of MY_DAY_AND_WORK_DESTINATIONS) {
    for (const alias of dest.aliases) {
      if (
        normalized === alias ||
        normalized === `open ${alias}` ||
        normalized === `take me to ${alias}` ||
        normalized === `show ${alias}` ||
        normalized === `show me ${alias}` ||
        normalized === `show my ${alias}` ||
        normalized === `open my ${alias}`
      ) {
        return dest.opener;
      }
    }
  }

  // Phrase-shaped matches (order: more specific first)
  if (/\b(?:open|show|take me to)\s+(?:my\s+)?reminders?\b/i.test(normalized)) {
    return "reminders";
  }
  if (/\b(?:open|show|take me to)\s+(?:my\s+)?rhythms?\b/i.test(normalized)) {
    return "rhythms";
  }
  if (
    /\b(?:open|show|take me to)\s+(?:my\s+)?parking\s+lot\b/i.test(normalized)
  ) {
    return "parking-lot";
  }
  if (
    /\b(?:open|show|take me to)\s+(?:the\s+)?destination\s+gallery\b/i.test(
      normalized,
    )
  ) {
    return "destination-gallery";
  }
  if (
    /\b(?:open|show|take me to)\s+(?:the\s+)?cartograph(?:y|er's?\s+studio|ers?\s+studio)\b/i.test(
      normalized,
    )
  ) {
    return "cartographers-studio";
  }
  if (
    /\b(?:open|show|take me to|go to|bring me to|head to)\s+(?:my\s+|the\s+)?(?:goals\s*(?:&|and)\s*)?projects?\b/i.test(
      normalized,
    ) ||
    /\bproject\s+homes?\b/i.test(normalized) ||
    /\b(?:i need to see|see|view)\b[\s\S]{0,40}\b(?:all\s+)?(?:my\s+)?(?:current\s+)?projects?\b/i.test(
      normalized,
    )
  ) {
    return "project-homes";
  }
  if (
    /\b(?:open|show|take me to)\s+(?:my\s+)?calendars?\b/i.test(normalized)
  ) {
    return "calendar";
  }
  if (/\b(?:open\s+)?plan\s+my\s+day\b/i.test(normalized)) {
    return "plan-my-day";
  }
  if (/\b(?:take me to\s+)?clear\s+my\s+mind\b/i.test(normalized)) {
    return "clear-my-mind";
  }

  return null;
}

/** True when an opener must not silently resolve to a forbidden fallback. */
export function isForbiddenMyDayAndWorkFallback(
  sectionOrPlaceId: string | null | undefined,
): boolean {
  if (!sectionOrPlaceId) return false;
  return (MY_DAY_AND_WORK_FORBIDDEN_FALLBACKS as readonly string[]).includes(
    sectionOrPlaceId,
  );
}
