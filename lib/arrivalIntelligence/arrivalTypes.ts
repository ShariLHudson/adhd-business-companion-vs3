export type ArrivalVisitorKind =
  | "first_onboarding"
  | "onboarding_return"
  | "returning"
  | "long_absence";

export type ArrivalGreetingStrategy =
  | "warm_introduction"
  | "quiet_continuation"
  | "gentle_return"
  | "open_presence";

export type ArrivalUiEmphasis =
  | "conversation_first"
  | "subtle_continue"
  | "continue_choose"
  | "onboarding_chat";

export type ArrivalConversationalTone = "warm" | "calm" | "encouraging" | "quiet";

export type ArrivalSuggestedAction =
  | "focus_chat"
  | "continue_single"
  | "continue_choose"
  | null;
