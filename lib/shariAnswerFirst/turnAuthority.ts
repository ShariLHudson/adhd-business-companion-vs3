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
}): ConversationTurnAuthority {
  const t = input.userText.trim();
  const reasons: string[] = [];
  let breakHelpThread = false;

  const wantsCreateOrPrint = CREATE_OR_PRINT_RE.test(t);
  const dailyFocus = DAILY_FOCUS_RE.test(t);
  const emotionalOverload = EMOTIONAL_OVERLOAD_RE.test(t);
  const bareAck = BARE_ACK_RE.test(t);
  const checklistIntent = CHECKLIST_ACCEPT_RE.test(t);

  // Pending Create consent + bare ack → Create owns the turn (not relationship "ok").
  if (input.pendingCreateConsent && bareAck) {
    reasons.push("pending_create_consent_accept");
    const auth: ConversationTurnAuthority = {
      owner: "create_consent_accept",
      reasons,
      breakHelpThread: false,
      allowRelationshipLocal: false,
      allowFounderActionRecovery: false,
      allowFounderActionAccept: false,
      allowContinuityAdapt: false,
      allowLocalHowToFailsafeAsPrimary: false,
      preferCompanionChat: false,
    };
    logAuthority(auth, input.decision);
    return auth;
  }

  // Emotional overload pivots away from stuck how-to continuity.
  if (emotionalOverload && !input.decision.explicitNavigationRequested) {
    breakHelpThread = true;
    reasons.push("emotional_overload_breaks_help_thread");
    const auth: ConversationTurnAuthority = {
      owner: "overwhelm_frictionless",
      reasons,
      breakHelpThread: true,
      allowRelationshipLocal: false,
      allowFounderActionRecovery: false,
      allowFounderActionAccept: false,
      allowContinuityAdapt: false,
      allowLocalHowToFailsafeAsPrimary: false,
      preferCompanionChat: true, // frictionless may still offer; chat coaches if no offer
    };
    logAuthority(auth, input.decision);
    return auth;
  }

  // Daily focus must not replay stale founder playbook actions.
  if (dailyFocus) {
    breakHelpThread = Boolean(input.thread);
    reasons.push("daily_focus_owns_turn");
    const auth: ConversationTurnAuthority = {
      owner: "companion_chat",
      reasons,
      breakHelpThread,
      allowRelationshipLocal: false,
      allowFounderActionRecovery: false,
      allowFounderActionAccept: false,
      allowContinuityAdapt: false,
      allowLocalHowToFailsafeAsPrimary: false,
      preferCompanionChat: true,
    };
    logAuthority(auth, input.decision);
    return auth;
  }

  // Checklist / Create continuation after substantive help — not founder-action "yes".
  if (
    (checklistIntent || wantsCreateOrPrint) &&
    (input.isFollowUp || input.thread || /\bcreate\b/i.test(t))
  ) {
    reasons.push("create_or_artifact_continuation");
    // If they ask how to build in Create, chat teaches then offers — don't continuity-fill.
    const auth: ConversationTurnAuthority = {
      owner: wantsCreateOrPrint && /\bin create\b/i.test(t)
        ? "companion_chat"
        : "companion_chat",
      reasons,
      breakHelpThread: false,
      allowRelationshipLocal: false,
      allowFounderActionRecovery: false,
      allowFounderActionAccept: !(checklistIntent || wantsCreateOrPrint),
      allowContinuityAdapt: false,
      allowLocalHowToFailsafeAsPrimary: false,
      preferCompanionChat: true,
    };
    // Bare "yes" + checklist language: block founder accept
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
    const auth: ConversationTurnAuthority = {
      owner: "companion_chat",
      reasons,
      breakHelpThread: false,
      allowRelationshipLocal: false,
      allowFounderActionRecovery: false,
      allowFounderActionAccept: !input.hasCurrentFounderAction || !bareAck,
      allowContinuityAdapt:
        input.isFollowUp &&
        !wantsCreateOrPrint &&
        !dailyFocus &&
        !emotionalOverload &&
        // Continuity adapt only for short same-topic refinements — not "never used app" depth asks
        t.split(/\s+/).length <= 18 &&
        !/\b(?:detailed|step by step|never (?:used|done)|from start to finish|what (?:are|do) (?:all )?(?:the )?tools)\b/i.test(
          t,
        ),
      allowLocalHowToFailsafeAsPrimary: false,
      preferCompanionChat: true,
    };
    logAuthority(auth, input.decision);
    return auth;
  }

  // Reflective / coach
  if (
    input.decision.primaryHelpMode === "reflective_thinking" ||
    input.primaryRole === "coach"
  ) {
    reasons.push("coaching_turn");
    const auth: ConversationTurnAuthority = {
      owner: "companion_chat",
      reasons,
      breakHelpThread: true,
      allowRelationshipLocal: false,
      allowFounderActionRecovery: false,
      allowFounderActionAccept: false,
      allowContinuityAdapt: false,
      allowLocalHowToFailsafeAsPrimary: false,
      preferCompanionChat: true,
    };
    logAuthority(auth, input.decision);
    return auth;
  }

  // Default: companion chat; suppress the known thieves.
  reasons.push("default_companion_chat");
  const auth: ConversationTurnAuthority = {
    owner: "companion_chat",
    reasons,
    breakHelpThread: false,
    allowRelationshipLocal: !input.pendingCreateConsent && !input.thread,
    allowFounderActionRecovery: !input.thread && !input.decision.directAnswerRequired,
    allowFounderActionAccept:
      input.hasCurrentFounderAction && bareAck && !checklistIntent,
    allowContinuityAdapt: false,
    allowLocalHowToFailsafeAsPrimary: false,
    preferCompanionChat: true,
  };
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
    breakHelpThread: auth.breakHelpThread,
    allowContinuity: auth.allowContinuityAdapt,
    allowLocalHowTo: auth.allowLocalHowToFailsafeAsPrimary,
    allowFounderRecovery: auth.allowFounderActionRecovery,
    allowRelationship: auth.allowRelationshipLocal,
    reasons: auth.reasons.slice(0, 3).join("|"),
  });
}
