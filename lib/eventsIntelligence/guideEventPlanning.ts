/**
 * EI-W601 Guide Event Planning — live runtime.
 * identify phase → identify blocker → recommend next action → update context
 * EI-005: one material question; no menu dump; no reflective loops.
 */

import {
  limitToOneQuestion,
  scrubCertifiedAiLanguage,
} from "@/lib/certifiedConversation/scrubAiLanguage";
import { persistDiscoveryTurn } from "@/lib/creationContinuity";
import {
  buildDiscoveryTransitionReply,
  isEventFoundationReady,
} from "@/lib/discoveryToWorkspace";
import { applyEventTypeChangeRequest } from "./changeEventType";
import {
  createEmptyEventSections,
  updateEventSection,
} from "./eventSections";
import { detectEventIntent, type DetectedEventIntent } from "./detectEventIntent";
import {
  getActiveEventRecord,
  listEventRecords,
  setActiveEventRecordId,
  upsertEventRecord,
} from "./eventRecordStore";
import { eventsIntelligenceRetrievalPath } from "./knowledgeManifest";
import {
  inferNextAction,
  nextFoundationQuestion,
  phaseToRuntimeState,
} from "./lifecycle";
import {
  acceptGeneratedAsset,
  findEcosystemByEventRecord,
  getCreateAssetById,
  mergeEcosystemSignals,
  resolveAssetAcceptFromUserText,
  setPendingSuggestions,
  signalsFromEventSections,
  startCreationEcosystem,
  suggestNextAssets,
} from "@/lib/createAssets";
import { acknowledgeEstablishedLead } from "@/lib/eventCreationWorkspace/buildEventWorkspace";
import { syncEventRecordToProjects } from "./projectsBridge";
import { connectEventRecordToProjectHome } from "./projectsBridgeHomes";
import type {
  EventRecord,
  EventSectionId,
  EventsIntelligenceTurnResult,
} from "./types";

function newEventId(): string {
  return `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Events Intelligence authors the planning reply — do not run the full Chamber
 * certify pipeline here (it can replace clear event guidance with reflective fallbacks).
 * Apply voice scrub + one-question limit only (Chamber Certified quality bar).
 */
function certifyEventsReply(_userText: string, draft: string): string {
  return limitToOneQuestion(
    scrubCertifiedAiLanguage(draft, { stripAdviceMarkers: false }),
  ).trim();
}

function blueprintIdForEvent(record: EventRecord): string {
  return record.eventType === "retreat" || record.eventType === "multi_day"
    ? "bp-retreat-event"
    : record.eventType === "workshop"
      ? "bp-workshop"
      : "bp-event-plan";
}

/** 047 — sync ecosystem signals; optionally append next-asset offer (max 3). */
function syncEcosystemAndMaybeOffer(
  record: EventRecord,
  reply: string,
  newSignals?: readonly string[],
): string {
  const signals = signalsFromEventSections({
    outcomes: record.outcomes,
    audience: record.audience,
    purpose: record.purpose,
    dates: record.dates,
    venue: record.venue,
    budget: record.budget,
    format: record.format,
    filledSectionIds: record.sections
      .filter((s) => s.content.trim())
      .map((s) => s.id),
  });

  let eco = findEcosystemByEventRecord(record.id);
  if (!eco) {
    eco = startCreationEcosystem({
      blueprintId: blueprintIdForEvent(record),
      title: record.title,
      canonicalWorkId: record.canonicalWorkId,
      projectHomeId: record.projectHomeId,
      eventRecordId: record.id,
    });
  }
  if (!eco) return reply;

  eco = mergeEcosystemSignals(eco, [...signals, ...(newSignals ?? [])]);
  const { suggestions, offerLine } = suggestNextAssets({
    ecosystemRecord: eco,
    newSignals: newSignals ?? [],
  });

  // Only attach offer when a meaningful unlock just happened — not every turn
  if (
    offerLine &&
    newSignals &&
    newSignals.some((s) =>
      ["venue", "speakers", "registration", "agenda", "dates"].includes(s),
    )
  ) {
    setPendingSuggestions(
      eco,
      suggestions.map((s) => s.assetId),
    );
    // Offer is a second beat — keep foundation question as the only ?
    const offerNoQ = offerLine.replace(/\?/g, ".");
    return `${reply}\n\n${offerNoQ}`;
  }
  return reply;
}

/** 047 — one-click accept of a suggested / named ecosystem asset */
function tryAcceptEcosystemAsset(
  record: EventRecord,
  userText: string,
): EventsIntelligenceTurnResult | null {
  const eco = findEcosystemByEventRecord(record.id);
  if (!eco) return null;
  const foundationOpen = Boolean(
    record.activeQuestionId || nextFoundationQuestion(record),
  );
  const assetId = resolveAssetAcceptFromUserText(eco, userText, {
    allowBareYes: !foundationOpen,
  });
  if (!assetId) return null;

  const next = acceptGeneratedAsset(eco, assetId);
  const def = getCreateAssetById(assetId);
  const label = def?.name ?? "that";
  const draft =
    `I've started your ${label} and linked it to this ${record.title}. ` +
    `We can fill it in whenever you're ready — or keep building the foundation first. ` +
    `What would help most right now?`;
  const reply = certifyEventsReply(userText, draft);
  return {
    kind: "continue",
    reply,
    record,
    projectHomeId: record.projectHomeId,
    projectHomeCreated: false,
    retrievalPath: eventsIntelligenceRetrievalPath({
      phase: record.lifecyclePhase,
    }),
    handled: true,
  };
}

function createEventRecordFromIntent(
  intent: DetectedEventIntent,
): EventRecord {
  const now = new Date().toISOString();
  const sections = createEmptyEventSections({
    event_type: intent.eventTypeLabel,
    format:
      intent.format === "unspecified"
        ? ""
        : intent.format === "in_person"
          ? "In person"
          : intent.format === "virtual"
            ? "Virtual"
            : "Hybrid",
  });

  const record: EventRecord = {
    id: newEventId(),
    title: intent.titleHint,
    eventType: intent.eventType,
    eventTypeLabel: intent.eventTypeLabel,
    purpose: "",
    audience: "",
    outcomes: "",
    format: intent.format,
    dates: intent.multiDay ? "Multi-day / weekend" : "",
    venue: "",
    budget: "",
    lifecyclePhase: "discovery",
    runtimeState: "DISCOVERY",
    sections,
    tasks: [],
    milestones: [],
    decisions: [],
    dependencies: [],
    owners: [],
    nextAction: "Confirm primary outcome",
    activeQuestionId: "q-outcomes",
    conversationContext: intent.rawText,
    projectHomeId: null,
    companionProjectId: null,
    canonicalWorkId: null,
    createdAt: now,
    updatedAt: now,
  };

  const q = nextFoundationQuestion(record);
  return upsertEventRecord({
    ...record,
    activeQuestionId: q?.id ?? null,
    nextAction: inferNextAction(record),
  });
}

function startReply(
  intent: DetectedEventIntent,
  _projectHomeCreated: boolean,
): string {
  const label = intent.titleHint.toLowerCase();
  // Trust Kernel (069/T1) — never claim opened/ready here. CPC authorizes after bind/mount.
  const q =
    intent.eventType === "retreat"
      ? "What should people leave this retreat with — the one outcome that would make the weekend feel successful?"
      : "What is the primary outcome that would make this event worth doing?";

  return (
    `I can help you create that ${label}. Let's work on it together.\n\n` +
    `I'll organize the structure behind the scenes. You stay with the next meaningful decision.\n\n` +
    q
  );
}

/** 066 — Current Focus submits answers here (not via chat). */
export function applyFoundationAnswerToEventRecord(
  record: EventRecord,
  userText: string,
): EventRecord {
  return applyAnswerToRecord(record, userText);
}

function applyAnswerToRecord(
  record: EventRecord,
  userText: string,
): EventRecord {
  const q = nextFoundationQuestion(record);
  if (!q) {
    return syncEventRecordToProjects({
      ...record,
      conversationContext: userText,
      nextAction: inferNextAction(record),
    });
  }

  const answer = userText.trim();
  let next = {
    ...record,
    sections: updateEventSection(record.sections, q.sectionId, answer, "confirmed"),
    conversationContext: answer,
  };

  // Mirror key fields onto the record root for quick access
  if (q.sectionId === "outcomes") next = { ...next, outcomes: answer };
  if (q.sectionId === "audience") next = { ...next, audience: answer };
  if (q.sectionId === "purpose") next = { ...next, purpose: answer };
  if (q.sectionId === "dates") next = { ...next, dates: answer };
  if (q.sectionId === "venue") next = { ...next, venue: answer };
  if (q.sectionId === "budget") next = { ...next, budget: answer };
  if (q.sectionId === "format") {
    const f = answer.toLowerCase();
    next = {
      ...next,
      format: /\bhybrid\b/.test(f)
        ? "hybrid"
        : /\bvirtual\b|online\b/.test(f)
          ? "virtual"
          : /\bin[- ]person\b|on[- ]site\b/.test(f)
            ? "in_person"
            : next.format,
    };
  }

  const following = nextFoundationQuestion(next);
  if (following?.phase !== next.lifecyclePhase) {
    next = {
      ...next,
      lifecyclePhase: following?.phase ?? next.lifecyclePhase,
      runtimeState: phaseToRuntimeState(following?.phase ?? next.lifecyclePhase),
    };
  }

  next = {
    ...next,
    activeQuestionId: following?.id ?? null,
    nextAction: inferNextAction(next),
    decisions: [
      ...next.decisions,
      {
        id: `dec-${q.id}`,
        decision: q.prompt,
        resolved: true,
        resolvedValue: answer,
      },
    ],
  };

  return syncEventRecordToProjects(upsertEventRecord(next));
}

function continueReply(record: EventRecord, userText: string): string {
  const nextQ = nextFoundationQuestion(record);
  const lead = acknowledgeEstablishedLead(record);

  // 059 — Minimum foundation met → stop interviewing; recommend Create Agenda
  if (isEventFoundationReady(record)) {
    return buildDiscoveryTransitionReply(record);
  }

  if (!nextQ) {
    return buildDiscoveryTransitionReply(record);
  }

  // Never re-ask for known facts; never fall back to generic "what's on your mind"
  void userText;
  return `${lead}\n\n${nextQ.prompt}`;
}

/** Domain routing when user jumps ahead (EI-K602). */
function domainHint(userText: string): string | null {
  const t = userText.toLowerCase();
  if (/\bvenue\b|location\b|space\b/.test(t)) return "venue";
  if (/\bspeaker/.test(t)) return "speakers";
  if (/\bsponsor/.test(t)) return "sponsors";
  if (/\bregist/.test(t)) return "registration";
  if (/\bmarketing\b|promo/.test(t)) return "marketing";
  if (/\bbudget\b|cost\b/.test(t)) return "budget";
  if (/\bagenda\b|schedule\b|run of show\b/.test(t)) return "agenda";
  if (/\bfollow[- ]?up\b|debrief\b/.test(t)) return "follow_up";
  return null;
}

function domainReply(record: EventRecord, domain: string): string {
  const outcome = record.outcomes.trim();
  const bridge = outcome
    ? `Keeping your outcome in view (${outcome.slice(0, 100)}), `
    : "";

  switch (domain) {
    case "venue":
      return (
        `${bridge}venue should support the experience — not the other way around.\n\n` +
        `What does the space need to make possible for attendees?`
      );
    case "speakers":
      return (
        `${bridge}speakers should serve one clear promise.\n\n` +
        `Do you already have speakers in mind, or should we define the sessions first?`
      );
    case "budget":
      return (
        `${bridge}budget decides what we protect and what we cut.\n\n` +
        `Is there a number we need to stay under, or are we designing the experience first?`
      );
    default:
      return (
        `${bridge}we can work on ${domain.replace(/_/g, " ")} next.\n\n` +
        (nextFoundationQuestion(record)?.prompt ??
          "What decision would unlock the most progress right now?")
      );
  }
}

/**
 * Main Events Intelligence turn processor.
 * When handled=true, callers should deliver reply and skip Talk It Out / generic chat.
 */
export function processEventsIntelligenceTurn(input: {
  userText: string;
  activeChamberMemberId?: string | null;
  /** Force start even if intent detection is soft */
  forceStart?: boolean;
}): EventsIntelligenceTurnResult {
  const trimmed = input.userText.trim();
  const intent = detectEventIntent(trimmed);
  const active = getActiveEventRecord();
  const domain = domainHint(trimmed);

  // 050 / 045 CONTINUE — never spawn a second workspace when resuming
  const isContinueSignal =
    /\b(?:continue|resume|pick up|where we left off|back to my|finish)\b/i.test(
      trimmed,
    );

  // Soft resume: incomplete listed event of same type before creating another
  if (!input.forceStart && !isContinueSignal && intent.isClearEventGoal) {
    const listedMatch = listEventRecords().find((r) => {
      if (r.runtimeState === "COMPLETED" || r.runtimeState === "CANCELED") {
        return false;
      }
      if (active?.id === r.id) return false;
      if (/\bworkshop\b/i.test(trimmed) && r.eventType === "workshop")
        return true;
      if (/\bretreat\b/i.test(trimmed) && r.eventType === "retreat") return true;
      if (/\bconference\b/i.test(trimmed) && r.eventType === "conference")
        return true;
      if (/\bwebinar\b/i.test(trimmed) && r.eventType === "webinar") return true;
      return Boolean(r.purpose.trim() || r.audience.trim());
    });
    if (listedMatch) {
      setActiveEventRecordId(listedMatch.id);
    }
  }

  const activeNow = getActiveEventRecord() ?? active;

  // Never spawn a second Event Record while any open event is active/listed.
  // Empty shells resume; forceStart is the only path to a brand-new record.
  const startFresh =
    Boolean(input.forceStart) ||
    (!isContinueSignal && intent.isClearEventGoal && !activeNow);

  // Start new event when clear goal and session not already underway
  if (startFresh) {
    let record = createEventRecordFromIntent(intent);
    const linked = connectEventRecordToProjectHome(record);
    record = linked.record;

    startCreationEcosystem({
      blueprintId: blueprintIdForEvent(record),
      title: record.title,
      canonicalWorkId: record.canonicalWorkId,
      projectHomeId: record.projectHomeId,
      eventRecordId: record.id,
    });

    const draft = startReply(intent, linked.created);
    const reply = certifyEventsReply(trimmed, draft);
    return {
      kind: "start",
      reply,
      record,
      projectHomeId: linked.projectHomeId,
      projectHomeCreated: linked.created,
      retrievalPath: eventsIntelligenceRetrievalPath({
        phase: record.lifecyclePhase,
      }),
      handled: true,
    };
  }

  const session = getActiveEventRecord() ?? active;
  if (!session) {
    return {
      kind: "noop",
      reply: "",
      record: null,
      projectHomeId: null,
      projectHomeCreated: false,
      retrievalPath: [],
      handled: false,
    };
  }

  // Domain jump while session active
  if (domain && !nextFoundationQuestion(session)?.id.startsWith("q-")) {
    const reply = certifyEventsReply(trimmed, domainReply(session, domain));
    return {
      kind: "domain",
      reply,
      record: session,
      projectHomeId: session.projectHomeId,
      projectHomeCreated: false,
      retrievalPath: eventsIntelligenceRetrievalPath({
        phase: session.lifecyclePhase,
        domainHint: domain,
      }),
      handled: true,
    };
  }

  // P2 — type change on the same Creation Record (never spawn a duplicate)
  const typeChanged = applyEventTypeChangeRequest(session, trimmed);
  if (typeChanged) {
    const reply = certifyEventsReply(
      trimmed,
      `Got it — I've updated this to a ${typeChanged.eventTypeLabel.toLowerCase()}. Same workspace, same progress — recommendations will adapt.`,
    );
    persistDiscoveryTurn({
      eventRecordId: typeChanged.id,
      userText: trimmed,
      assistantReply: reply,
    });
    return {
      kind: "continue",
      reply,
      record: typeChanged,
      projectHomeId: typeChanged.projectHomeId,
      projectHomeCreated: false,
      retrievalPath: eventsIntelligenceRetrievalPath({
        phase: typeChanged.lifecyclePhase,
      }),
      handled: true,
    };
  }

  // 047 — accept a suggested asset before treating text as a foundation answer
  const accepted = tryAcceptEcosystemAsset(session, trimmed);
  if (accepted) return accepted;

  // Continue foundation Q&A
  if (session.activeQuestionId || nextFoundationQuestion(session)) {
    const prior = session;
    const updated = applyAnswerToRecord(session, trimmed);
    const draft = continueReply(updated, trimmed);
    let reply = certifyEventsReply(trimmed, draft);

    // P0 — persist every Discovery answer immediately (never wait for completion)
    const persisted = persistDiscoveryTurn({
      eventRecordId: updated.id,
      userText: trimmed,
      assistantReply: reply,
    });
    const recordAfterPersist = persisted.record ?? updated;

    const newSignals: string[] = [];
    if (!prior.venue.trim() && recordAfterPersist.venue.trim())
      newSignals.push("venue");
    if (!prior.dates.trim() && recordAfterPersist.dates.trim())
      newSignals.push("dates");
    if (!prior.outcomes.trim() && recordAfterPersist.outcomes.trim()) {
      newSignals.push("outcomes");
    }
    if (!prior.audience.trim() && recordAfterPersist.audience.trim()) {
      newSignals.push("audience");
    }
    if (domain === "speakers") newSignals.push("speakers");
    if (domain === "registration") newSignals.push("registration");

    reply = syncEcosystemAndMaybeOffer(recordAfterPersist, reply, newSignals);

    return {
      kind: "continue",
      reply,
      record: recordAfterPersist,
      projectHomeId: updated.projectHomeId,
      projectHomeCreated: false,
      retrievalPath: eventsIntelligenceRetrievalPath({
        phase: updated.lifecyclePhase,
        domainHint: domain,
      }),
      handled: true,
    };
  }

  if (domain) {
    const reply = certifyEventsReply(trimmed, domainReply(session, domain));
    return {
      kind: "domain",
      reply,
      record: session,
      projectHomeId: session.projectHomeId,
      projectHomeCreated: false,
      retrievalPath: eventsIntelligenceRetrievalPath({
        phase: session.lifecyclePhase,
        domainHint: domain,
      }),
      handled: true,
    };
  }

  return {
    kind: "noop",
    reply: "",
    record: session,
    projectHomeId: active.projectHomeId,
    projectHomeCreated: false,
    retrievalPath: eventsIntelligenceRetrievalPath({
      phase: active.lifecyclePhase,
    }),
    handled: false,
  };
}

export function fillEventSectionFromGuide(
  record: EventRecord,
  sectionId: EventSectionId,
  content: string,
): EventRecord {
  return syncEventRecordToProjects(
    upsertEventRecord({
      ...record,
      sections: updateEventSection(record.sections, sectionId, content, "confirmed"),
      nextAction: inferNextAction({
        ...record,
        sections: updateEventSection(record.sections, sectionId, content, "confirmed"),
      }),
    }),
  );
}
