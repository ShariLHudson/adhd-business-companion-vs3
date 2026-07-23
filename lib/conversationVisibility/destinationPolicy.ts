import type { DestinationChatClass } from "./types";

/**
 * Classify destinations for Companion On/Off.
 * Specialized experiences keep their own conversation; general companion chat
 * can still be quieted without cancelling the specialized session.
 */
const DESTINATION_CHAT_CLASS: Record<string, DestinationChatClass> = {
  "welcome-home": "user_controllable",
  homestead: "user_controllable",
  conservatory: "user_controllable",
  "evening-hearth": "user_controllable",
  "strategy-library": "user_controllable",
  playbook: "user_controllable",
  create: "user_controllable",
  "content-generator": "user_controllable",
  projects: "no_chat_by_design",
  "project-homes": "no_chat_by_design",
  "growth-journal": "no_chat_by_design",
  journal: "no_chat_by_design",
  "evidence-bank": "initially_hidden",
  "evidence-vault": "initially_hidden",
  "estate-library": "initially_hidden",
  library: "initially_hidden",
  "chamber-of-momentum": "specialized_conversation",
  boardroom: "specialized_conversation",
  "talk-it-out": "specialized_conversation",
  "brain-dump": "user_controllable",
  "clear-my-mind": "user_controllable",
  "peaceful-places": "user_controllable",
  "just-be-here": "initially_hidden",
  profile: "user_controllable",
  "my-business-estate": "user_controllable",
  "founder-studio": "specialized_conversation",
};

const PRODUCT_DEFAULT_OFF: ReadonlySet<string> = new Set([
  "evidence-bank",
  "evidence-vault",
  "estate-library",
  "library",
  "growth-journal",
  "journal",
  "project-homes",
  "projects",
  "just-be-here",
]);

export function classifyDestinationChat(
  destinationId: string | null | undefined,
): DestinationChatClass {
  if (!destinationId) return "user_controllable";
  return DESTINATION_CHAT_CLASS[destinationId] ?? "user_controllable";
}

/** Whether the Conversation-area Companion On/Off control should appear. */
export function supportsCompanionVisibilityControl(
  destinationId: string | null | undefined,
): boolean {
  const cls = classifyDestinationChat(destinationId);
  return cls === "user_controllable" || cls === "initially_hidden";
}

/**
 * Product default when no member preference exists.
 * Controllable destinations default On; designed-quiet destinations default Off.
 */
export function productDefaultVisibility(
  destinationId: string | null | undefined,
): "on" | "off" {
  if (!destinationId) return "on";
  if (PRODUCT_DEFAULT_OFF.has(destinationId)) return "off";
  const cls = classifyDestinationChat(destinationId);
  if (cls === "no_chat_by_design") return "off";
  if (cls === "initially_hidden") return "off";
  return "on";
}

/** Map AppSection-ish ids to preference destination keys. */
export function normalizeConversationDestinationId(
  raw: string | null | undefined,
): string | null {
  if (!raw) return null;
  const id = raw.trim();
  if (!id) return null;
  if (id === "evidence-bank") return "evidence-vault";
  if (id === "content-generator") return "create";
  if (id === "growth-journal") return "journal";
  if (id === "playbook") return "strategy-library";
  if (id === "project-homes") return "projects";
  return id;
}
