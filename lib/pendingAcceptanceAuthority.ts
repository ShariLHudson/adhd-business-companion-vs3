/**
 * Trust Sprint #1 — Phase D: acceptance authority.
 * Generic yes/sure/okay only works with a valid, non-expired pending action.
 */

import { isActionAcceptance } from "./assistedActionBridge";
import type { AppSection } from "./companionUi";
import type { PendingCreateOpenPayload } from "./createOpenAuthority";
import {
  matchesPendingAcceptance,
  type PendingAction,
} from "./pendingAction";
import { shouldAutoLaunchPendingAction } from "./companionAutoLaunch";

/** Generic affirmations that must not act without pending context. */
export const GENERIC_ACCEPTANCE_RE =
  /^(?:yes|yep|yeah|yup|ok(?:ay)?|sure|sounds good|works for me|perfect|i like it|that'?s good|that'?s fine|that works|looks good|correct|right|good|that one|use that|let'?s do it|please do|go ahead|proceed|count me in|let'?s go)\.?$/i;

export type PendingAcceptanceKind =
  | "workspace"
  | "create_consent"
  | "draft_switch"
  | "artifact_export"
  | "assisted"
  | "do_it_now"
  | "tool"
  | "action_bridge"
  | "make_bridge"
  | "strategy_selection"
  | "decision_flow"
  | "resume";

export type PendingAcceptanceRecord = {
  id: string;
  kind: PendingAcceptanceKind;
  createdAt: number;
  offeredAtTurn: number;
  workspacePanelAtOffer: AppSection | null;
  /** Short summary of what was offered — for topic-shift heuristics. */
  offerSummary: string;
};

/** Recommended: offer survives this many user turns after it was shown. */
export const PENDING_ACCEPTANCE_TURN_LIMIT = 2;

export type ResolvePendingAcceptanceInput = {
  userText: string;
  lastAssistantText: string;
  currentTurn: number;
  workspacePanel: AppSection | null;
  record: PendingAcceptanceRecord | null;
  pendingAction: PendingAction | null;
  createConsent: PendingCreateOpenPayload | null;
  /** User turns since the offer (0 = same turn as offer message). */
  turnsSinceOffer?: number;
};

export type ResolvePendingAcceptanceResult =
  | { outcome: "not_acceptance" }
  | { outcome: "conversation"; message: string }
  | { outcome: "expired"; message: string }
  | {
      outcome: "accept";
      kind: PendingAcceptanceKind;
      ack: string;
      via: "generic" | "specific";
    };

export function isBareGenericAcceptance(text: string): boolean {
  return GENERIC_ACCEPTANCE_RE.test(text.trim());
}

export function isAcceptanceAttempt(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return isBareGenericAcceptance(t) || isActionAcceptance(t);
}

export function createPendingAcceptanceRecord(
  kind: PendingAcceptanceKind,
  offerSummary: string,
  offeredAtTurn: number,
  workspacePanelAtOffer: AppSection | null,
): PendingAcceptanceRecord {
  return {
    id: `${kind}:${Date.now()}:${offeredAtTurn}`,
    kind,
    createdAt: Date.now(),
    offeredAtTurn,
    workspacePanelAtOffer,
    offerSummary: offerSummary.trim(),
  };
}

export function turnsSinceOffer(
  record: PendingAcceptanceRecord,
  currentTurn: number,
): number {
  return Math.max(0, currentTurn - record.offeredAtTurn);
}

export function isPendingAcceptanceExpired(
  record: PendingAcceptanceRecord,
  input: Pick<
    ResolvePendingAcceptanceInput,
    "currentTurn" | "workspacePanel" | "turnsSinceOffer"
  >,
): boolean {
  const elapsed =
    input.turnsSinceOffer ?? turnsSinceOffer(record, input.currentTurn);
  if (elapsed > PENDING_ACCEPTANCE_TURN_LIMIT) return true;
  if (
    record.workspacePanelAtOffer !== null &&
    input.workspacePanel !== record.workspacePanelAtOffer
  ) {
    return true;
  }
  return false;
}

export function ambiguousAcceptanceReply(): string {
  return "Got it. What would you like help with next?";
}

export function expiredAcceptanceReply(): string {
  return "That offer may have passed — what would you like to work on now?";
}

export function acceptanceAckForKind(
  kind: PendingAcceptanceKind,
  detail?: { section?: AppSection; itemType?: string },
): string {
  switch (kind) {
    case "create_consent":
      return "Opening Create.";
    case "draft_switch":
      return "Continuing your draft.";
    case "workspace":
      return acceptanceAckForWorkspace(detail?.section);
    case "artifact_export":
      return "Saving your draft.";
    case "assisted":
      return "Opening that beside us.";
    case "do_it_now":
      return "Starting that now.";
    case "tool":
      return "Opening that tool.";
    case "action_bridge":
    case "make_bridge":
      return "Opening that beside us.";
    case "strategy_selection":
      return "Resuming your strategy session.";
    case "decision_flow":
      return "Opening Decision Compass.";
    case "resume":
      return "Picking up where you left off.";
    default:
      return "On it.";
  }
}

export function acceptanceAckForWorkspace(
  section?: AppSection | null,
): string {
  switch (section) {
    case "content-generator":
      return "Opening Create.";
    case "projects":
      return "Switching to Projects.";
    case "playbook":
      return "Opening Strategies.";
    case "time-block":
      return "Opening Momentum Appointments.";
    case "brain-dump":
      return "Opening Clear My Mind.";
    case "focus-audio":
      return "Opening Focus Audio.";
    case "templates-library":
      return "Opening Templates.";
    case "snippets":
      return "Opening Snippets.";
    case "client-avatars":
      return "Opening Client Avatar.";
    default:
      return "Opening that workspace.";
  }
}

function hasActivePending(input: ResolvePendingAcceptanceInput): boolean {
  return Boolean(
    input.record &&
      (input.pendingAction ||
        input.createConsent ||
        input.record.kind === "create_consent" ||
        input.record.kind === "draft_switch"),
  );
}

/**
 * Single acceptance authority — every yes/sure/okay path should consult this.
 */
export function resolvePendingAcceptance(
  input: ResolvePendingAcceptanceInput,
): ResolvePendingAcceptanceResult {
  const t = input.userText.trim();
  if (!t) return { outcome: "not_acceptance" };

  const bareGeneric = isBareGenericAcceptance(t);
  const acceptanceAttempt = bareGeneric || isActionAcceptance(t);

  if (!acceptanceAttempt) {
    if (
      input.pendingAction &&
      matchesPendingAcceptance(t, input.pendingAction, {
        allowGenericAcceptance: false,
      })
    ) {
      if (!input.record) {
        return { outcome: "conversation", message: ambiguousAcceptanceReply() };
      }
      if (isPendingAcceptanceExpired(input.record, input)) {
        return { outcome: "expired", message: expiredAcceptanceReply() };
      }
      return {
        outcome: "accept",
        kind: input.record.kind,
        ack: acceptanceAckForKind(input.record.kind, {
          section:
            input.pendingAction.kind === "workspace"
              ? input.pendingAction.offer.section
              : undefined,
        }),
        via: "specific",
      };
    }
    return { outcome: "not_acceptance" };
  }

  if (!hasActivePending(input)) {
    return { outcome: "conversation", message: ambiguousAcceptanceReply() };
  }

  const record = input.record!;

  if (isPendingAcceptanceExpired(record, input)) {
    return { outcome: "expired", message: expiredAcceptanceReply() };
  }

  if (
    (record.kind === "create_consent" || record.kind === "draft_switch") &&
    input.createConsent
  ) {
    return {
      outcome: "accept",
      kind: record.kind,
      ack:
        record.kind === "draft_switch"
          ? acceptanceAckForKind("draft_switch")
          : acceptanceAckForKind("create_consent"),
      via: bareGeneric ? "generic" : "specific",
    };
  }

  if (input.pendingAction) {
    const specific = matchesPendingAcceptance(t, input.pendingAction, {
      allowGenericAcceptance: false,
    });
    const genericAllowed =
      bareGeneric &&
      matchesPendingAcceptance(t, input.pendingAction, {
        allowGenericAcceptance: true,
      });
    const autoLaunch = shouldAutoLaunchPendingAction(
      t,
      input.lastAssistantText,
      input.pendingAction,
    );

    if (specific || genericAllowed || (bareGeneric && autoLaunch)) {
      const section =
        input.pendingAction.kind === "workspace"
          ? input.pendingAction.offer.section
          : undefined;
      return {
        outcome: "accept",
        kind: record.kind,
        ack: acceptanceAckForKind(record.kind, { section }),
        via: bareGeneric ? "generic" : "specific",
      };
    }
  }

  return { outcome: "conversation", message: ambiguousAcceptanceReply() };
}

export function topicChangeInvalidatesOffer(
  userText: string,
  record: PendingAcceptanceRecord,
): boolean {
  const t = userText.trim();
  if (!t || isBareGenericAcceptance(t)) return false;
  if (t.length < 12) return false;
  const summary = record.offerSummary.toLowerCase();
  if (!summary) return false;
  const words = summary.split(/\s+/).filter((w) => w.length > 4);
  if (words.some((w) => t.toLowerCase().includes(w))) return false;
  return true;
}
