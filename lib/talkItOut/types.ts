import type { ConversationRuntimeState } from "@/lib/conversationIntelligenceEngine";
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
  /** Strategy moves already used this conversation (package 201). */
  usedStrategyMoves?: string[];
  userDiscoveries: string[];
  userNamedNextSteps: string[];
  savedDiscoveries: TalkItOutSavedDiscovery[];
  /** Latest useful grounded summary (packages 204–205). */
  usefulSummary?: string;
  /** Set on pause — cleared after grounded re-entry is delivered. */
  needsReentry?: boolean;
  /** Only true after the member explicitly asks for more help / another perspective. */
  explicitHelpRequested: boolean;
  futureFeelingAsked: boolean;
  /** Hidden RCI Thinking Map — never show to members. */
  thinkingMap?: ThinkingMap;
  /** CIE runtime state — packages 195–196; never show to members. */
  cieState?: ConversationRuntimeState;
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
