import type { WorkspaceOffer } from "@/lib/workspaceMode";

const WELCOME_ROOM_PATTERNS: RegExp[] = [
  /\bwho are you\b/i,
  /\btell me about yourself\b/i,
  /\babout you\b/i,
  /\bwhy did you build\b/i,
  /\bwhy (did you )?create(d)? (this|the companion)\b/i,
  /\bhow does this work\b/i,
  /\bhow were you diagnosed\b/i,
  /\bwhat(?:'s| is) your story\b/i,
  /\bwho is shari\b/i,
];

export const WELCOME_ROOM_CONVERSATION_REPLY =
  "I'd love to tell you. If you'd rather explore at your own pace, my Welcome Room shares a little about my story and why I created this Companion." as const;

export function isWelcomeRoomConversation(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return WELCOME_ROOM_PATTERNS.some((re) => re.test(t));
}

export function welcomeRoomWorkspaceOffer(text: string): WorkspaceOffer | null {
  if (!isWelcomeRoomConversation(text)) return null;
  return {
    section: "welcome-room",
    buttonLabel: "Open Welcome Room",
    line: WELCOME_ROOM_CONVERSATION_REPLY,
  };
}
