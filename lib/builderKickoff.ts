/**
 * Builder kickoff — split layout, Step 1 on the right, one chat question on the left.
 * Header stays short and distinct from the chat bubble.
 */

import type { AppSection } from "./companionUi";

export const CLIENT_AVATAR_KICKOFF_HEADER = "Tell me about the people you help";

export const CLIENT_AVATAR_STEP1_QUESTION = "Who do you help most often?";

export const CLIENT_AVATAR_STEP1_CHAT =
  "[[focus:avatar-name]]Who do you help most often? Give them a simple name and quick description.";

export const CREATE_KICKOFF_HEADER = "Create with Shari";

export const CREATE_COMPANION_STABLE_HEADER = "One question at a time.";

export const CREATE_STEP1_QUESTION = "What would you like to create?";

export const CREATE_STEP1_CHAT = `**What would you like to create?**

For example:
• Social Media Post
• Email
• Newsletter
• Blog Post
• SOP
• Workshop
• Lead Magnet
• Landing Page
• Sales Page
• Funnel
• Presentation
• Training
• Other`;

export type BuilderKickoffSection =
  | "client-avatars"
  | "projects"
  | "playbook"
  | "content-generator";

export function buildClientAvatarKickoffMessage(): {
  role: "assistant";
  content: string;
} {
  return { role: "assistant", content: CLIENT_AVATAR_STEP1_CHAT };
}

export function buildCreateKickoffMessage(): {
  role: "assistant";
  content: string;
} {
  return { role: "assistant", content: CREATE_STEP1_CHAT };
}

export function kickoffHeaderForSection(
  section: BuilderKickoffSection | null,
): string | null {
  switch (section) {
    case "client-avatars":
      return CLIENT_AVATAR_KICKOFF_HEADER;
    case "content-generator":
      return CREATE_KICKOFF_HEADER;
    default:
      return null;
  }
}

export function isBuilderKickoffChatMessage(content: string): boolean {
  return (
    content.includes(CLIENT_AVATAR_STEP1_QUESTION) ||
    content.includes(CREATE_STEP1_QUESTION)
  );
}

export function isStaleCreateOpener(content: string): boolean {
  return (
    /one question at a time/i.test(content) ||
    (/I'm here to help you build/i.test(content) &&
      /SOP, workshop/i.test(content))
  );
}

export function isStaleAvatarCoachOpener(content: string): boolean {
  return (
    /build your Client Avatar together/i.test(content) ||
    /I see you(?:'re| are) defining/i.test(content) ||
    /I see you(?:'re| are).*(?:client avatar|ideal client)/i.test(content) ||
    /I'm beside your \*\*Client Avatars\*\*/i.test(content)
  );
}

/** True while kickoff chat is waiting for the user's first reply. */
export function isBuilderKickoffAwaitingAnswer(input: {
  kickoffActive: boolean;
  messages: { role: string; content: string }[];
}): boolean {
  if (!input.kickoffActive) return false;
  const lastUser = [...input.messages]
    .reverse()
    .find((m) => m.role === "user")
    ?.content?.trim();
  return !lastUser;
}

export function shouldSuppressCardsForBuilderKickoff(input: {
  kickoffActive: boolean;
  messages: { role: string; content: string }[];
}): boolean {
  return isBuilderKickoffAwaitingAnswer(input);
}

export function sectionSupportsBuilderKickoff(
  section: AppSection | null,
): section is BuilderKickoffSection {
  return (
    section === "client-avatars" ||
    section === "projects" ||
    section === "playbook" ||
    section === "content-generator"
  );
}
