/**
 * Authoritative conversation turn ownership.
 *
 * One decision owns each turn. Competing early-return modules must consult
 * this gate before writing an assistant message or navigating.
 *
 * Does not invent content — only assigns ownership and suppressions.
 */

import type { ShariResponseDecision } from "./types";
import type { ShariConversationThread } from "./conversationContinuity";
import type { ShariProfessionalRole } from "./professionalRoles";
import { trackShariAnswerFirstEvent } from "./observability";

export type ConversationTurnOwner =
  | "companion_chat"
  | "create_consent_accept"
  | "create_execution"
  | "relationship_local"
  | "founder_action_recovery"
  | "founder_action_accept"
  | "continuity_adapt"
  | "local_howto_failsafe"
  | "overwhelm_frictionless"
  | "social_greeting";

export type ConversationTurnAuthority = {
  owner: ConversationTurnOwner;
  reasons: string[];
  /** When true, ignore help-thread for this turn (topic/emotion shift). */
  breakHelpThread: boolean;
  allowRelationshipLocal: boolean;
  allowFounderActionRecovery: boolean;
  allowFounderActionAccept: boolean;
  allowContinuityAdapt: boolean;
  /** Local topic failsafe may only run as last-resort repair — never primary. */
  allowLocalHowToFailsafeAsPrimary: boolean;
  preferCompanionChat: boolean;
  /** Collection / Evidence Vault / optional emotional destinations. */
  allowEmotionalDestinationOffer: boolean;
  /** Overwhelm frictionless may open Clear My Mind etc. */
  allowOverwhelmFrictionless: boolean;
  /**
   * When true, Create / Universal Creation may present the turn
   * (draft or one blocking question). Must stay true for create owners —
   * never suppress the create presenter with emotional-destination blocks.
   */
  allowCreatePresentation: boolean;
  /** Response mode hint for instrumentation — not content. */
  responseMode:
    | "execution"
    | "discovery"
    | "repair"
    | "advisory"
    | "companion";
};

const CREATE_OR_PRINT_RE =
  /\b(?:create|print|process format|sop|checklist|document|in create|build (?:it|this|that) in create|put (?:it|this) (?:into|in) (?:a |the )?process)\b/i;

const DAILY_FOCUS_RE =
  /\b(?:what should i (?:work on|focus on|do)(?: today)?|what to work on today|help me (?:prioritize|plan)(?: my day)?)\b/i;

const EMOTIONAL_OVERLOAD_RE =
  /\b(?:frustrated|overwhelm(?:ed)?|too much on my mind|ton on my mind|bunch on my mind|a lot on my mind|can't think|brain dump|clear my mind)\b/i;

const BARE_ACK_RE =
  /^(?:ok|okay|yes|yep|yeah|sure|k|alright)[\s!.,?]*$/i;

const CHECKLIST_ACCEPT_RE =
  /\b(?:checklist|turn (?:this|it) into|make (?:this|it) a|process format|print)\b/i;

function baseAuth(
  owner: ConversationTurnOwner,
  reasons: string[],
  overrides: Partial<ConversationTurnAuthority> = {},
): ConversationTurnAuthority {
  const createOwner =
    owner === "create_execution" || owner === "create_consent_accept";
  return {
    owner,
    reasons,
    breakHelpThread: false,
    allowRelationshipLocal: false,
    allowFounderActionRecovery: false,
    allowFounderActionAccept: false,
    allowContinuityAdapt: false,
    allowLocalHowToFailsafeAsPrimary: false,
    preferCompanionChat: true,
    allowEmotionalDestinationOffer: false,
    allowOverwhelmFrictionless: false,
    allowCreatePresentation: createOwner,
    responseMode: createOwner ? "execution" : "companion",
    ...overrides,
  };
}

/**
 * Decide which module may own this turn.
 */
export function decideConversationTurnAuthority(input: {
  userText: string;
  decision: ShariResponseDecision;
  isFollowUp: boolean;
  thread: ShariConversationThread | null;
  primaryRole: ShariProfessionalRole;
  pendingCreateConsent: boolean;
  hasCurrentFounderAction: boolean;
  /** Live Universal Creation / Create discovery session. */
  activeCreateSession?: boolean;
}): ConversationTurnAuthority {
  const t = input.userText.trim();
  const reasons: string[] = [];
  let breakHelpThread = false;

  const wantsCreateOrPrint = CREATE_OR_PRINT_RE.test(t);
  const dailyFocus = DAILY_FOCUS_RE.test(t);
  const emotionalOverload = EMOTIONAL_OVERLOAD_RE.test(t);
  const bareAck = BARE_ACK_RE.test(t);
  const checklistIntent = CHECKLIST_ACCEPT_RE.test(t);
  const explicitCreate =
    input.decision.explicitCreationRequested ||
    Boolean(input.activeCreateSession);

  // Pending Create consent + bare ack → Create owns the turn (not relationship "ok").
  if (input.pendingCreateConsent && bareAck) {
    reasons.push("pending_create_consent_accept");
    const auth = baseAuth("create_consent_accept", reasons, {
      preferCompanionChat: false,
    });
    logAuthority(auth, input.decision);
    return auth;
  }

  // Explicit create / active Create session owns the turn.
  // Overwhelm may soften tone, but must not steal execution or open optional destinations.
  if (explicitCreate) {
    reasons.push(
      input.activeCreateSession
        ? "active_create_session_owns_turn"
        : "explicit_creation_owns_turn",
    );
    const auth = baseAuth("create_execution", reasons, {
      preferCompanionChat: false,
      breakHelpThread: false,
      allowCreatePresentation: true,
      allowEmotionalDestinationOffer: false,
      allowOverwhelmFrictionless: false,
      responseMode: "execution",
    });
    logAuthority(auth, input.decision);
    return auth;
  }

  // Emotional overload pivots away from stuck how-to continuity — never past explicit create.
  if (
    emotionalOverload &&
    !input.decision.explicitNavigationRequested &&
    !input.decision.explicitCreationRequested
  ) {
    breakHelpThread = true;
    reasons.push("emotional_overload_breaks_help_thread");
    const auth = baseAuth("overwhelm_frictionless", reasons, {
      breakHelpThread: true,
      preferCompanionChat: true,
      allowOverwhelmFrictionless: true,
      allowEmotionalDestinationOffer: true,
      allowCreatePresentation: false,
      responseMode: "advisory",
    });
    logAuthority(auth, input.decision);
    return auth;
  }

  // Daily focus must not replay stale founder playbook actions.
  if (dailyFocus) {
    breakHelpThread = Boolean(input.thread);
    reasons.push("daily_focus_owns_turn");
    const auth = baseAuth("companion_chat", reasons, {
      breakHelpThread,
      allowEmotionalDestinationOffer: true,
      allowOverwhelmFrictionless: true,
    });
    logAuthority(auth, input.decision);
    return auth;
  }

  // Checklist / Create continuation after substantive help — not founder-action "yes".
  if (
    (checklistIntent || wantsCreateOrPrint) &&
    (input.isFollowUp || input.thread || /\bcreate\b/i.test(t))
  ) {
    reasons.push("create_or_artifact_continuation");
    const auth = baseAuth("companion_chat", reasons, {
      allowFounderActionAccept: !(checklistIntent || wantsCreateOrPrint),
    });
    if (checklistIntent) {
      auth.allowFounderActionAccept = false;
      reasons.push("suppress_founder_accept_for_checklist");
    }
    logAuthority(auth, input.decision);
    return auth;
  }

  // How-to / teach / advise: companion-chat owns. Local failsafe is never primary.
  if (
    input.decision.directAnswerRequired ||
    input.decision.primaryHelpMode === "how_to_guidance" ||
    input.decision.primaryHelpMode === "troubleshooting" ||
    input.decision.primaryHelpMode === "advice"
  ) {
    reasons.push("substantive_help_requires_companion_chat");
    const auth = baseAuth("companion_chat", reasons, {
      allowFounderActionAccept: !input.hasCurrentFounderAction || !bareAck,
      allowContinuityAdapt:
        input.isFollowUp &&
        !wantsCreateOrPrint &&
        !dailyFocus &&
        !emotionalOverload &&
        t.split(/\s+/).length <= 18 &&
        !/\b(?:detailed|step by step|never (?:used|done)|from start to finish|what (?:are|do) (?:all )?(?:the )?tools)\b/i.test(
          t,
        ),
      allowEmotionalDestinationOffer: true,
      allowOverwhelmFrictionless: !emotionalOverload,
    });
    logAuthority(auth, input.decision);
    return auth;
  }

  // Reflective / coach
  if (
    input.decision.primaryHelpMode === "reflective_thinking" ||
    input.primaryRole === "coach"
  ) {
    reasons.push("coaching_turn");
    const auth = baseAuth("companion_chat", reasons, {
      breakHelpThread: true,
      allowEmotionalDestinationOffer: true,
      allowOverwhelmFrictionless: true,
    });
    logAuthority(auth, input.decision);
    return auth;
  }

  // Default: companion chat; suppress the known thieves.
  reasons.push("default_companion_chat");
  const auth = baseAuth("companion_chat", reasons, {
    allowRelationshipLocal: !input.pendingCreateConsent && !input.thread,
    allowFounderActionRecovery:
      !input.thread && !input.decision.directAnswerRequired,
    allowFounderActionAccept:
      input.hasCurrentFounderAction && bareAck && !checklistIntent,
    allowEmotionalDestinationOffer: true,
    allowOverwhelmFrictionless: true,
  });
  logAuthority(auth, input.decision);
  return auth;
}

function logAuthority(
  auth: ConversationTurnAuthority,
  decision: ShariResponseDecision,
): void {
  trackShariAnswerFirstEvent("turn_authority", {
    owner: auth.owner,
    mode: decision.primaryHelpMode,
    responseMode: auth.responseMode,
    breakHelpThread: auth.breakHelpThread,
    allowContinuity: auth.allowContinuityAdapt,
    allowLocalHowTo: auth.allowLocalHowToFailsafeAsPrimary,
    allowFounderRecovery: auth.allowFounderActionRecovery,
    allowRelationship: auth.allowRelationshipLocal,
    allowCreatePresentation: auth.allowCreatePresentation,
    allowEmotionalDestinationOffer: auth.allowEmotionalDestinationOffer,
    reasons: auth.reasons.slice(0, 3).join("|"),
  });
}
