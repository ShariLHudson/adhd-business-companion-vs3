import type { EmotionalState } from "@/lib/companionEmotions";

/** Output of Companion Intelligence™ orchestration — understanding only; never renders UI. */
export type CompanionState = {
  emotionalState: EmotionalState;
  energy: "low" | "medium" | "high";
  overwhelmed: boolean;
  intent: string | null;
  objective: string | null;
  momentum: "low" | "steady" | "high";
  writingActive: boolean;
  voiceConversation: boolean;
};

export type CompanionStateInput = Partial<CompanionState>;

export function createCompanionState(
  input: CompanionStateInput = {},
): CompanionState {
  return {
    emotionalState: input.emotionalState ?? "unclear",
    energy: input.energy ?? "medium",
    overwhelmed: input.overwhelmed ?? false,
    intent: input.intent ?? null,
    objective: input.objective ?? null,
    momentum: input.momentum ?? "steady",
    writingActive: input.writingActive ?? false,
    voiceConversation: input.voiceConversation ?? false,
  };
}
