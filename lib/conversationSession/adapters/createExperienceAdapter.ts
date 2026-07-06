/**
 * Pass 2 — Create Experience adapter (session-aware follow-up; no re-interview).
 */

import type { ResolvedArtifact } from "@/lib/createInitialization";
import { blankScaffoldForType } from "@/lib/createInitialization";
import { normalizeArtifactType, shouldLockArtifactType } from "@/lib/artifactType";
import { pluginById } from "@/lib/universalCreation/documentRegistry";
import type { UniversalCreationSession } from "@/lib/universalCreation/types";
import { hasDiscoveryBasics } from "../questionGuard";
import { loadConversationSession } from "../store";
import type { ConversationSession } from "../types";

const CONTINUE_ACK =
  "I've opened it — we'll pick up right where we left off.";

/**
 * When purpose / audience / goal are already known, return a continuation ack
 * instead of re-interviewing. Returns null → caller uses legacy follow-up line.
 */
export function sessionAwareFollowUpLine(
  itemType: string,
  session?: ConversationSession | null,
): string | null {
  const s = session ?? loadConversationSession();
  if (!s) return null;

  const { purpose, audience, goal } = hasDiscoveryBasics(s);
  const t = itemType.toLowerCase();

  if (t === "email" && purpose && audience) return CONTINUE_ACK;
  if (t === "sop" && purpose) return CONTINUE_ACK;
  if (t.includes("proposal") && audience) return CONTINUE_ACK;
  if (t.includes("newsletter") && purpose) return CONTINUE_ACK;
  if (purpose && audience && goal) return CONTINUE_ACK;

  return null;
}

export function resolvedArtifactFromSessionContext(
  itemType: string,
  userText: string,
  session?: ConversationSession | null,
  ucSession?: UniversalCreationSession | null,
): ResolvedArtifact {
  const normalized = normalizeArtifactType(itemType);
  const s = session ?? loadConversationSession();
  const draft =
    ucSession?.draftContent?.trim() ||
    s?.draftContent?.trim() ||
    s?.activeArtifact?.draftContent?.trim();

  if (draft) {
    return {
      itemType: normalized,
      title: s?.activeArtifact?.title ?? `New ${normalized}`,
      draftContent: draft,
      source: "stored",
      artifactTypeLocked: shouldLockArtifactType(normalized),
    };
  }

  return {
    itemType: normalized,
    title: `New ${normalized}`,
    draftContent: blankScaffoldForType(normalized),
    source: "blank",
    artifactTypeLocked: shouldLockArtifactType(normalized),
  };
}

export function itemTypeFromUniversalCreation(
  uc: UniversalCreationSession,
): string {
  return pluginById(uc.documentType)?.createItemType ?? "Document";
}
