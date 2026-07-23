/**
 * Authoritative Intent Classification.
 *
 * Precedence (binding):
 *   Chamber Member → Board Member → Navigation →
 *   (if sticky document) Active Document / New Document / Clarification /
 *   Conversation(exit) → Research → Project → New Document → Conversation
 *
 * Reuses Continuity / Chamber / destination helpers — does not invent a
 * second conversation architecture.
 */

import { resolveBoardDirectorAlias } from "@/lib/board/boardDirectorRegistry";
import type { BoardDirectorId } from "@/lib/board/types";
import { isDirectNavigationPriorityTurn } from "@/lib/chatScope";
import {
  classifyChamberRoutingIntent,
  classifyDocumentContinuity,
  shouldContinueStickyDocument,
} from "@/lib/conversationContinuity/documentContinuityClassifier";
import { detectStoredContentOrNavigationDestination } from "@/lib/conversationContinuity/storedContentNavigation";
import type { ConversationOwner } from "@/lib/conversationContinuity/types";
import { classifyRequestedArtifactType } from "@/lib/conversationStabilization/intentClassificationGate";
import { looksLikeKnowledgeQuestion } from "@/lib/platformIntent/classifyPlatformIntent";
import { loadUniversalCreationSession } from "@/lib/universalCreation";
import { isForceNewCreationRequest } from "@/lib/universalCreationEntrypoint/forceNewIntent";
import type {
  MemberIntentClassification,
  MemberIntentConfidence,
} from "./types";

const BOARD_NAV_RE =
  /\b(?:talk to|ask|bring in|invite|take (?:this |me )?to|go to|open|show(?:\s+me)?)\b/i;

const BOARD_TOPIC_RE =
  /\b(?:the board|boardroom|board of directors|my board|a director|board director)\b/i;

const PROJECT_CREATE_RE =
  /\b(?:create|start|open|build)\s+(?:a |an |my |the )?(?:new )?project\b|\bproject home\b|\bmy projects?\b/i;

const NEW_CREATE_RE =
  /\b(?:help me (?:create|plan|build|write|make)|i (?:want|need) (?:to )?(?:create|plan|build|write)|let'?s (?:create|build|write)|create (?:a|an|my|the))\b/i;

function isCreateDocumentOwner(
  owner: ConversationOwner | null | undefined,
): boolean {
  if (!owner) return false;
  return owner.kind === "guided_workflow" || owner.kind === "artifact";
}

function resolveBoardFromText(userText: string): {
  kind: "match" | "generic" | "none";
  directorId?: BoardDirectorId;
} {
  const t = userText.trim();
  if (!t) return { kind: "none" };

  if (BOARD_TOPIC_RE.test(t) && BOARD_NAV_RE.test(t)) {
    return { kind: "generic" };
  }

  if (!BOARD_NAV_RE.test(t) && !BOARD_TOPIC_RE.test(t)) {
    return { kind: "none" };
  }

  // Pull a name-ish phrase after talk/ask verbs.
  const named = t.match(
    /\b(?:talk to|ask|bring in|invite)\s+(?:director\s+)?([a-z][a-z\s&'-]{1,40})/i,
  );
  if (named?.[1]) {
    const candidate = named[1]
      .replace(/\b(?:about|regarding|for|on|the board)\b.*$/i, "")
      .trim();
    const hit = resolveBoardDirectorAlias(candidate);
    if (hit) return { kind: "match", directorId: hit.id };
  }

  if (BOARD_TOPIC_RE.test(t)) return { kind: "generic" };
  return { kind: "none" };
}

function result(
  bucket: MemberIntentClassification["bucket"],
  confidence: MemberIntentConfidence,
  reason: string,
  refs?: MemberIntentClassification["refs"],
): MemberIntentClassification {
  return { bucket, confidence, reason, refs };
}

export type ClassifyMemberIntentInput = {
  userText: string;
  activeOwner?: ConversationOwner | null;
  hasStickyDocument?: boolean;
  suppressDestination?: boolean;
};

/**
 * Classify a member utterance into exactly one Intent Classification bucket.
 */
export function classifyMemberIntent(
  input: ClassifyMemberIntentInput,
): MemberIntentClassification {
  const userText = input.userText.trim();
  if (!userText) {
    return result("conversation", "low", "empty");
  }

  const owner = input.activeOwner ?? null;
  const sticky =
    input.hasStickyDocument ??
    (isCreateDocumentOwner(owner) || Boolean(loadUniversalCreationSession()));

  // 1. Chamber Member — wins over Create, coaching, and research.
  const chamber = classifyChamberRoutingIntent(userText);
  if (chamber.kind === "legal_risk" || chamber.kind === "chamber_member") {
    return result("chamber_member", "high", `chamber:${chamber.kind}`, {
      chamberMemberId: chamber.memberId,
    });
  }
  if (chamber.kind === "clarify" && chamber.clarifyPrompt) {
    return result("clarification", "medium", "chamber_ambiguous", {
      clarifyPrompt: chamber.clarifyPrompt,
    });
  }

  // 2. Direct navigation — outranks sticky Board / Create awaiting-answer.
  // Uses Estate command router + hard-nav (canonical places), not Board sticky.
  if (!input.suppressDestination && isDirectNavigationPriorityTurn(userText)) {
    const dest = detectStoredContentOrNavigationDestination(userText);
    const kind =
      dest?.kind === "my_day"
        ? "my_day"
        : dest && "destination" in dest
          ? String(dest.destination)
          : "estate_direct";
    return result("navigation", "high", `direct_navigation:${kind}`, {
      destinationKind: kind,
    });
  }

  // 3. Board Member — peer of Chamber at the tree root.
  const board = resolveBoardFromText(userText);
  if (board.kind === "match" || board.kind === "generic") {
    return result("board_member", "high", `board:${board.kind}`, {
      boardDirectorId: board.directorId,
    });
  }
  if (
    owner?.kind === "board_intake" ||
    owner?.kind === "board_director" ||
    owner?.kind === "board_discussion"
  ) {
    // Sticky Board ownership while the member is still in that conversation.
    return result("board_member", "high", "sticky_board_owner", {
      boardDirectorId:
        owner.kind === "board_director" ? owner.directorId : undefined,
    });
  }

  // 4. Stored-content destinations (Plan My Day, Vault, Boardroom…).
  if (!input.suppressDestination) {
    const dest = detectStoredContentOrNavigationDestination(userText);
    if (dest) {
      const kind =
        dest.kind === "my_day"
          ? "my_day"
          : "destination" in dest
            ? String(dest.destination)
            : "destination";
      return result("navigation", "high", `destination:${kind}`, {
        destinationKind: kind,
      });
    }
  }

  // 5. Sticky document branch — Active / New / Clarification / Conversation.
  if (sticky) {
    const artifactType = classifyRequestedArtifactType(userText);
    const continuity = classifyDocumentContinuity({
      userText,
      activeOwner: isCreateDocumentOwner(owner) ? owner : null,
      hasStickyDocument: true,
      awaitingAnswer: isCreateDocumentOwner(owner)
        ? owner.awaitingAnswer
        : false,
      currentArtifactType: artifactType,
    });

    if (continuity.outcome === "chamber_member") {
      return result("chamber_member", "high", "sticky_chamber", {
        chamberMemberId: continuity.chamberMemberId,
      });
    }
    if (continuity.outcome === "clarify" && continuity.clarifyPrompt) {
      return result("clarification", "medium", "sticky_create_ambiguous", {
        clarifyPrompt: continuity.clarifyPrompt,
      });
    }
    if (shouldContinueStickyDocument(continuity)) {
      return result("active_document", "high", "continue_current");
    }
    if (
      continuity.outcome === "start_new" ||
      continuity.outcome === "switch_document" ||
      isForceNewCreationRequest(userText)
    ) {
      return result("new_document", "high", continuity.outcome || "force_new", {
        switchWorkspaceId: continuity.switchWorkspaceId,
      });
    }
    // Not high-confidence about the document → Conversation (exit document mode).
    if (
      looksLikeKnowledgeQuestion(userText) &&
      continuity.outcome === "general_conversation"
    ) {
      return result("research", "high", "sticky_research_exit");
    }
    return result("conversation", "high", "sticky_exit_document");
  }

  // 6. Research — knowledge questions outside Create.
  if (looksLikeKnowledgeQuestion(userText)) {
    return result("research", "high", "knowledge_question");
  }

  // 7. Project — project homes / create project (not a document workflow).
  const artifactType = classifyRequestedArtifactType(userText);
  if (artifactType === "project" || PROJECT_CREATE_RE.test(userText)) {
    return result("project", "high", "project_signal");
  }

  // 8. New Document — fresh create intent (no sticky document).
  if (isForceNewCreationRequest(userText) || NEW_CREATE_RE.test(userText)) {
    return result("new_document", "medium", "fresh_create");
  }

  // 8. Conversation — default.
  return result("conversation", "medium", "default");
}
