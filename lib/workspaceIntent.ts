// Conversational intent — classify before saving or acting.
// Only `fieldContent` may populate project fields.

import type { AppSection } from "./companionUi";
import {
  isExplicitProjectRequest,
  isWorkspaceDiscoveryRequest,
  shouldStayConversationalOnly,
} from "./messageClassification";
import type { WorkspaceFieldId } from "./workspaceAwareness";
import {
  parseOptionSelection,
  type SopStepId,
  type WorkspaceSession,
} from "./workspaceSop";
import { getEffectiveSuggestionCount } from "./workspaceSuggestion";
import {
  isBuilderAddCommand,
  isBuilderApprovalPhrase,
} from "./builderContentSync";

export type WorkspaceIntent =
  | "conversation"
  | "workspaceAction"
  | "resumeRequest"
  | "projectLookup"
  | "reviewRequest"
  | "helpRequest"
  | "fieldContent"
  | "navigation"
  | "confirmation"
  | "feedback"
  | "clarification"
  | "discovery";

export type ClassifiedWorkspaceIntent = {
  intent: WorkspaceIntent;
  projectQuery?: string;
  reviewStepId?: SopStepId;
  reviewFieldId?: WorkspaceFieldId;
  workspaceSection?: AppSection;
};

export type ClassifyWorkspaceIntentOptions = {
  session?: WorkspaceSession | null;
};

const NAVIGATION_RE =
  /^(?:next|continue|move on|go on|skip|done|finished|go ahead|keep going|back)\.?$/i;

const WHATS_NEXT_NAV_RE = /^what'?s next\.?$/i;

const CONFIRMATION_RE =
  /^(?:yes|yep|yeah|yup|ok(?:ay)?|sure|sounds good|works for me|perfect|i like it|that'?s good|that'?s fine|that works|looks good|correct|right|good|that one|use that|let'?s do it|please do|go ahead)\.?$/i;

const FEEDBACK_RE =
  /\b(?:that'?s confusing|that is confusing|this is confusing|i don'?t like (?:that|it|this)|that isn'?t (?:what i meant|right)|that is not (?:what i meant|right)|not right|doesn'?t make sense|that'?s wrong|this is wrong|this isn'?t working|isn'?t working|where did it go)\b/i;

const CLARIFICATION_RE =
  /\b(?:i don'?t understand(?: what)?|don'?t understand what (?:this|that) is for|can you explain|could you explain|please explain|explain (?:this|it|what)|what is this (?:section|field|step|part)|what does this (?:section|field|step|part)|what does .+ mean|what'?s this (?:for|field|section|step)|how am i supposed to use|why are we doing|what am i supposed to put|what i'?m supposed to put|what should i put here|what goes here|what does this mean|slow (?:this )?down|can you slow)\b/i;

const HELP_RE =
  /\b(?:i don'?t know what to call it|i don'?t know(?:\s+what to (?:call|name) it)?|help me (?:name|title|call|write|decide|figure|improve|determine|find|identify|list|research|brainstorm)|what should i call|need help figuring out|i'?m not sure what|can you help me decide|give me ideas|give me examples|can you give me (?:better )?(?:title )?ideas|better title ideas|suggest(?: some)? titles?|what would be a good outcome|help me write|help me with|help me figure|what should the outcome|what should i name|suggest ideas|help me figure this out|what should this be|make it more|curiosity.driven|more engaging)\b/i;

const RESEARCH_REQUEST_RE =
  /\b(?:research|determine the|top \d+|biggest challenges|common challenges|what (?:are|do) people struggle|symptoms?|struggling with most)\b/i;

const APPLY_SELECTION_RE =
  /\b(?:let'?s use|use (?:those|all of those|them all|that)|go with (?:those|them|all)|add (?:those|them) to)\b/i;

const RETURN_TO_TOPIC_RE =
  /\b(?:back to|return to|let'?s get back to|okay,?\s*back to)\b/i;

/** Return to the content topic — not SOP step navigation (go back to title). */
function isReturnToContentTopic(text: string): boolean {
  if (!RETURN_TO_TOPIC_RE.test(text.trim())) return false;
  return !isGoBackToStepRequest(text);
}

const CONVERSATION_RE =
  /\b(?:i feel stuck|feel stuck|changed my mind|don'?t know if (?:this|it) is right|i'?m not sure (?:this|the) title|not sure (?:this|the|my) title|title (?:isn'?t|is not) right|i'?m confused|i'?m overwhelmed|feel overwhelmed|this feels like too much|feels like too much|too much to|we already did|already did the|already finished|already completed|what have we already done|what we'?ve already done|where are we in|what comes next|first few steps|not sure if|second thoughts|this is hard)\b/i;

const GO_BACK_STEP_RE =
  /\bgo back to (?:the )?(title|outcome|audience|sections|problem|story|exercise|offer)\b/i;

const RESUME_RE =
  /\b(?:continue where i left off|pick up where i (?:left off|were)|resume my workshop|back to my workshop|continue my workshop|continue working on my workshop|keep working on this|go back to what we were doing|let'?s pick up where we were|open my workshop|open the workshop|where i left off)\b/i;

const WORKSPACE_ACTION_RE =
  /\b(?:open (?:my )?project|open (?:the )?workshop(?: builder)?|take me to (?:the )?project|show me (?:the )?workspace|open create|open projects(?:\s+now)?)\b/i;

export const CREATE_RESUME_RE =
  /\b(?:open create|open content builder|content builder|show (?:me )?my (?:draft|proposal)|where(?:'s| is) my (?:draft|proposal)|find my (?:draft|proposal)|continue (?:working on |with )?(?:this|my (?:draft|proposal))|bring back (?:my )?(?:draft|proposal)|open my (?:draft|proposal)|what do i have open|what'?s open)\b/i;

export function isCreateResumeRequest(text: string): boolean {
  return CREATE_RESUME_RE.test(text.trim());
}

const PROJECT_LOOKUP_RE =
  /\b(?:where (?:is|did) (?:my )?(?:project|workshop)|where did my (?:project|workshop) go|find my (?:project|workshop)|show me my .+ project|want to work on|work on (?:my )?|looking for my (?:project|workshop)|continue (?:with )?(?:my )?)\b/i;

const REVIEW_TITLE_RE =
  /\b(?:review my title|check my title|see my title|edit my title|look at my title|make (?:the|my) title stronger|improve (?:the|my) title)\b/i;

const REVIEW_OUTCOME_RE =
  /\b(?:review (?:my )?outcome|check (?:my )?outcome|edit (?:my )?outcome|look at (?:my )?outcome|improve (?:the|my) outcome)\b/i;

const REVIEW_AUDIENCE_RE =
  /\b(?:review (?:my )?audience|check (?:my )?audience|help me improve (?:the|my) audience|look at (?:my )?audience)\b/i;

const REVIEW_SECTIONS_RE =
  /\b(?:review (?:my )?sections|check (?:my )?sections|look at (?:my )?sections|help (?:me )?with sections)\b/i;

const QUESTION_START_RE =
  /^(?:where|what|why|how|when|who|which|did|is|are|was|were|can|could|should|would|will|has|have|do|does|am)\b/i;

const QUESTION_PHRASE_RE =
  /\b(?:what happened|why did|what is next|where is my|where'?s my|what'?s next|where did my|why did my|how do i find|can you see my)\b/i;

const NON_CONTENT_SHORT_RE =
  /^(?:next|yes|yep|yeah|yup|ok|okay|sure|skip|done|finished|continue|move on|perfect|good|right|correct)$/i;

function assistantInvitedFieldInput(lastAssistantText: string): boolean {
  return /\b(?:what (?:are you calling|should we call)|one sentence|type (?:the|your)|which one feels|tell me what you'd like|in the (?:title|outcome) field|pick one|say \*\*number)\b/i.test(
    lastAssistantText,
  );
}

export function isClarificationRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (/\b(?:where.*project|project.*go|find my)\b/i.test(t)) return false;
  if (GO_BACK_STEP_RE.test(t)) return false;
  if (CLARIFICATION_RE.test(t)) return true;
  return (
    (t.includes("?") || QUESTION_START_RE.test(t)) &&
    /\b(?:explain|understand|mean|this for|this section|this field|this step|supposed to put|why are we|what is this|what does this)\b/i.test(
      t,
    )
  );
}

export function isGoBackToStepRequest(text: string): boolean {
  return GO_BACK_STEP_RE.test(text.trim());
}

export function isProgressQuestion(text: string): boolean {
  return /\b(?:what have we already done|what we'?ve already done|where are we in the process|where are we in|what comes next)\b/i.test(
    text.trim(),
  );
}

function assistantInvitedNext(lastAssistantText: string): boolean {
  return /\b(?:tap next|hit next|press next|tell me and we(?:'ll| will) do the outcome|when that looks right)\b/i.test(
    lastAssistantText,
  );
}

/** Extract a project name hint from natural language. */
export function extractProjectQuery(text: string): string | null {
  const t = text.trim();
  const patterns = [
    /\b(?:work on|open|find|show me|looking for|continue with) (?:my )?(.+?)\s+project\b/i,
    /\b(?:want to )?work on (?:my )?(.+?)$/i,
    /\b(?:my|the) (.+?)\s+project\b/i,
    /\bproject (?:called|named)\s+["']?([^"']+)["']?\b/i,
    /\bworkshop (?:called|named)\s+["']?([^"']+)["']?\b/i,
  ];
  for (const p of patterns) {
    const m = t.match(p);
    if (m?.[1]?.trim()) {
      const q = m[1]
        .trim()
        .replace(/\s+(?:project|workshop)$/i, "")
        .trim();
      if (q.length >= 2) return q;
    }
  }
  if (/\bspinner\b/i.test(t)) return "spinner";
  return null;
}

/** True when the user is asking for knowledge — answer in chat, never in fields. */
export function isKnowledgeQuestion(text: string): boolean {
  const t = text.trim();
  if (isProgressQuestion(t)) return false;
  if (RESEARCH_REQUEST_RE.test(t) || HELP_RE.test(t)) return true;
  if (!t.includes("?") && !QUESTION_START_RE.test(t)) return false;
  if (
    /\b(?:where.*project|project.*go|my title|my outcome|my audience|workshop builder|next step|in the panel)\b/i.test(
      t,
    )
  ) {
    return false;
  }
  return (
    t.length > 12 ||
    /\b(?:what are|what is|what makes|what should|how do|how can|why do|biggest|challenges|examples?|explain|good)\b/i.test(
      t,
    )
  );
}

function looksLikeFieldContent(
  t: string,
  lastAssistantText: string,
  session?: WorkspaceSession | null,
): boolean {
  const suggestionCount = getEffectiveSuggestionCount(session, lastAssistantText);
  if (suggestionCount >= 1 && parseOptionSelection(t, suggestionCount) !== null) {
    return false;
  }
  if (t.length < 2 || NON_CONTENT_SHORT_RE.test(t)) return false;
  if (isBuilderApprovalPhrase(t) || isBuilderAddCommand(t)) return false;
  if (isWorkspaceDiscoveryRequest(t, lastAssistantText)) return false;
  if (/\?/.test(t)) return false;
  if (
    QUESTION_START_RE.test(t) ||
    HELP_RE.test(t) ||
    CONVERSATION_RE.test(t) ||
    FEEDBACK_RE.test(t)
  ) {
    return false;
  }
  if (RESEARCH_REQUEST_RE.test(t) || APPLY_SELECTION_RE.test(t)) return false;
  if (assistantInvitedFieldInput(lastAssistantText)) return true;
  if (
    t.length >= 3 &&
    t.length <= 80 &&
    !/\b(?:i |we |my |don't|can't|feel|help|stuck|confused|where|what|research|determine)\b/i.test(t)
  ) {
    return true;
  }
  return false;
}

/** Classify user message before any field write or workspace action. */
export function classifyWorkspaceIntent(
  userText: string,
  lastAssistantText = "",
  opts?: ClassifyWorkspaceIntentOptions,
): ClassifiedWorkspaceIntent {
  const t = userText.trim();
  if (!t) return { intent: "conversation" };

  const session = opts?.session ?? null;
  const inWorkspaceCoach = Boolean(session);

  if (isWorkspaceDiscoveryRequest(t, lastAssistantText)) {
    return { intent: "discovery" };
  }

  if (
    !inWorkspaceCoach &&
    shouldStayConversationalOnly(t) &&
    !isExplicitProjectRequest(t) &&
    !WORKSPACE_ACTION_RE.test(t)
  ) {
    return { intent: "conversation" };
  }
  const suggestionCount = getEffectiveSuggestionCount(session, lastAssistantText);

  // 1. Pending suggestion selection — never field content
  if (suggestionCount >= 1 && parseOptionSelection(t, suggestionCount) !== null) {
    return { intent: "confirmation" };
  }

  // 2. Navigation
  if (
    NAVIGATION_RE.test(t) ||
    WHATS_NEXT_NAV_RE.test(t) ||
    (assistantInvitedNext(lastAssistantText) && /^next\.?$/i.test(t))
  ) {
    return { intent: "navigation" };
  }

  // 3. Workspace actions (resume / open)
  if (RESUME_RE.test(t)) {
    return { intent: "resumeRequest" };
  }

  if (isCreateResumeRequest(t)) {
    return {
      intent: "workspaceAction",
      workspaceSection: "content-generator",
    };
  }

  if (WORKSPACE_ACTION_RE.test(t)) {
    return {
      intent: "workspaceAction",
      workspaceSection: /\bcreate\b/i.test(t) ? "content-generator" : "projects",
    };
  }

  // Research / apply-selection — discovery-adjacent
  if (RESEARCH_REQUEST_RE.test(t) || APPLY_SELECTION_RE.test(t)) {
    return { intent: "discovery" };
  }

  if (isReturnToContentTopic(t)) {
    return { intent: "conversation" };
  }

  // Help (naming, phrasing) — coach or API, not silent field writes
  if (HELP_RE.test(t)) {
    return { intent: "helpRequest" };
  }

  // Review
  if (REVIEW_TITLE_RE.test(t)) {
    return {
      intent: "reviewRequest",
      reviewStepId: "workshop-title",
      reviewFieldId: "project-title",
    };
  }

  if (REVIEW_OUTCOME_RE.test(t)) {
    return {
      intent: "reviewRequest",
      reviewStepId: "workshop-outcome",
      reviewFieldId: "project-goal",
    };
  }

  if (REVIEW_AUDIENCE_RE.test(t)) {
    return {
      intent: "reviewRequest",
      reviewStepId: "workshop-audience",
      reviewFieldId: "workshop-audience",
    };
  }

  if (REVIEW_SECTIONS_RE.test(t)) {
    return {
      intent: "reviewRequest",
      reviewStepId: "workshop-sections",
      reviewFieldId: "workshop-sections",
    };
  }

  // 6. Project lookup — explicit only; never during prioritizing/thinking
  if (
    PROJECT_LOOKUP_RE.test(t) &&
    !shouldStayConversationalOnly(t) &&
    (isExplicitProjectRequest(t) ||
      /\b(?:where (?:is|did)|find my|show me my|looking for my)\b/i.test(t))
  ) {
    return {
      intent: "projectLookup",
      projectQuery: extractProjectQuery(t) ?? undefined,
    };
  }

  // 7. Feedback
  if (FEEDBACK_RE.test(t)) {
    return { intent: "feedback" };
  }

  // 7b. Clarification — explain current step, never field content
  if (isClarificationRequest(t)) {
    return { intent: "clarification" };
  }

  // Generic yes/no confirmation (after suggestion picks)
  if (CONFIRMATION_RE.test(t)) {
    return { intent: "confirmation" };
  }

  if (isGoBackToStepRequest(t)) {
    return { intent: "navigation" };
  }

  if (CONVERSATION_RE.test(t) || isProgressQuestion(t)) {
    return { intent: "conversation" };
  }

  if (QUESTION_START_RE.test(t) || QUESTION_PHRASE_RE.test(t) || t.includes("?")) {
    if (
      /\b(?:where.*project|project.*go|find my|lost my)\b/i.test(t) &&
      !shouldStayConversationalOnly(t)
    ) {
      return {
        intent: "projectLookup",
        projectQuery: extractProjectQuery(t) ?? undefined,
      };
    }
    return { intent: "conversation" };
  }

  // 8. Field content — only when not a suggestion pick
  if (looksLikeFieldContent(t, lastAssistantText, session)) {
    return { intent: "fieldContent" };
  }

  return { intent: "conversation" };
}

/** Only field content may be written into workspace fields. */
export function isFieldContentIntent(
  userText: string,
  lastAssistantText = "",
  opts?: ClassifyWorkspaceIntentOptions,
): boolean {
  return (
    classifyWorkspaceIntent(userText, lastAssistantText, opts).intent ===
    "fieldContent"
  );
}

/** @deprecated Use classifyWorkspaceIntent */
export type WorkspaceMessageClass =
  | "projectContent"
  | "question"
  | "helpRequest"
  | "navigation"
  | "confirmation"
  | "feedback";

export function classifyWorkspaceMessage(
  userText: string,
  lastAssistantText = "",
  opts?: ClassifyWorkspaceIntentOptions,
): WorkspaceMessageClass {
  const { intent } = classifyWorkspaceIntent(userText, lastAssistantText, opts);
  switch (intent) {
    case "fieldContent":
      return "projectContent";
    case "helpRequest":
      return "helpRequest";
    case "discovery":
      return "question";
    case "navigation":
      return "navigation";
    case "confirmation":
      return "confirmation";
    case "feedback":
    case "clarification":
      return "feedback";
    default:
      return "question";
  }
}

export function isProjectContent(
  userText: string,
  lastAssistantText = "",
  opts?: ClassifyWorkspaceIntentOptions,
): boolean {
  return isFieldContentIntent(userText, lastAssistantText, opts);
}

export function isDiscoveryIntent(
  userText: string,
  lastAssistantText = "",
  opts?: ClassifyWorkspaceIntentOptions,
): boolean {
  return (
    classifyWorkspaceIntent(userText, lastAssistantText, opts).intent ===
    "discovery"
  );
}

export function isHelpRequest(text: string): boolean {
  return classifyWorkspaceIntent(text).intent === "helpRequest";
}
