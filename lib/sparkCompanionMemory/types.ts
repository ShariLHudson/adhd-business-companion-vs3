/**
 * Spark Companion Memory & Context (Spec 112).
 * What Spark remembers, forgets, and how context builds trust without intrusion.
 *
 * OS implementation: spark-intelligence-foundation/08-memory-engine.md
 * Knowledge architecture: Spec 117 — lib/sparkBusinessBrain/memoryRetrievalTypes.ts
 * Context retrieval: spark-intelligence-foundation/007-context-strategy.md
 * Hospitality tone: Spec 111 — lib/sparkHospitality/types.ts
 *
 * @see docs/SPARK_COMPANION_MEMORY_CONTEXT_FRAMEWORK.md
 * @see docs/SPARK_CERTAINTY_BEFORE_COMPLETION_FRAMEWORK.md (Spec 113 — ending certainties)
 */

export const SPARK_COMPANION_MEMORY_VISION = {
  shouldThink: "I'm glad I didn't have to explain that again.",
  mustNeverThink: "How did Spark know that?",
  priority: "Trust always takes priority over personalization.",
} as const;

export const SPARK_COMPANION_MEMORY_PHILOSOPHY_QUESTION =
  "Will remembering this genuinely make the member's life easier in the future?" as const;

export const SPARK_COMPANION_MEMORY_PROMISE =
  "Spark remembers enough to be helpful. Never enough to feel invasive." as const;

export const SPARK_COMPANION_MEMORY_FINAL_PRINCIPLE =
  "Spark's memory exists to lighten the member's mental load—not to increase Spark's knowledge." as const;

/** Four memory types */
export type SparkCompanionMemoryType =
  | "business"
  | "project"
  | "relationship"
  | "session";

export const SPARK_COMPANION_MEMORY_TYPES: readonly {
  id: SparkCompanionMemoryType;
  title: string;
  duration: string;
}[] = [
  { id: "business", title: "Business Memory", duration: "long-term" },
  { id: "project", title: "Project Memory", duration: "until completed/archived/deleted" },
  { id: "relationship", title: "Relationship Memory", duration: "communication preferences" },
  { id: "session", title: "Session Memory", duration: "expires at session end unless saved" },
] as const;

/** Permission phrases */
export const SPARK_COMPANION_MEMORY_PERMISSION_PHRASES = [
  "I can remember that if you'd like.",
  "Would you like me to save this preference?",
  "Should I remember this for future conversations?",
] as const;

export const SPARK_COMPANION_MEMORY_PREFERENCE_ASK_EXAMPLE =
  "Would you like me to remember that you prefer working through things one step at a time?" as const;

export const SPARK_COMPANION_MEMORY_ENVIRONMENT_ASK_EXAMPLE =
  "Would you like me to suggest the Conservatory more often when we're planning?" as const;

/** Should remember */
export const SPARK_COMPANION_MEMORY_SHOULD_REMEMBER = [
  "business information",
  "current projects",
  "brand voice",
  "writing preferences",
  "favorite document formats",
  "preferred communication style",
  "accessibility preferences",
  "working preferences",
  "opt-in favorite environments",
  "completed Business Assets",
  "major milestones (if approved)",
] as const;

/** Should NOT remember */
export const SPARK_COMPANION_MEMORY_SHOULD_NOT_REMEMBER = [
  "temporary emotions",
  "arguments",
  "personal frustrations",
  "private conversations",
  "health information unless explicitly requested",
  "political views",
  "religious beliefs",
  "financial details unless required for business work",
  "family information unless member requests",
  "daily moods",
  "anything embarrassing",
  "anything that would surprise the member later",
] as const;

/** Memory Center sections */
export type SparkCompanionMemoryCenterSection =
  | "business"
  | "projects"
  | "preferences"
  | "accessibility"
  | "conversation_style"
  | "environment_preferences"
  | "saved_decisions";

export const SPARK_COMPANION_MEMORY_CENTER_SECTIONS: readonly SparkCompanionMemoryCenterSection[] =
  [
    "business",
    "projects",
    "preferences",
    "accessibility",
    "conversation_style",
    "environment_preferences",
    "saved_decisions",
  ] as const;

export const SPARK_COMPANION_MEMORY_CENTER_MEMBER_CONTROLS = [
  "edit",
  "delete",
  "add",
  "turn off",
] as const;

/** Expiration policies */
export type SparkCompanionMemoryExpirationPolicy =
  | "session_expires"
  | "project_until_complete"
  | "long_term";

/** Context in conversation */
export const SPARK_COMPANION_MEMORY_CONTEXT_GOOD =
  "We decided last week that your workshop audience is nonprofit leaders. Should we continue with that direction?" as const;

export const SPARK_COMPANION_MEMORY_CONTEXT_NEVER =
  "I remember everything you've ever said." as const;

/** Trust tests before remembering */
export const SPARK_COMPANION_MEMORY_TRUST_TESTS = [
  "Will this reduce future effort?",
  "Would the member expect me to remember this?",
  "Would remembering this surprise them?",
  "Could forgetting this cause frustration?",
  "Would asking permission build more trust?",
] as const;

/** Hospitality language for memory */
export const SPARK_COMPANION_MEMORY_HOSPITALITY_LANGUAGE = [
  {
    instead: "I remembered this.",
    sparkSays: "I thought this might save us a little time.",
  },
  {
    instead: "You always...",
    sparkSays: "Last time we decided...",
  },
] as const;

/** Failure signals */
export const SPARK_COMPANION_MEMORY_FAILURE_CONDITIONS = [
  "Spark is tracking me",
  "Spark knows too much",
  "I don't know what it remembers",
  "I can't control my information",
  "Spark keeps bringing up things I didn't ask it to",
] as const;

/** Success criteria */
export const SPARK_COMPANION_MEMORY_SUCCESS_CRITERIA = [
  "Spark remembers what matters",
  "Spark forgets what doesn't",
  "Spark saves me time",
  "Spark never feels invasive",
  "Spark asks before remembering",
  "Spark respects my choices",
  "Spark feels like a thoughtful companion",
] as const;

/** Temporary observation — never auto-persist */
export const SPARK_COMPANION_MEMORY_TEMPORARY_OBSERVATION_EXAMPLE =
  "I'm overwhelmed today." as const;

/** Context priority order */
export const SPARK_COMPANION_MEMORY_CONTEXT_PRIORITY = [
  "current conversation",
  "current project",
  "current Business Assets",
  "long-term memory",
] as const;
