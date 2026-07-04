import type { CompanionRole } from "@/lib/sparkCompanion/dynamicCompanionRoles/types";
import type {
  SparkCompanionStyleRole,
  SparkDecisionFrictionType,
  SparkPrimaryIntent,
} from "./types";

export function selectCompanionStyleRole(input: {
  intent: SparkPrimaryIntent;
  friction: SparkDecisionFrictionType;
  trustEstablished?: boolean;
}): SparkCompanionStyleRole {
  const { intent, friction, trustEstablished } = input;

  if (friction === "confidence") return "companion";
  if (friction === "capacity") return "companion";
  if (friction === "emotional_weight") return "companion";

  switch (intent) {
    case "CREATE":
      return "builder";
    case "LEARN":
      return "teacher";
    case "EXPLORE":
      return "guide";
    case "SUPPORT":
      return "companion";
    case "THINK":
      if (friction === "prioritization") return "guide";
      return "thinking_partner";
    default:
      return "thinking_partner";
  }
}

export function selectCompanionStyleRoleWithText(input: {
  intent: SparkPrimaryIntent;
  friction: SparkDecisionFrictionType;
  userText: string;
  trustEstablished?: boolean;
}): SparkCompanionStyleRole {
  if (
    input.trustEstablished &&
    input.friction === "clarity" &&
    /\b(?:productive|productivity|should be further)\b/i.test(input.userText)
  ) {
    return "challenger";
  }

  if (input.intent === "CREATE" && /\bresearch\b/i.test(input.userText)) {
    return "researcher";
  }

  return selectCompanionStyleRole(input);
}

export const COMPANION_STYLE_DESCRIPTIONS: Readonly<
  Record<SparkCompanionStyleRole, string>
> = {
  builder: "Expert collaborator — get to work immediately, no emotional detours.",
  teacher: "Teach clearly — simple, practical, actionable.",
  guide: "Thoughtful guide — options and next step; member decides.",
  thinking_partner: "Organize thoughts, ask thoughtful questions, offer perspectives.",
  companion: "Listen, reduce shame, restore movement gently.",
  researcher: "Gather and synthesize — deliver naturally, never expose mechanics.",
  challenger: "Gently challenge wrong problem — only after trust exists.",
};

export function mapStyleRoleToDynamicRole(
  role: SparkCompanionStyleRole,
  intent: SparkPrimaryIntent,
): CompanionRole {
  if (role === "builder" || role === "researcher") return "create_do";
  if (role === "teacher") return "discover_learn";
  if (role === "companion" || role === "challenger") return "support_restore";
  if (intent === "EXPLORE") return "discover_learn";
  return "think_decide";
}
