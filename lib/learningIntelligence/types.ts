/**
 * Learning Intelligence — pilot contracts for Visual Thinking integration.
 * Pedagogical ownership stays with Learning. Representation stays with Visual Thinking.
 * Named to align with architecture pack 551–562 without inventing a full curriculum runtime.
 */

export type LearningKnowledgeLevel =
  | "beginner"
  | "developing"
  | "experienced"
  | "advanced"
  | "unknown";

export type LearningStage =
  | "orienting"
  | "explaining"
  | "practicing"
  | "reviewing"
  | "reflecting"
  | "complete";

export type LearningMode =
  | "guided_explanation"
  | "comparison"
  | "process"
  | "relationship"
  | "practice"
  | "review";

export type LearningVisualPurpose =
  | "understand_relationships"
  | "understand_sequence"
  | "understand_hierarchy"
  | "understand_chronology"
  | "compare_concepts"
  | "see_the_whole"
  | "learn_a_process"
  | "reinforce_memory"
  | "review_key_ideas"
  | "identify_gaps"
  | "follow_learning_progression";

export type LearningApprovedKnowledgeItem = {
  id: string;
  title: string;
  content: string;
  kind:
    | "definition"
    | "concept"
    | "relationship"
    | "step"
    | "example"
    | "warning"
    | "question";
  sourceReference?: string | null;
  confidence?: "high" | "medium" | "low" | "unknown";
  verified?: boolean;
};

export type LearningSessionSnapshot = {
  learningSessionId: string;
  conversationId: string | null;
  topic: string;
  learningGoal: string;
  successDefinition: string | null;
  learnerKnowledgeLevel: LearningKnowledgeLevel;
  requestedDepth: "essentials" | "guided" | "detailed" | "unknown";
  learningStage: LearningStage;
  learningMode: LearningMode;
  currentExplanation: string | null;
  /** Scoped — never the entire Learning library. */
  approvedKnowledgeItems: LearningApprovedKnowledgeItem[];
  keyConcepts: string[];
  relationshipHints: string[];
  sequenceHints: string[];
  comparisonHints: string[];
  incompleteQuestions: string[];
  lessonPosition: string | null;
  completedLearningSteps: string[];
  learnerNotes: string[];
  progressState: "in_progress" | "paused" | "complete";
};

export type LearningReturnContext = {
  learningSessionId: string;
  conversationId: string | null;
  topic: string;
  lessonPosition: string | null;
  resumePrompt: string | null;
  returnRoute: "learning_chamber";
};
