/**
 * 051 — Engine certification checklist (Phase 1 gates).
 */

import type { UniversalCreationEngineResult } from "./types";
import { assertConversationSafe } from "./nextBestStepEngine";

export type EngineCertification = {
  passed: boolean;
  checks: Array<{ id: string; ok: boolean; detail: string }>;
};

export function certifyUniversalCreationResult(
  result: UniversalCreationEngineResult,
): EngineCertification {
  const checks = [
    {
      id: "intent_resolved",
      ok: Boolean(result.intent),
      detail: `intent=${result.intent}`,
    },
    {
      id: "know_does_not_create",
      ok:
        result.intent !== "know" ||
        (!result.handled && !result.eventRecordId) ||
        result.resolution.reason === "knowledge_stays_in_conversation",
      detail: result.resolution.reason,
    },
    {
      id: "no_orphan_context",
      ok: !result.handled || Boolean(result.context?.creationRecordId),
      detail: result.context?.creationRecordId ?? "none",
    },
    {
      id: "conversation_safe",
      ok: result.conversationSafe && assertConversationSafe(result.reply),
      detail: "no forbidden reflective traps",
    },
    {
      id: "do_not_reask_present",
      ok:
        !result.context ||
        result.context.knownFacts.length === 0 ||
        result.context.doNotReaskFields.length > 0,
      detail: `doNotReask=${result.context?.doNotReaskFields.length ?? 0}`,
    },
  ];

  return {
    passed: checks.every((c) => c.ok),
    checks,
  };
}
