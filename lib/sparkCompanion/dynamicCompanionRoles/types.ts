/**
 * Dynamic Companion Roles™ — one relationship, many roles.
 */

export const COMPANION_ROLE_GOVERNING_QUESTION =
  "What role would be most helpful right now?" as const;

export type CompanionRole =
  | "create_do"
  | "think_decide"
  | "support_restore"
  | "discover_learn";

export const SPARK_FOUR_ROLES = [
  { id: "create_do", tagline: "Let's build it." },
  { id: "think_decide", tagline: "Let's figure it out." },
  { id: "support_restore", tagline: "Let's make this feel lighter." },
  { id: "discover_learn", tagline: "Let me teach and show you what's possible." },
] as const;

export type CompanionRoleDecision = {
  role: CompanionRole;
  confidence: "high" | "medium" | "low";
  assumeCompetence: boolean;
  reason: string;
  /** Prior role when conversation shifted */
  previousRole?: CompanionRole;
};

export type EvaluateCompanionRoleInput = {
  userText: string;
  lastUserText?: string | null;
  overwhelmed?: boolean;
  previousRole?: CompanionRole | null;
};

export type CompanionRoleSession = {
  role: CompanionRole;
  setAtTurn: number;
  lastUserText: string;
};
