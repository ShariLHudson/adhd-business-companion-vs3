/**
 * Spark Conversation Examples™ (Spec 115).
 * Gold-standard scenario metadata — full turn-by-turn lives in docs/conversation-examples/
 *
 * @see docs/SPARK_CONVERSATION_EXAMPLES_FRAMEWORK.md
 * @see docs/SPARK_CONVERSATION_FLOW_ENGINE_FRAMEWORK.md (Spec 114)
 */

export type SparkConversationExampleScenarioId =
  | "marketing_app"
  | "overwhelmed"
  | "have_an_idea"
  | "dont_know_what_to_do"
  | "write_workshop"
  | "avoiding_something";

export const SPARK_CONVERSATION_EXAMPLE_SCENARIOS: readonly {
  id: SparkConversationExampleScenarioId;
  number: number;
  opening: string;
  primaryModes: string[];
  status: "template" | "complete";
}[] = [
  {
    id: "marketing_app",
    number: 1,
    opening: "I need help marketing my app.",
    primaryModes: ["clarify", "explore", "create"],
    status: "template",
  },
  {
    id: "overwhelmed",
    number: 2,
    opening: "I'm overwhelmed.",
    primaryModes: ["support", "coach"],
    status: "template",
  },
  {
    id: "have_an_idea",
    number: 3,
    opening: "I have an idea.",
    primaryModes: ["explore", "coach"],
    status: "template",
  },
  {
    id: "dont_know_what_to_do",
    number: 4,
    opening: "I don't know what to do.",
    primaryModes: ["support", "clarify"],
    status: "template",
  },
  {
    id: "write_workshop",
    number: 5,
    opening: "I need to write a workshop.",
    primaryModes: ["understand", "explore", "create"],
    status: "template",
  },
  {
    id: "avoiding_something",
    number: 6,
    opening: "I'm avoiding something.",
    primaryModes: ["support", "coach"],
    status: "template",
  },
] as const;

/** Fields required in each full example document */
export type SparkConversationExampleRecord = {
  scenarioId: SparkConversationExampleScenarioId;
  turns: Array<{
    role: "member" | "spark";
    content: string;
    flowMode?: string;
    state?: string;
    hiddenProcess?: string;
    permissionGate?: boolean;
  }>;
  antiPatterns: string[];
};

export const SPARK_CONVERSATION_EXAMPLE_V2_CATEGORIES = [
  "pricing decision",
  "client email dread",
  "returning after absence",
  "just print this",
  "research request",
  "gallery milestone",
  "journal emotional processing",
  "multi-project overwhelm",
  "brand voice clarification",
  "launch week chaos",
] as const;

/** Target count for gold-standard library */
export const SPARK_CONVERSATION_EXAMPLE_TARGET_COUNT = 30 as const;
