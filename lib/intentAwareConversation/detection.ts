/**
 * Classify conversation purpose and depth from member signals.
 */

import { detectEstateIntent } from "@/lib/estateBrain/intentCategories";
import type {
  ConversationDepth,
  ConversationPurpose,
  IntentAwareConversationInput,
} from "./types";

const TASK_CREATE_RE =
  /\b(?:help me (?:write|create|build|make|draft|design|develop|generate)|write (?:me )?(?:an? )?|create (?:an? )?|build (?:an? )?|draft (?:an? )?|newsletter|sop|marketing plan|presentation|email sequence|sales funnel)\b/i;

const TASK_RESEARCH_RE =
  /\b(?:research (?:this|the|my)|look up|find (?:out|data|stats)|compare (?:competitors|options)|analyze (?:the )?market)\b/i;

const PERSONAL_UNDERSTANDING_RE =
  /\b(?:what is my|who am i|my (?:biggest )?strength|my weakness|tell me about me)\b/i;

const TASK_LEARN_RE =
  /\b(?:teach me|explain (?:how|what)|help me understand|what is (?:a |an )?)\b/i;

const TASK_ORGANIZE_RE =
  /\b(?:organize my|sort (?:my|the)|clean up (?:my|the)|structure my)\b/i;

const TASK_SOLVE_RE =
  /\b(?:help me (?:fix|solve|figure out)|how do i (?:fix|solve)|problem with)\b/i;

const GUIDANCE_RE =
  /\b(?:i'?m stuck|don'?t know where to start|not sure where to start|keep procrastinating|can'?t decide|decision fatigue|going in circles|don'?t know what to do first)\b/i;

const REFLECTION_RE =
  /\b(?:i'?m overwhelmed|feel(?:ing)? (?:discouraged|defeated|hopeless|lost)|don'?t know what'?s wrong|questioning everything|what'?s the point|no motivation|everything feels (?:heavy|hard|wrong))\b/i;

const EXPLORATION_RE =
  /\b(?:just (?:want to )?(?:talk|chat|journal)|coffee house|life reflection|my dreams|my purpose|personal growth|deep conversation|explore (?:ideas|life|the estate)|estate guide (?:story|discussion)|tell me about (?:the estate|yourself))\b/i;

const JOURNAL_RE =
  /\b(?:journal|reflect on|write in my journal|need to process)\b/i;

const RELAX_RE =
  /\b(?:help me relax|need to unwind|just need quiet|sit with this)\b/i;

const CELEBRATE_RE =
  /\b(?:want to celebrate|need to celebrate|something to celebrate|celebrat(?:e|ing)(?:\s+(?:this|that|it|my))|share a win|big win|i did it|accomplish(?:ment|ed)|milestone)\b/i;

const THINK_RE =
  /\b(?:help me think|think (?:this|it) through|talk (?:this|it) through|brainstorm with me)\b/i;

const PLAN_RE =
  /\b(?:plan my|weekly plan|roadmap|marketing strategy|launch plan|quarter plan)\b/i;

const PURPOSE_CHANGE_RE =
  /\b(?:actually|instead|let'?s (?:just|switch|talk about)|change of topic|different topic|forget (?:that|the))\b/i;

export function detectConversationPurpose(
  text: string,
): ConversationPurpose | null {
  const t = text.trim();
  if (!t) return null;

  if (EXPLORATION_RE.test(t)) return "explore";
  if (JOURNAL_RE.test(t)) return "journal";
  if (RELAX_RE.test(t)) return "relax";
  if (CELEBRATE_RE.test(t)) return "celebrate";
  if (PERSONAL_UNDERSTANDING_RE.test(t)) return "explore";
  if (TASK_CREATE_RE.test(t)) return "create";
  if (TASK_RESEARCH_RE.test(t)) return "research";
  if (TASK_LEARN_RE.test(t)) return "learn";
  if (TASK_ORGANIZE_RE.test(t)) return "organize";
  if (TASK_SOLVE_RE.test(t)) return "solve";
  if (PLAN_RE.test(t)) return "plan";
  if (THINK_RE.test(t)) return "think";
  if (GUIDANCE_RE.test(t)) return "think";
  if (REFLECTION_RE.test(t)) return "recover";

  const estateMatch = detectEstateIntent(t);
  if (estateMatch) {
    const map: Partial<Record<string, ConversationPurpose>> = {
      create: "create",
      learn: "learn",
      plan: "plan",
      reflect: "journal",
      focus: "think",
      restore: "recover",
      celebrate: "celebrate",
      business: "solve",
      visual_thinking: "think",
    };
    return map[estateMatch.category] ?? null;
  }

  return null;
}

export function detectConversationDepth(
  input: IntentAwareConversationInput,
): ConversationDepth {
  const t = input.userText.trim();

  if (EXPLORATION_RE.test(t) || JOURNAL_RE.test(t) || RELAX_RE.test(t)) {
    return "exploration";
  }
  if (PERSONAL_UNDERSTANDING_RE.test(t)) {
    return "exploration";
  }
  if (REFLECTION_RE.test(t) || input.overwhelmed) {
    return "reflection";
  }
  if (GUIDANCE_RE.test(t)) {
    return "guidance";
  }
  if (
    TASK_CREATE_RE.test(t) ||
    TASK_RESEARCH_RE.test(t) ||
    TASK_ORGANIZE_RE.test(t) ||
    TASK_SOLVE_RE.test(t) ||
    (TASK_LEARN_RE.test(t) && !REFLECTION_RE.test(t))
  ) {
    return "task";
  }
  if (input.sessionWasWork && !REFLECTION_RE.test(t) && !GUIDANCE_RE.test(t)) {
    return "task";
  }

  return "guidance";
}

export function memberChangedPurpose(text: string): boolean {
  return PURPOSE_CHANGE_RE.test(text.trim());
}

export function depthAllowsCoaching(depth: ConversationDepth): boolean {
  return depth !== "task";
}

export function depthAllowsPersonalQuestions(depth: ConversationDepth): boolean {
  return depth === "reflection" || depth === "exploration";
}
