/**
 * Classify user messages before emotional reflection or Create/pending-card routing.
 * Priority 3B: do not diagnose emotion from ordinary task language.
 * Priority 3C: discovery/brainstorming is not creation.
 * Priority 3E: conversation is a valid outcome — thinking/deciding/prioritizing stay in chat.
 */

import type { AppSection } from "./companionUi";
import { isChatConversationOnlyMode } from "./chatConversationOnly";
import { isHelpSeekingAnswer } from "./builderContentSync";
import { isInformationIntent } from "./companionIntentRouting";
import { isExplicitWorkspaceOpenRequest } from "./conversationGating";

export type MessageCategory =
  | "emotional_distress"
  | "practical_task"
  | "mixed_emotional_task"
  | "casual_conversation"
  | "active_workspace";

/** What the user is doing in chat — only creating/executing may open workflows. */
export type ConversationalMode =
  | "thinking"
  | "deciding"
  | "brainstorming"
  | "prioritizing"
  | "creating"
  | "executing"
  | "neutral";

const PRIORITIZING_RE =
  /\b(?:help me prioritize?|prioritiz(?:e|ing)|what should i (?:do|work on|focus on) first|which (?:one|should i) first|what to (?:do|work on|focus on) first|focus on first|if (?:you|i) could only (?:finish|do|pick|choose) one|which would you choose|(?:two|three|four|five|several|a few|multiple) things(?:\s+(?:to|i need|on my plate))?|\d+ things(?:\s+(?:to|i need))?)\b/i;

const DECIDING_RE =
  /\b(?:what do you think|which would you|help me decide|choose between|can'?t decide|not sure which|should i .+ or .+|i need to make a decision|i don'?t know where to start with this decision|compare two options|i need help choosing)\b/i;

const THINKING_RE =
  /\b(?:help me think|thinking through|process(?:ing)? this|reflect on|figure out what|what am i missing|don'?t know where to start|not sure where to start)\b/i;

const EXPLICIT_PROJECT_RE =
  /\b(?:(?:create|start|make|build|add|open)\s+(?:a |an |the |my )?project|new project|project for|open (?:the )?projects?)\b/i;

const TASK_DUMP_ACTION_RE =
  /\b(finish|complete|create|build|make|write|set up|launch|develop|design|update|redo|practice|continue|prepare|send|post|draft)\b/i;

const CLEAR_EMOTIONAL_SIGNAL_RE =
  /\b(overwhelm(?:ed|ing)?|anxious|anxiety|exhausted|drained|feel(?:ing)? stuck|i'?m stuck\b|i am stuck\b|ashamed|discouraged|can'?t handle|panicking|panic(?:king)?|shutting down|feels? too hard|feel(?:ing)? frozen|defeated|hopeless|helpless|can'?t cope|breaking down|falling apart|stress(?:ed|ing)?|calm down|brain (?:is )?spinning|head (?:is )?spinning)\b/i;

/** Frustration about a problem — not necessarily emotional distress. */
const CONTEXTUAL_FRUSTRATION_RE =
  /\b(frustrat(?:ed|ing)?|annoying|difficult|irritating|driving me crazy|driving me nuts|makes me crazy|so annoying|pissing me off)\b/i;

/** Topic signals problem-solving, not emotional regulation. */
const PROBLEM_SOLVING_CONTEXT_RE =
  /\b(?:app|system|routing|logic|workflow|draft|drafts|code|coding|software|bug|debug|architecture|product|feature|companion|create|panel|chat|offer|launch|task|strategy|strateg|design|implementation|integration|api|ui|ux|doesn'?t work|not working|keeps? creating|can'?t get (?:it|the system)|won'?t do what|get the system)\b/i;

/** Genuine distress — not analytical frustration about a problem. */
const GENUINE_DISTRESS_RE =
  /\b(?:feel overwhelmed|i'?m overwhelmed|i feel overwhelmed|can'?t handle|can'?t cope|can'?t do this anymore|can'?t do this|breaking down|falling apart|shutting down|panicking|hopeless|helpless|feel(?:ing)? sick|might cry|want to cry|exhausted|anxious|ashamed)\b/i;

const EXPLICIT_EMOTIONAL_HELP_RE =
  /\b(?:help me (?:calm|breathe|ground|regulate)|need (?:to )?breathe|breathe and reset|emotional support|calm me down|ground me)\b/i;

export type FrustrationKind =
  | "emotional_distress"
  | "analytical"
  | "decision"
  | "creative"
  | "debugging"
  | "none";

const ORDINARY_TASK_LANGUAGE_RE =
  /\b(?:i\s+)?(?:need to|want to|have to|should)\s+(?:write|create|plan|finish|work on|make|draft|build|prepare)\b/i;

const PRACTICAL_UNCERTAINTY_RE =
  /\b(?:not sure|don'?t know|unsure|uncertain)\s+(?:what to|how to|which|where to)\b/i;

const PRACTICAL_TASK_FRICTION_RE =
  /\bstuck\s+on\s+(?:what to|how to)\b/i;

const CONTENT_BRAINSTORM_RE =
  /\b(?:what should i (?:write|post|say)|give me(?:\s+\w+){0,4}\s+ideas?|help me brainstorm|brainstorm(?:ing)?|what angle|what would resonate|i need ideas?|need(?:\s+\w+){0,3}\s+ideas?|want(?:\s+\w+){0,3}\s+ideas?|looking for(?:\s+\w+){0,3}\s+ideas?|ideas? for|ideas? (?:to|about|on)|ideas? to create|topic ideas?|post ideas?|content ideas?|(?:don'?t|do not) have (?:any\s+)?ideas?|no ideas?|not sure what to (?:write|say|post)|don'?t know what to (?:write|say|post)|what to write about|what should i post)\b/i;

const CONTENT_TYPE_MENTION_RE =
  /\b(?:facebook|fb|instagram|ig|linkedin|social media|twitter|tiktok|youtube|post|email|newsletter|blog|caption|script|sales page|landing page|proposal|content|message)\b/i;

const EXPLICIT_CREATE_RE =
  /\b(?:write it|draft it|draft one|create it|generate it|build (?:the |a )?(?:post|draft|email|script|content)|open create|start (?:the )?draft|start drafting|create draft|build draft|help me write (?:the|my|a )|make (?:the|my|a )|generate (?:the|my|a )|create the post|generate the post|draft the post|write the post)\b/i;

const EXPLICIT_CREATE_IMPERATIVE_RE =
  /^(?:please\s+)?(?:write|draft|create|generate|build)\s+(?:the|my|a|this|that)\b/i;

const EXPLICIT_CREATE_THE_RE =
  /\b(?:write|draft|create|generate)\s+(?:the|my|a|this)\s+(?:\w+\s+){0,2}(?:post|email|draft|script|content|proposal|newsletter|linkedin|message|copy|page)\b/i;

const CASUAL_RE =
  /^(?:hi|hey|hello|good morning|good afternoon|thanks|thank you|yo)\b/i;

export const SOMATIC_DISTRESS_RE =
  /\b(feel sick|feeling sick|nauseous|nauseated|throw up|might cry|want to cry|crying|tearful|body won'?t|catch(?:ing)? (?:my )?breath|can'?t catch (?:my )?breath|can'?t seem to relax|can'?t relax|breathless|can'?t breathe)\b/i;

/** Clear emotional signals — not ordinary task uncertainty or problem frustration. */
export function hasClearEmotionalSignal(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isContextualFrustrationOnly(t)) return false;
  if (isPracticalTaskFriction(t)) return false;
  if (/\bstuck\s+on\b/i.test(t)) return false;
  if (GENUINE_DISTRESS_RE.test(t) || SOMATIC_DISTRESS_RE.test(t)) return true;
  return CLEAR_EMOTIONAL_SIGNAL_RE.test(t);
}

export function isProblemSolvingContext(text: string): boolean {
  return PROBLEM_SOLVING_CONTEXT_RE.test(text.trim());
}

/** Frustration tied to a problem, decision, or task — not emotional regulation. */
export function isContextualFrustrationOnly(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (!CONTEXTUAL_FRUSTRATION_RE.test(t)) return false;
  if (GENUINE_DISTRESS_RE.test(t)) return false;
  if (isProblemSolvingContext(t)) return true;
  if (isDecidingConversation(t) || isPrioritizingConversation(t)) return true;
  if (
    /\b(?:because i (?:can'?t|don'?t)|don'?t know which|which .+ to (?:do|launch|pick|choose)|can'?t decide)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  return false;
}

export function isGenuineEmotionalDistress(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isContextualFrustrationOnly(t)) return false;
  return hasClearEmotionalSignal(t);
}

export function classifyFrustration(text: string): FrustrationKind {
  const t = text.trim();
  if (!t || !CONTEXTUAL_FRUSTRATION_RE.test(t)) {
    return isGenuineEmotionalDistress(t) ? "emotional_distress" : "none";
  }
  if (isGenuineEmotionalDistress(t)) return "emotional_distress";
  if (isDecidingConversation(t) || /\b(?:can'?t decide|which .+ to launch)\b/i.test(t)) {
    return "decision";
  }
  if (/\b(?:bug|debug|app|system|routing|code|software|doesn'?t work|not working)\b/i.test(t)) {
    return "debugging";
  }
  if (isProblemSolvingContext(t)) return "analytical";
  if (isContentBrainstorming(t) || isPracticalTaskFriction(t)) return "creative";
  if (isPrioritizingConversation(t)) return "decision";
  return "analytical";
}

/** Block Breathe, Clear My Mind triage, and other emotional tool cards. */
export function shouldSuppressEmotionalTools(text: string): boolean {
  if (EXPLICIT_EMOTIONAL_HELP_RE.test(text.trim())) return false;
  if (isGenuineEmotionalDistress(text)) return false;
  if (isContextualFrustrationOnly(text)) return true;
  if (isProblemSolvingContext(text) && CONTEXTUAL_FRUSTRATION_RE.test(text)) {
    return true;
  }
  if (
    CONTEXTUAL_FRUSTRATION_RE.test(text) &&
    (isDecidingConversation(text) || isPrioritizingConversation(text))
  ) {
    return true;
  }
  return false;
}

export function frustrationContextHintForChat(text: string): string | undefined {
  if (!shouldSuppressEmotionalTools(text)) return undefined;
  const kind = classifyFrustration(text);
  return (
    `TOPIC CONTEXT — PROBLEM-SOLVING (${kind} frustration): User is frustrated about a problem, not asking for emotional regulation — "${text.slice(0, 100)}". ` +
    `Stay in problem-solving or decision coaching. Do NOT use nervous system language, Breathe, or emotional triage. ` +
    `Do NOT say "that sounds heavy" or "carrying a lot". Help debug, decide, or simplify the actual problem.`
  );
}

export function isOrdinaryTaskLanguage(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (ORDINARY_TASK_LANGUAGE_RE.test(t)) return true;
  if (PRACTICAL_UNCERTAINTY_RE.test(t) && CONTENT_TYPE_MENTION_RE.test(t)) {
    return true;
  }
  return false;
}

export function isPracticalTaskFriction(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (PRACTICAL_TASK_FRICTION_RE.test(t)) return true;
  if (
    /\bstuck\b/i.test(t) &&
    CONTENT_TYPE_MENTION_RE.test(t) &&
    !hasClearEmotionalSignal(t)
  ) {
    return true;
  }
  return false;
}

/** Brainstorming / topic help — conversation only, not Create. */
export function isContentBrainstorming(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isExplicitCreationRequest(t)) return false;
  if (CONTENT_BRAINSTORM_RE.test(t)) return true;
  if (
    /\bideas?\s+to\s+create\b/i.test(t) &&
    /\b(?:post|email|content|caption|newsletter|script)\b/i.test(t)
  ) {
    return true;
  }
  if (
    ORDINARY_TASK_LANGUAGE_RE.test(t) &&
    PRACTICAL_UNCERTAINTY_RE.test(t) &&
    CONTENT_TYPE_MENTION_RE.test(t)
  ) {
    return true;
  }
  if (
    /\b(?:need|want)\s+(?:\w+\s+){0,3}?(?:ideas|help|options|direction|angles?)\b/i.test(
      t,
    ) &&
    CONTENT_TYPE_MENTION_RE.test(t)
  ) {
    return true;
  }
  return false;
}

/** Phase 3 — Discovery Mode: research, brainstorm, examples. Never field content. */
const WORKSPACE_DISCOVERY_RE =
  /\b(?:what do you think|give me examples?|what should i put(?: here)?|what goes here|what belongs here|what does research say|what (?:do|does) (?:the )?research say|help me brainstorm|brainstorm(?: with me)?|what would you (?:suggest|recommend)|what are some (?:ideas|examples|options)|can you (?:suggest|recommend|brainstorm|research)|research (?:this|what|how)|what (?:do|does) (?:people|research) say|need ideas|give me ideas|what should i (?:write|say)|show me (?:examples|options|ideas)|any examples|some examples|what kind of|what type of|what makes a good|help me think this through|help me write this|help me come up with|help me decide|tell me more|suggest options|yes[,.]?\s+help\s+me)\b/i;

const WORKSPACE_DISCOVERY_SHORT_RE =
  /^(?:what do you think|give me examples?|help me brainstorm|what should i put here|what goes here|what does research say|help me think this through|help me write this|help me come up with|help me decide|tell me more|suggest options|yes[,.]?\s+help\s+me)\.?\s*$/i;

export const WORKSPACE_DISCOVERY_APPROVAL_PROMPT =
  "Would you like me to add any of these?";

export type WorkspaceConversationMode =
  | "fieldContent"
  | "discovery"
  | "approval"
  | "navigation"
  | "conversation";

/**
 * Discovery Mode — user wants ideas, research, or examples beside an active field.
 * Content stays in chat until explicit approval.
 */
// isDiscoveryModeQuestion — Phase 3 Discovery Mode gate
export function isDiscoveryModeQuestion(text: string, lastAssistantText = ''): boolean {
  return isWorkspaceDiscoveryRequest(text, lastAssistantText);
}

export function isWorkspaceDiscoveryRequest(
  text: string,
  lastAssistantText = "",
): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isHelpSeekingAnswer(t)) return true;
  if (WORKSPACE_DISCOVERY_SHORT_RE.test(t)) return true;
  if (WORKSPACE_DISCOVERY_RE.test(t)) return true;
  if (isContentBrainstorming(t)) return true;
  if (isDecidingConversation(t) && (t.includes("?") || t.length <= 48)) {
    return true;
  }
  if (
    (t.includes("?") || /^(?:what|how|why|can you|could you|should i)\b/i.test(t)) &&
    /\b(?:example|examples|research|brainstorm|ideas?|options?|suggest|recommend|put here|goes here|what do you think|what should)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  void lastAssistantText;
  return false;
}

export function isWorkspaceApprovalPhrase(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return /^(?:yes|yep|yeah|yup|ok|okay|sure|sounds good|works for me|perfect|use that|use those|use these|add (?:them|these|those|it)|that one|let'?s do it|go ahead|these are good|those are good|add to (?:the )?(?:avatar|project|field))\.?$/i.test(
    t,
  );
}

export function classifyWorkspaceConversationMode(
  userText: string,
  lastAssistantText = "",
): WorkspaceConversationMode {
  const t = userText.trim();
  if (!t) return "conversation";
  if (/^(?:next|skip|done|back|continue|move on)\.?$/i.test(t)) return "navigation";
  if (isWorkspaceApprovalPhrase(t)) return "approval";
  if (isWorkspaceDiscoveryRequest(t, lastAssistantText)) return "discovery";
  if (
    t.length >= 3 &&
    !t.includes("?") &&
    !isContentBrainstorming(t) &&
    !isDecidingConversation(t) &&
    !WORKSPACE_DISCOVERY_RE.test(t)
  ) {
    return "fieldContent";
  }
  return "conversation";
}

/** Mandatory chat hint when Discovery Mode is active beside a workspace field. */
export function discoveryModeHintForChat(opts?: {
  fieldLabel?: string | null;
  researchCapable?: boolean;
}): string {
  const field = opts?.fieldLabel?.trim();
  const lines = [
    "WORKSPACE DISCOVERY MODE (mandatory — Phase 3):",
    "- User is researching, brainstorming, or asking for examples — NOT providing field content.",
    "- NEVER write their question into any workspace field.",
    "- NEVER use [[fill:field-id:value]] on this turn.",
    "- Generate options, examples, or brief research in chat only.",
    `- End with: "${WORKSPACE_DISCOVERY_APPROVAL_PROMPT}"`,
    "- Only after explicit approval (yes, use that, add these) apply the GENERATED content — never the approval phrase.",
    "- Then return to the same step and missing field.",
  ];
  if (field) {
    lines.push(`- Active field context: **${field}**.`);
  }
  if (opts?.researchCapable) {
    lines.push(
      "- RESEARCH WITH SHARI: You may summarize audience/market patterns or common struggles — still chat-only until they approve.",
    );
  }
  return lines.join("\n");
}

export function isExplicitProjectRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (EXPLICIT_PROJECT_RE.test(t)) return true;
  if (isExplicitWorkspaceOpenRequest(t) && /\bprojects?\b/i.test(t)) return true;
  return false;
}

/** User is weighing or listing work — coach in chat, do not route. */
export function isPrioritizingConversation(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (PRIORITIZING_RE.test(t)) return true;

  const clauses = t
    .split(/\band\b|,|;|\//i)
    .map((c) => c.trim())
    .filter((c) => c.length > 4);
  const actionClauses = clauses.filter((c) => TASK_DUMP_ACTION_RE.test(c));
  if (actionClauses.length >= 2) return true;
  if (clauses.length >= 3 && actionClauses.length >= 1) return true;

  if (
    /\bneed to\b/i.test(t) &&
    (t.match(/\band\b/gi)?.length ?? 0) >= 1 &&
    actionClauses.length >= 2
  ) {
    return true;
  }
  return false;
}

export function isDecidingConversation(text: string): boolean {
  return DECIDING_RE.test(text.trim());
}

export function isThinkingConversation(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (THINKING_RE.test(t)) return true;
  if (isExplicitCreationRequest(t) || isExplicitProjectRequest(t)) return false;
  const clauses = t
    .split(/,|;|\band\b/i)
    .map((c) => c.trim())
    .filter((c) => c.length > 4);
  return clauses.length >= 3;
}

export function classifyConversationalMode(text: string): ConversationalMode {
  const t = text.trim();
  if (!t) return "neutral";
  if (isExplicitProjectRequest(t)) return "executing";
  if (isExplicitCreationRequest(t)) return "creating";
  if (isContentBrainstorming(t)) return "brainstorming";
  if (isPrioritizingConversation(t)) return "prioritizing";
  if (isDecidingConversation(t)) return "deciding";
  if (isThinkingConversation(t)) return "thinking";
  return "neutral";
}

/** Categories 1–4: remain in conversation — no workflows, drafts, or pending cards. */
export function shouldStayConversationalOnly(text: string): boolean {
  if (isInformationIntent(text)) return true;
  const mode = classifyConversationalMode(text);
  return (
    mode === "thinking" ||
    mode === "deciding" ||
    mode === "brainstorming" ||
    mode === "prioritizing"
  );
}

const EXPLICIT_STRATEGY_OPEN_RE =
  /\bopen (?:my |the )?strateg(?:y|ies)\b/i;

const EXPLICIT_WRITE_IT_RE =
  /^(?:please\s+)?(?:write|draft|generate)\s+it\b/i;

/**
 * True only when the user explicitly asked to open a workspace or create output.
 * Companion speaks first for everything else (brainstorm, prioritize, vague create, asset discovery).
 */
export function shouldAutoOpenWorkspaceBeforeChat(text: string): boolean {
  if (isChatConversationOnlyMode()) return false;
  const t = text.trim();
  if (!t) return false;
  if (isInformationIntent(t)) return false;
  if (isExplicitCreationRequest(t)) return true;
  if (isExplicitProjectRequest(t)) return true;
  if (isExplicitWorkspaceOpenRequest(t)) return true;
  if (EXPLICIT_STRATEGY_OPEN_RE.test(t)) return true;
  if (EXPLICIT_WRITE_IT_RE.test(t)) return true;
  return false;
}

export function isExplicitCreationRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  const weakCreatePhrase =
    /\b(?:need to|want to|have to|should|i need to|i want to)\s+(?:write|draft|create|build|generate)\b/i.test(
      t,
    );
  if (weakCreatePhrase && !EXPLICIT_CREATE_IMPERATIVE_RE.test(t)) {
    return false;
  }
  if (EXPLICIT_CREATE_RE.test(t)) return true;
  if (EXPLICIT_CREATE_IMPERATIVE_RE.test(t)) return true;
  if (EXPLICIT_CREATE_THE_RE.test(t)) return true;
  if (/\bopen (?:the )?create\b/i.test(t)) return true;
  if (isExplicitWorkspaceOpenRequest(t) && /\bcreate\b/i.test(t)) return true;
  return false;
}

function hasConcreteTaskMention(text: string): boolean {
  return (
    CONTENT_TYPE_MENTION_RE.test(text) ||
    isOrdinaryTaskLanguage(text) ||
    isPracticalTaskFriction(text) ||
    isContentBrainstorming(text)
  );
}

export function classifyUserMessage(
  text: string,
  opts?: { workspaceOpen?: AppSection | null },
): MessageCategory {
  const t = text.trim();
  if (!t) return "casual_conversation";
  if (CASUAL_RE.test(t)) return "casual_conversation";
  if (opts?.workspaceOpen && isExplicitCreationRequest(t)) {
    return "active_workspace";
  }

  if (isContextualFrustrationOnly(t) || shouldSuppressEmotionalTools(t)) {
    return "practical_task";
  }

  const emotional = hasClearEmotionalSignal(t);
  const concreteTask = hasConcreteTaskMention(t);

  if (emotional && concreteTask) return "mixed_emotional_task";
  if (emotional) return "emotional_distress";
  if (concreteTask || isOrdinaryTaskLanguage(t) || isPracticalTaskFriction(t)) {
    return "practical_task";
  }

  return "casual_conversation";
}

export function shouldUseEmotionalReflection(category: MessageCategory): boolean {
  return (
    category === "emotional_distress" || category === "mixed_emotional_task"
  );
}

/**
 * Hard block for artifact pipeline — brainstorming/prioritizing/deciding/thinking
 * must never spawn Create, drafts, or handoffs unless the user explicitly asks to create.
 */
export function shouldBlockArtifactPipeline(text: string): boolean {
  if (isExplicitCreationRequest(text)) return false;
  if (isExplicitProjectRequest(text)) return false;
  if (isExplicitWorkspaceOpenRequest(text)) return false;
  if (isInformationIntent(text)) return true;
  if (shouldStayConversationalOnly(text)) return true;
  if (isContentBrainstorming(text)) return true;
  return false;
}

/** Block pending cards, Create bridges, and auto workspace routing. */
export function shouldSuppressWorkflowOutput(text: string): boolean {
  if (isExplicitCreationRequest(text)) return false;
  if (isExplicitProjectRequest(text)) return false;
  if (isExplicitWorkspaceOpenRequest(text)) return false;
  if (shouldStayConversationalOnly(text)) return true;
  const category = classifyUserMessage(text);
  if (
    category === "emotional_distress" ||
    category === "mixed_emotional_task"
  ) {
    return true;
  }
  if (isContentBrainstorming(text)) return true;
  if (isOrdinaryTaskLanguage(text)) return true;
  if (isPracticalTaskFriction(text)) return true;
  return false;
}

/** @deprecated Use shouldSuppressWorkflowOutput */
export function shouldSuppressCreatePending(text: string): boolean {
  return shouldSuppressWorkflowOutput(text);
}

/** True when emotional triage should run (pure distress, not problem frustration). */
export function shouldRunEmotionalTriage(text: string): boolean {
  if (shouldSuppressEmotionalTools(text)) return false;
  const category = classifyUserMessage(text);
  if (category === "practical_task" || category === "mixed_emotional_task") {
    return false;
  }
  if (category === "emotional_distress") return true;
  return isGenuineEmotionalDistress(text) && !isOrdinaryTaskLanguage(text);
}

/** User asked for sort / priority / reduce-scope help — intervention cards allowed. */
export function userExplicitlyRequestedInterventionHelp(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isPrioritizingConversation(t)) return true;
  return /\b(?:help me sort|help sort|sort (?:this|it|these|what)|reduce (?:this|scope|it)|help me reduc|help me prioritiz|pick one priority|park the rest)\b/i.test(
    t,
  );
}

/** No tool/action cards on the first turn of genuine emotional distress (Launch Test 3.1, 4.1). */
export function shouldDeferToolCardOnFirstDistress(
  messages: { role: string; content: string }[],
  text: string,
): boolean {
  const t = text.trim();
  if (!t) return false;
  if (userExplicitlyRequestedInterventionHelp(t)) return false;
  const category = classifyUserMessage(t);
  const distress =
    category === "emotional_distress" ||
    (category === "mixed_emotional_task" && isGenuineEmotionalDistress(t));
  if (!distress) return false;
  const priorDistressTurns = messages.filter(
    (m) =>
      m.role === "user" &&
      (classifyUserMessage(m.content) === "emotional_distress" ||
        (classifyUserMessage(m.content) === "mixed_emotional_task" &&
          isGenuineEmotionalDistress(m.content))),
  ).length;
  return priorDistressTurns <= 1;
}

const CHAT_TASK_LIST_RE =
  /\b(?:call|email|text|remember to|need to|todo|to-do)\b/i;

/** Chat-only task mentions are not saved to Clear My Mind (Constitution: Never Pretend Saved). */
export function clearMyMindTrustHintForChat(
  text: string,
  opts?: { brainDumpPanelOpen?: boolean },
): string | undefined {
  if (opts?.brainDumpPanelOpen) return undefined;
  const t = text.trim();
  if (!t || !CHAT_TASK_LIST_RE.test(t)) return undefined;
  if (isPrioritizingConversation(t) || shouldStayConversationalOnly(t)) {
    return (
      `CLEAR MY MIND TRUST: User listed tasks in chat for prioritizing — NOT saved yet. ` +
      `Do NOT say "I saved" or "captured". Help them think; offer Clear My Mind only if they want to capture.`
    );
  }
  return (
    `CLEAR MY MIND TRUST: Thoughts/tasks mentioned in chat are NOT saved unless entered in the Clear My Mind panel. ` +
    `Do NOT claim they were saved. Say "not saved yet" if relevant; offer to open Clear My Mind to capture.`
  );
}

export function conversationModeHintForChat(
  mode: ConversationalMode,
  text: string,
): string | undefined {
  if (mode === "neutral" || mode === "creating" || mode === "executing") {
    return undefined;
  }
  const base =
    `CONVERSATION MODE (VALID OUTCOME): User is ${mode} — "${text.slice(0, 100)}". ` +
    `Stay in conversation. Coaching, clarity, and one good question are enough. ` +
    `Do NOT open Create, Projects, documents, or workflows. ` +
    `Do NOT show pending cards or Open buttons. ` +
    `Do NOT convert this into a draft, project, or deliverable unless they explicitly ask.`;
  if (mode === "prioritizing") {
    return (
      `${base} Help them choose ONE focus — which creates relief, momentum, or unblocks the rest?`
    );
  }
  if (mode === "brainstorming") {
    return `${base} Offer angles or options in chat only. Do NOT put ideas into Create or draftContent. Ask "Would you like me to draft this?" before any draft — only open Create after they say yes/draft it/write it.`;
  }
  return base;
}

export function classificationHintForChat(
  category: MessageCategory,
  text: string,
): string | undefined {
  switch (category) {
    case "practical_task":
      return (
        `MESSAGE CLASSIFICATION — PRACTICAL TASK (no emotional analysis): User needs practical help — "${text.slice(0, 100)}". ` +
        `Do NOT say it sounds heavy, weighing on them, or that they're carrying a lot. Do NOT use "I sense…" therapy language. ` +
        `Use practical openers: "Let's make this simple", "Let's find the angle", offer 2–3 directions, ONE question. ` +
        `Do NOT open Create or offer Open/create pending cards unless they explicitly ask to write/draft/create it.`
      );
    case "mixed_emotional_task":
      return (
        `MESSAGE CLASSIFICATION — MIXED (brief emotion, then practical): User signaled emotion AND a task — "${text.slice(0, 100)}". ` +
        `One line acknowledging the feeling, then immediately lower friction with practical options. ` +
        `No tool/card on this turn. No "weighing on you" or "that sounds heavy" phrasing.`
      );
    case "emotional_distress":
      return (
        `MESSAGE CLASSIFICATION — EMOTIONAL DISTRESS: User signaled real distress — "${text.slice(0, 80)}". ` +
        `Brief empathy — different things help depending on what's causing the stress. ` +
        `Do NOT open or name a specific tool. Relief options appear in the UI below your message.`
      );
    default:
      return undefined;
  }
}
