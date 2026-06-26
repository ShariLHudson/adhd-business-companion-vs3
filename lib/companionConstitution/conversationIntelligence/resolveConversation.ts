import type { AppSection } from "@/lib/companionUi";
import type {
  ConversationIntelligenceInput,
  ConversationIntelligenceVerdict,
  ConversationMode,
} from "./types";

const REGULATION_SECTIONS = new Set<AppSection>([
  "breathe",
  "focus-audio",
  "focus-timer",
  "guided-exercises",
  "spin-wheel",
]);

function resolveMode(input: ConversationIntelligenceInput): ConversationMode {
  if (input.arrivalActive) return "arrival";
  const section = input.workspacePanel ?? input.activeSection ?? null;
  if (section && REGULATION_SECTIONS.has(section)) return "regulation";
  if (input.workspaceBesideChat && section) return "workspace-beside-chat";
  if (section && section !== "home") return "standalone-workspace";
  return "chat";
}

/**
 * Conversation Intelligence™ — understands the conversational context.
 * Never renders UI. Never routes workspaces alone — informs Companion Intelligence.
 */
export function resolveConversationIntelligence(
  input: ConversationIntelligenceInput = {},
): ConversationIntelligenceVerdict {
  const activeSection = input.activeSection ?? null;
  const mode = resolveMode(input);
  const inConversationThread = (input.messageCount ?? 0) > 1;

  return {
    state: {
      mode,
      activeSection,
      workspaceBesideChat: Boolean(input.workspaceBesideChat),
      inConversationThread,
      userText: input.userText ?? null,
    },
    dataAttributes: {
      "data-conversation-intelligence": "1",
      "data-conversation-mode": mode,
    },
  };
}
