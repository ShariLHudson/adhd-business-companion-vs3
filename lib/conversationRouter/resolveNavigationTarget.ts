/**
 * Single destination resolver for navigation language.
 * Uses Estate command router + hard-nav — no scattered alias maps.
 */

import { detectDirectCommand } from "@/lib/estateIntelligence/estateCommandRouter";
import { resolveEstatePlaceIdFromUserText } from "@/lib/estate/estateRoomAliasRegistry";
import { resolveHardNavigationCommand } from "@/lib/hardNavigationCommands";
import { resolveAuthoritativeDestinationId } from "@/lib/estate/destinationAliases";
import { isDirectNavigationPriorityTurn } from "@/lib/chatScope/directNavigationPriority";

export type ResolvedNavigationTarget = {
  destinationId: string;
  label: string;
  source: "estate_command" | "hard_nav" | "alias";
};

/** Map hard-nav workspace targets onto Estate destination ids when possible. */
function hardNavToDestinationId(
  cmd: NonNullable<ReturnType<typeof resolveHardNavigationCommand>>,
): string | null {
  const t = cmd.target;
  switch (t.kind) {
    case "workspace":
      if (t.section === "create") return "create";
      if (t.section === "brain-dump") return "clear-my-mind";
      if (t.section === "talk-it-out") return "talk-it-out";
      return t.section;
    case "clear-my-mind":
      return "clear-my-mind";
    case "talk-it-out":
      return "talk-it-out";
    case "adapt-my-day":
      return "plan-my-day";
    case "decision-compass":
      return "decision-compass";
    case "focus-audio":
      return "focus-audio";
    case "spark-estate-guide":
      return "welcome-home";
    default:
      return null;
  }
}

/**
 * Resolve a navigation utterance to a canonical destination id.
 * Unknown destinations return null — never invent a route.
 */
export function resolveNavigationTarget(
  userText: string,
): ResolvedNavigationTarget | null {
  const t = userText.trim();
  if (!t) return null;

  if (isWelcomeHomeNavigation(t)) {
    return {
      destinationId: "welcome-home",
      label: "Welcome Home",
      source: "alias",
    };
  }

  const hard = resolveHardNavigationCommand(t);
  if (hard) {
    const id = hardNavToDestinationId(hard);
    if (id) {
      const canonical = resolveAuthoritativeDestinationId(id) ?? id;
      return {
        destinationId: canonical,
        label: hard.localReply.replace(/^Opening\s+/i, "").replace(/\.$/, ""),
        source: "hard_nav",
      };
    }
  }

  const direct = detectDirectCommand(t);
  if (direct?.executeImmediately && (direct.roomId || direct.entryId)) {
    const raw = direct.roomId ?? direct.entryId ?? "";
    const canonical = resolveAuthoritativeDestinationId(raw) ?? raw;
    return {
      destinationId: canonical,
      label: canonical,
      source: "estate_command",
    };
  }

  if (isDirectNavigationPriorityTurn(t)) {
    const place = resolveEstatePlaceIdFromUserText(t);
    if (place) {
      const canonical = resolveAuthoritativeDestinationId(place) ?? place;
      return {
        destinationId: canonical,
        label: canonical,
        source: "alias",
      };
    }
  }

  return null;
}

/** Welcome Home / Estate / home equivalents. */
export function isWelcomeHomeNavigation(userText: string): boolean {
  const normalized = userText
    .trim()
    .replace(/[.!?]+$/, "")
    .trim()
    .toLowerCase();
  return /^(?:(?:please\s+)?(?:go|take me|bring me|return|head)\s+(?:back\s+)?(?:to\s+)?(?:the\s+)?(?:estate|welcome home|home)|(?:open|show(?:\s+me)?)\s+(?:the\s+)?(?:estate|welcome home)|welcome home|go home)$/i.test(
    normalized,
  );
}
