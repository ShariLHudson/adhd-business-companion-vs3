import type { ThinkingMap } from "@/lib/reflectiveConversationIntelligence";

export type TalkItOutMessageRole = "assistant" | "user";

export type TalkItOutMessage = {
  id: string;
  role: TalkItOutMessageRole;
  content: string;
  questionId?: string;
  createdAt: string;
};

export type TalkItOutSessionStatus = "active" | "paused" | "completed";

export type TalkItOutSavedDiscovery = {
  id: string;
  text: string;
  savedAt: string;
  destination: "talk-it-out-history" | "journal" | "evidence-vault";
};

export type TalkItOutSession = {
  id: string;
  title?: string;
  topic?: string;
  status: TalkItOutSessionStatus;
  messages: TalkItOutMessage[];
  usedQuestionIds: string[];
  userDiscoveries: string[];
  userNamedNextSteps: string[];
  savedDiscoveries: TalkItOutSavedDiscovery[];
  /** Only true after the member explicitly asks for more help / another perspective. */
  explicitHelpRequested: boolean;
  futureFeelingAsked: boolean;
  /** Hidden RCI Thinking Map — never show to members. */
  thinkingMap?: ThinkingMap;
  createdAt: string;
  updatedAt: string;
};

export type TalkItOutQuestionArea =
  | "what-happened"
  | "meaning"
  | "values"
  | "needs"
  | "options"
  | "trade-offs"
  | "patterns"
  | "readiness"
  | "future-feeling";

export type TalkItOutQuestion = {
  id: string;
  area: TalkItOutQuestionArea;
  text: string;
};
