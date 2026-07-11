/**
 * Recognition lifecycle pipeline runner.
 *
 * Conversation → Recognition → Evidence Vault → Celebration (optional)
 * → Legacy Studio → Hall (optional) → Rediscovery
 */

import {
  isDiscoveryLanguageNotCreate,
  isExplicitCreateRequestForRecognition,
} from "./createGate";
import {
  canInductIntoHall,
  canTransitionLifecycle,
} from "./lifecycle";
import {
  celebrationRoomForTone,
  evaluateRecognitionRouting,
  isFestiveTone,
  shouldBlockCreateRouting,
} from "./routing";
import {
  clearRecognitionFlow,
  getRecognitionRoomState,
  startRecognitionFlow,
} from "./roomState";
import {
  createRecognitionRecord,
  getRecognitionRecord,
  inductHallExhibit,
  markHallCandidate,
  updateRecognitionRecord,
} from "./store";
import { detectRecognitionTriggers } from "./triggers";
import type {
  RecognitionExperiencePath,
  RecognitionLifecycleStatus,
  RecognitionRecordType,
  RecognitionRoomId,
  RecognitionTone,
} from "./types";
import {
  flowKindForStage,
  roomForPipelineStage,
  type AdvanceRecognitionLifecycleInput,
  type AdvanceRecognitionLifecycleResult,
  type RecognitionLifecycleOffer,
  type RecognitionLifecycleTurnResult,
  type RecognitionMemberChoice,
  type RecognitionPipelineStage,
} from "./pipelineTypes";

// Re-export stage helpers for consumers
export { flowKindForStage, roomForPipelineStage };

function titleFromText(text: string): string {
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (cleaned.length <= 72) return cleaned;
  return `${cleaned.slice(0, 69)}…`;
}

function buildPreserveOffer(
  path: RecognitionExperiencePath,
): RecognitionLifecycleOffer {
  return {
    stage: "evidence_vault",
    nextLifecycleStatus: "preserved",
    suggestedRoomId: "evidence-vault",
    flowKind: "preserve_discovery",
    path,
    memberPrompt:
      "This sounds like something worth remembering. Would you like to preserve it in your Evidence Vault?",
    options: ["preserve_it", "celebrate_it", "not_now"],
    blockCreate: true,
    preserveFirst: true,
    reason: "preserve_first_default",
  };
}

function buildCelebrationOffer(
  tone?: RecognitionTone,
  path: RecognitionExperiencePath = "fast",
): RecognitionLifecycleOffer {
  const room = celebrationRoomForTone(tone);
  return {
    stage: "celebration",
    nextLifecycleStatus: isFestiveTone(tone)
      ? "celebrated_festive"
      : "celebrated_quiet",
    suggestedRoomId: room,
    flowKind: isFestiveTone(tone)
      ? "festive_celebration"
      : "quiet_celebration",
    path,
    memberPrompt: "Would you like a quiet moment or a joyful celebration?",
    options: [
      "quiet_moment",
      "joyful_celebration",
      "help_me_decide",
      "not_now",
    ],
    blockCreate: true,
    preserveFirst: false,
    reason: "celebration_choice",
  };
}

function buildLegacyOffer(
  path: RecognitionExperiencePath = "fast",
): RecognitionLifecycleOffer {
  return {
    stage: "legacy_studio",
    nextLifecycleStatus: "chronicled",
    suggestedRoomId: "legacy-studio",
    flowKind: "legacy_story",
    path,
    memberPrompt:
      "Would you like to tell the story behind this while it is still fresh?",
    options: ["tell_the_story", "not_now", "remind_me_later"],
    blockCreate: true,
    preserveFirst: false,
    reason: "legacy_optional",
  };
}

function buildHallOffer(
  path: RecognitionExperiencePath = "fast",
): RecognitionLifecycleOffer {
  return {
    stage: "hall",
    nextLifecycleStatus: "hall_candidate",
    suggestedRoomId: "portfolio",
    flowKind: "hall_exhibit",
    path,
    memberPrompt:
      "This feels like it may become part of your life story. Would you like to prepare it as a possible Hall of Accomplishments exhibit?",
    options: ["mark_hall_candidate", "induct_into_hall", "not_now"],
    blockCreate: true,
    preserveFirst: false,
    reason: "hall_optional",
  };
}

function companionHintForOffer(offer: RecognitionLifecycleOffer): string {
  return [
    "RECOGNITION LIFECYCLE (invisible — one Spark companion):",
    `Stage: ${offer.stage}`,
    `Room hint: ${offer.suggestedRoomId ?? "none"}`,
    `Preserve-first: ${offer.preserveFirst}`,
    "Do NOT open Create or offer to build a product unless the member explicitly asks.",
    `Member prompt: ${offer.memberPrompt}`,
    `Options: ${offer.options.join(" · ")}`,
  ].join("\n");
}

/**
 * Evaluate a conversation turn for recognition ownership.
 * Does not mutate records until the member chooses.
 */
export function evaluateRecognitionLifecycleTurn(input: {
  userText: string;
  tone?: RecognitionTone;
  intentionalRoomEntry?: boolean;
}): RecognitionLifecycleTurnResult {
  const text = input.userText.trim();
  const explicitCreate = isExplicitCreateRequestForRecognition(text);
  const discoveryNotCreate = isDiscoveryLanguageNotCreate(text);
  const trigger = detectRecognitionTriggers(text);
  const state = getRecognitionRoomState();

  const blockCreate =
    !explicitCreate &&
    (discoveryNotCreate ||
      shouldBlockCreateRouting({
        trigger,
        visualRoom: state.visualRoom,
        activeFlowKind: state.activeRecognitionFlow?.kind ?? null,
      }));

  // Explicit Create wins — recognition does not own the turn
  if (explicitCreate && !discoveryNotCreate) {
    return {
      ownsTurn: false,
      trigger,
      offer: null,
      companionPromptHint: null,
      speak: null,
      allowCreate: true,
    };
  }

  if (!trigger.matched && !discoveryNotCreate) {
    return {
      ownsTurn: false,
      trigger,
      offer: null,
      companionPromptHint: null,
      speak: null,
      allowCreate: explicitCreate,
    };
  }

  // Active preserve flow — stay in recognition
  if (state.activeRecognitionFlow?.kind === "preserve_discovery") {
    const offer = buildPreserveOffer(
      state.activeRecognitionFlow.path ?? "fast",
    );
    return {
      ownsTurn: true,
      trigger,
      offer,
      companionPromptHint: companionHintForOffer(offer),
      speak: offer.memberPrompt,
      allowCreate: false,
    };
  }

  const routing = evaluateRecognitionRouting({
    trigger: trigger.matched
      ? trigger
      : {
          matched: true,
          phrases: ["discovery_language"],
          suggestsCelebration: false,
          suggestsHallLanguage: false,
          suggestsPreserve: true,
        },
    tone: input.tone,
    intentionalRoomEntry: input.intentionalRoomEntry,
  });

  let offer: RecognitionLifecycleOffer;
  if (trigger.suggestsHallLanguage && !trigger.suggestsCelebration) {
    // Hall language still preserve-first, then optional Hall
    offer = buildPreserveOffer(routing.path);
    offer = {
      ...offer,
      reason: "hall_language_preserve_first",
      memberPrompt:
        "This sounds like a defining moment. Would you like to preserve it in your Evidence Vault first?",
    };
  } else if (routing.preserveFirst || !trigger.suggestsCelebration) {
    offer = buildPreserveOffer(routing.path);
    if (discoveryNotCreate) {
      offer = {
        ...offer,
        memberPrompt:
          "This sounds like a meaningful discovery. Would you like to preserve it in your Evidence Vault?",
        reason: "discovery_preserve_first",
      };
    }
  } else {
    offer = buildCelebrationOffer(input.tone, routing.path);
  }

  // Context lock: inside vault → preserve
  if (state.visualRoom === "evidence-vault" || state.visualRoom === "evidence-bank") {
    offer = buildPreserveOffer(routing.path);
  }

  return {
    ownsTurn: true,
    trigger,
    offer,
    companionPromptHint: companionHintForOffer(offer),
    speak: offer.memberPrompt,
    allowCreate: false,
  };
}

/**
 * Advance the lifecycle after a member choice.
 * Creates / updates recognition records; never auto-inducts Hall.
 */
export function advanceRecognitionLifecycle(
  input: AdvanceRecognitionLifecycleInput,
): AdvanceRecognitionLifecycleResult {
  const path = input.path ?? "fast";
  const choice = input.choice;

  if (choice === "not_now") {
    clearRecognitionFlow();
    return {
      ok: true,
      stage: "conversation",
      lifecycleStatus: null,
      recordType: null,
      suggestedRoomId: null,
      flowKind: null,
      memberPrompt: "Of course — we can come back to this whenever you like.",
      options: [],
    };
  }

  if (choice === "remind_me_later") {
    clearRecognitionFlow();
    return {
      ok: true,
      stage: "conversation",
      lifecycleStatus: null,
      recordType: null,
      suggestedRoomId: null,
      flowKind: null,
      memberPrompt: "I'll hold that gently. Ask me anytime to revisit it.",
      options: ["revisit"],
    };
  }

  if (choice === "preserve_it") {
    if (!input.recordId && input.sourceText?.trim()) {
      return preserveDiscoveryFromConversation({
        userText: input.sourceText,
        tone: input.tone,
        path,
      });
    }

    const record = input.recordId
      ? updateRecognitionRecord(input.recordId, {
          lifecycleStatus: "preserved",
          recordType: "discovery",
        })
      : createRecognitionRecord({
          recordType: "discovery",
          title: "Preserved discovery",
          lifecycleStatus: "preserved",
          sourceRoom: "evidence-vault",
          tone: input.tone,
        });

    if (!record) {
      return {
        ok: false,
        stage: "evidence_vault",
        lifecycleStatus: null,
        recordType: null,
        suggestedRoomId: "evidence-vault",
        flowKind: "preserve_discovery",
        memberPrompt: "I couldn't update that record. Want to try again?",
        options: ["preserve_it", "not_now"],
        error: "record_missing",
      };
    }

    startRecognitionFlow({
      kind: "preserve_discovery",
      path,
      recordId: record.id,
      suggestedRoomId: "evidence-vault",
    });

    const next = buildCelebrationOffer(input.tone, path);
    return {
      ok: true,
      stage: "evidence_vault",
      lifecycleStatus: "preserved",
      recordType: "discovery",
      suggestedRoomId: "evidence-vault",
      flowKind: "preserve_discovery",
      memberPrompt: `Preserved in your Evidence Vault. ${next.memberPrompt}`,
      options: next.options,
      record,
    };
  }

  if (choice === "celebrate_it" || choice === "help_me_decide") {
    const offer = buildCelebrationOffer(input.tone, path);
    startRecognitionFlow({
      kind: offer.flowKind ?? "quiet_celebration",
      path,
      recordId: input.recordId,
      suggestedRoomId: offer.suggestedRoomId ?? undefined,
    });
    return {
      ok: true,
      stage: "celebration",
      lifecycleStatus: null,
      recordType: null,
      suggestedRoomId: offer.suggestedRoomId,
      flowKind: offer.flowKind,
      memberPrompt: offer.memberPrompt,
      options: offer.options,
    };
  }

  if (choice === "quiet_moment" || choice === "joyful_celebration") {
    const festive = choice === "joyful_celebration";
    const status: RecognitionLifecycleStatus = festive
      ? "celebrated_festive"
      : "celebrated_quiet";
    const recordType: RecognitionRecordType = festive
      ? "festive_celebration"
      : "quiet_celebration";
    const room: RecognitionRoomId = festive ? "celebration-room" : "gardens";
    const flowKind = festive ? "festive_celebration" : "quiet_celebration";

    let record = input.recordId
      ? getRecognitionRecord(input.recordId)
      : null;

    if (record) {
      if (!canTransitionLifecycle(record.lifecycleStatus, status)) {
        // Allow skip from captured/preserved
        record = updateRecognitionRecord(record.id, {
          lifecycleStatus: status,
          recordType,
          tone: input.tone ?? (festive ? "joyful" : "peaceful"),
          celebrationIntensity: festive ? "full" : "small",
        });
      } else {
        record = updateRecognitionRecord(record.id, {
          lifecycleStatus: status,
          recordType,
          tone: input.tone ?? (festive ? "joyful" : "peaceful"),
          celebrationIntensity: festive ? "full" : "small",
        });
      }
    } else {
      record = createRecognitionRecord({
        recordType,
        title: festive ? "Joyful celebration" : "Quiet celebration",
        lifecycleStatus: status,
        sourceRoom: room,
        tone: input.tone ?? (festive ? "joyful" : "peaceful"),
      });
    }

    startRecognitionFlow({
      kind: flowKind,
      path,
      recordId: record?.id,
      suggestedRoomId: room,
    });

    const legacy = buildLegacyOffer(path);
    return {
      ok: true,
      stage: "celebration",
      lifecycleStatus: status,
      recordType,
      suggestedRoomId: room,
      flowKind,
      memberPrompt: festive
        ? `Celebrated in the Celebration Room. ${legacy.memberPrompt}`
        : `A quiet moment in the Celebration Garden. ${legacy.memberPrompt}`,
      options: legacy.options,
      record: record ?? undefined,
    };
  }

  if (choice === "tell_the_story") {
    let record = input.recordId
      ? getRecognitionRecord(input.recordId)
      : null;

    if (record) {
      record = updateRecognitionRecord(record.id, {
        lifecycleStatus: "chronicled",
        recordType: "legacy_story",
      });
    } else {
      record = createRecognitionRecord({
        recordType: "legacy_story",
        title: "Legacy story",
        lifecycleStatus: "chronicled",
        sourceRoom: "legacy-studio",
        tone: input.tone,
      });
    }

    startRecognitionFlow({
      kind: "legacy_story",
      path,
      recordId: record?.id,
      suggestedRoomId: "legacy-studio",
    });

    const hall = buildHallOffer(path);
    return {
      ok: true,
      stage: "legacy_studio",
      lifecycleStatus: "chronicled",
      recordType: "legacy_story",
      suggestedRoomId: "legacy-studio",
      flowKind: "legacy_story",
      memberPrompt: `Legacy Studio is open for this story. ${hall.memberPrompt}`,
      options: hall.options,
      record: record ?? undefined,
    };
  }

  if (choice === "mark_hall_candidate") {
    if (!input.recordId) {
      const created = createRecognitionRecord({
        recordType: "hall_candidate",
        title: "Hall candidate",
        lifecycleStatus: "hall_candidate",
        sourceRoom: "portfolio",
        hallCandidateStatus: "marked",
        tone: input.tone,
      });
      startRecognitionFlow({
        kind: "hall_exhibit",
        path,
        recordId: created.id,
        suggestedRoomId: "portfolio",
      });
      return {
        ok: true,
        stage: "hall",
        lifecycleStatus: "hall_candidate",
        recordType: "hall_candidate",
        suggestedRoomId: "portfolio",
        flowKind: "hall_exhibit",
        memberPrompt:
          "Marked as a Hall candidate. Induction only happens when you say so.",
        options: ["induct_into_hall", "not_now"],
        record: created,
      };
    }

    const record = markHallCandidate(input.recordId);
    startRecognitionFlow({
      kind: "hall_exhibit",
      path,
      recordId: input.recordId,
      suggestedRoomId: "portfolio",
    });
    return {
      ok: true,
      stage: "hall",
      lifecycleStatus: "hall_candidate",
      recordType: record?.recordType ?? "hall_candidate",
      suggestedRoomId: "portfolio",
      flowKind: "hall_exhibit",
      memberPrompt:
        "Marked as a Hall candidate. Induction only happens when you say so.",
      options: ["induct_into_hall", "not_now"],
      record: record ?? undefined,
    };
  }

  if (choice === "induct_into_hall") {
    if (!input.recordId) {
      return {
        ok: false,
        stage: "hall",
        lifecycleStatus: null,
        recordType: null,
        suggestedRoomId: "portfolio",
        flowKind: "hall_exhibit",
        memberPrompt:
          "I need a preserved moment before we can induct into the Hall.",
        options: ["preserve_it", "not_now"],
        error: "missing_source_record",
      };
    }

    const source = getRecognitionRecord(input.recordId);
    if (!source) {
      return {
        ok: false,
        stage: "hall",
        lifecycleStatus: null,
        recordType: null,
        suggestedRoomId: "portfolio",
        flowKind: "hall_exhibit",
        memberPrompt: "I couldn't find that moment.",
        options: ["not_now"],
        error: "record_missing",
      };
    }

    if (
      !canInductIntoHall({
        current: source.lifecycleStatus,
        userConfirmedHall: true,
      })
    ) {
      // Promote to candidate first if needed
      markHallCandidate(source.id);
    }

    try {
      const exhibit = inductHallExhibit({
        sourceRecordId: source.id,
        title: source.title,
        story: source.body ?? source.description,
        userConfirmedHall: true,
      });
      clearRecognitionFlow();
      const updated = getRecognitionRecord(source.id);
      return {
        ok: true,
        stage: "hall",
        lifecycleStatus: "hall_exhibit",
        recordType: "hall_exhibit_reference",
        suggestedRoomId: "portfolio",
        flowKind: "hall_exhibit",
        memberPrompt:
          "This moment is now part of your story in the Hall of Accomplishments.",
        options: ["revisit"],
        record: updated ?? undefined,
      };
    } catch (err) {
      return {
        ok: false,
        stage: "hall",
        lifecycleStatus: source.lifecycleStatus,
        recordType: source.recordType,
        suggestedRoomId: "portfolio",
        flowKind: "hall_exhibit",
        memberPrompt:
          err instanceof Error
            ? err.message
            : "Hall induction needs your explicit confirmation.",
        options: ["induct_into_hall", "not_now"],
        error: "induction_failed",
      };
    }
  }

  if (choice === "revisit") {
    return {
      ok: true,
      stage: "rediscovery",
      lifecycleStatus: null,
      recordType: null,
      suggestedRoomId: "evidence-vault",
      flowKind: null,
      memberPrompt:
        "Let's revisit what you've preserved. What would you like to look at?",
      options: ["preserve_it", "celebrate_it", "tell_the_story", "not_now"],
    };
  }

  return {
    ok: false,
    stage: "conversation",
    lifecycleStatus: null,
    recordType: null,
    suggestedRoomId: null,
    flowKind: null,
    memberPrompt: "I'm not sure which step you meant — preserve, celebrate, or not now?",
    options: ["preserve_it", "celebrate_it", "not_now"],
    error: "unknown_choice",
  };
}

/**
 * Capture a discovery from conversation text into Evidence Vault (preserve).
 * Used when member confirms preserve_it with source text.
 */
export function preserveDiscoveryFromConversation(input: {
  userText: string;
  tone?: RecognitionTone;
  path?: RecognitionExperiencePath;
}): AdvanceRecognitionLifecycleResult {
  const record = createRecognitionRecord({
    recordType: "discovery",
    title: titleFromText(input.userText),
    body: input.userText.trim(),
    sourceContext: "conversation",
    sourceRoom: "evidence-vault",
    lifecycleStatus: "preserved",
    tone: input.tone,
  });

  startRecognitionFlow({
    kind: "preserve_discovery",
    path: input.path ?? "fast",
    recordId: record.id,
    suggestedRoomId: "evidence-vault",
  });

  const next = buildCelebrationOffer(input.tone, input.path ?? "fast");
  return {
    ok: true,
    stage: "evidence_vault",
    lifecycleStatus: "preserved",
    recordType: "discovery",
    suggestedRoomId: "evidence-vault",
    flowKind: "preserve_discovery",
    memberPrompt: `Preserved in your Evidence Vault. ${next.memberPrompt}`,
    options: next.options,
    record,
  };
}

export {
  buildPreserveOffer,
  buildCelebrationOffer,
  buildLegacyOffer,
  buildHallOffer,
};
