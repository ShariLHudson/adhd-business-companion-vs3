import type { StablesDiscussMode, StablesExperienceDefinition } from "./types";
import { stablesRoomHintForChat } from "./stablesVoice";

export type StablesLearningChatTurn = {
  memberText: string;
  chatHint: string;
};

export function stablesLearningChatHint(
  experience: StablesExperienceDefinition,
  mode: StablesDiscussMode,
): string {
  const lines = [
    stablesRoomHintForChat(experience),
    `STABLES EXPERIENCE CONTEXT: ${experience.trademark}`,
    experience.placeholderCopy,
    "Do NOT leave the Stables or reset the conversation.",
    "One warm reflective response — coach, do not lecture.",
  ];

  switch (mode) {
    case "reflect":
      lines.push(
        "Member wants to reflect here. One gentle question — then wait.",
      );
      break;
    case "challenge":
      lines.push(
        "Member wants a small confidence challenge. Offer one safe step — never shame.",
      );
      break;
    case "apply":
      lines.push(
        "Member asked how this applies to their business or life. Ground in their words.",
      );
      break;
    case "save-reflection":
      lines.push(
        "Member may want to save this reflection. Ask permission before Journal™, Cabinet, Evidence Vault™, or Growth Profile™.",
      );
      break;
  }

  return lines.join("\n");
}

export function stablesDiscussTurn(
  experience: StablesExperienceDefinition,
  mode: StablesDiscussMode = "reflect",
): StablesLearningChatTurn {
  const prompts: Record<StablesDiscussMode, string> = {
    reflect: `I'd like to reflect on ${experience.title.toLowerCase()} with you.`,
    challenge: `Can we try a small confidence step related to ${experience.title.toLowerCase()}?`,
    apply: `How might ${experience.title.toLowerCase()} apply to my situation?`,
    "save-reflection": `I'd like to keep what we talked about from ${experience.title.toLowerCase()}.`,
  };

  return {
    memberText: prompts[mode],
    chatHint: stablesLearningChatHint(experience, mode),
  };
}

export function stablesArrivalDiscussTurn(): StablesLearningChatTurn {
  return {
    memberText: "I'm here at the Stables — what would help most?",
    chatHint: stablesRoomHintForChat(null),
  };
}
