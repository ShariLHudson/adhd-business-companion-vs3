/**
 * Estate Memory Continuity™ — turn + transition recording (merge, never overwrite).
 */

import type { EstateEmotionalLabel } from "./types";
import type { RecordEstateRoomTransitionInput, RecordEstateTurnInput } from "./types";
import { onEstateJourneyConversationTurn } from "@/lib/estateJourneyEngine/engine";
import { shouldPlayEstateArrival } from "@/lib/estate/estateArrivalExperience";
import { dispatchEstateArrivalStart } from "@/lib/estate/estateArrivalSession";
import { recordEstateRoomVisit } from "@/lib/estate/estateRoomVisitMemory";
import { onEstateJourneyRoomTransition } from "@/lib/estateJourneyEngine/engine";
import {
  estateEntryIdForSection,
  estateRoomDisplayName,
  estateSectionForEntryId,
} from "./estateSectionMap";
import {
  getEstateMemory,
  markEstateTransitionPreserveChat,
  patchEstateMemory,
} from "./estateMemoryStore";

const MAX_EMOTIONAL_HISTORY = 12;
const MAX_DIGEST_TURNS = 24;
const MAX_INTENT_CHAIN = 8;
const MAX_JOURNEY_STEPS = 16;
const MAX_PROGRESS_NOTES = 10;

function summarizeLine(text: string, max = 140): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function expressedEmotionFromText(text: string): EstateEmotionalLabel | null {
  const t = text.toLowerCase();
  if (/\boverwhelm/.test(t)) return "overwhelmed";
  if (/\b(?:stuck|paralyz)/.test(t)) return "stuck";
  if (/\b(?:calm|peace|relax|better)\b/.test(t)) return "calm";
  if (/\b(?:focus|energiz|motivat)/.test(t)) return "energized";
  if (/\b(?:anxious|stress|worried)\b/.test(t)) return "anxious";
  return null;
}

function inferActiveTask(text: string): string | null {
  const t = text.trim();
  if (!t) return null;
  if (/\bworkshop\b/i.test(t)) return "build a workshop";
  if (/\bplan(?:ning)? (?:my )?day\b/i.test(t)) return "plan today";
  if (/\b(?:clear|organize).*(?:thoughts|mind|head)\b/i.test(t)) {
    return "clear and organize thoughts";
  }
  if (/\boverwhelm/i.test(t)) return "make progress despite overwhelm";
  if (/\bresearch\b/i.test(t)) return "research and explore";
  if (/\bcreate\b/i.test(t)) return "create something meaningful";
  return null;
}

function pushUniqueGoal(label: string, source: string) {
  return patchEstateMemory((mem) => {
    const exists = mem.activeGoals.some(
      (g) => g.label.toLowerCase() === label.toLowerCase(),
    );
    if (exists) return mem;
    const goal = {
      id: `goal-${Date.now()}`,
      label,
      startedAt: new Date().toISOString(),
      source,
    };
    return {
      ...mem,
      activeGoals: [...mem.activeGoals, goal].slice(-6),
    };
  });
}

/** Record a conversation turn into global Estate memory — never clears prior state. */
export function recordEstateConversationTurn(input: RecordEstateTurnInput) {
  const expressed = expressedEmotionFromText(input.userText);
  const emotional =
    input.emotionalLabel && input.emotionalLabel !== "unclear"
      ? input.emotionalLabel
      : expressed;

  const task =
    input.activeGoal?.trim() ||
    inferActiveTask(input.userText) ||
    undefined;

  patchEstateMemory((mem) => {
    const now = new Date().toISOString();
    const digest = [...mem.conversationDigest];

    digest.push({
      role: "user",
      summary: summarizeLine(input.userText),
      at: now,
    });
    if (input.assistantText?.trim()) {
      digest.push({
        role: "assistant",
        summary: summarizeLine(input.assistantText),
        at: now,
      });
    }

    const emotionalHistory = [...mem.emotionalState.history];
    if (emotional) {
      emotionalHistory.push({
        label: emotional,
        at: now,
        source: expressed ? "expressed" : "detected",
      });
    }

    const intentChain = [...mem.activeJourney.intentChain];
    if (input.intentLabel?.trim()) {
      const label = input.intentLabel.trim();
      if (intentChain[intentChain.length - 1] !== label) {
        intentChain.push(label);
      }
    } else if (task) {
      const shortIntent = task;
      if (intentChain[intentChain.length - 1] !== shortIntent) {
        intentChain.push(shortIntent);
      }
    }

    const progressNotes = [...mem.momentumState.progressNotes];
    if (input.momentumNote?.trim()) {
      progressNotes.push(summarizeLine(input.momentumNote, 100));
    }

    let unfinishedLoops = [...mem.momentumState.unfinishedLoops];
    if (input.overwhelmed || emotional === "overwhelmed") {
      const loop = "overwhelm — needs gentle forward motion";
      if (!unfinishedLoops.includes(loop)) unfinishedLoops.push(loop);
    }
    if (emotional === "stuck") {
      const loop = "stuck — needs one small step";
      if (!unfinishedLoops.includes(loop)) unfinishedLoops.push(loop);
    }
    if (emotional === "calm" && unfinishedLoops.length) {
      unfinishedLoops = unfinishedLoops.filter((l) => !l.startsWith("overwhelm"));
    }

    return {
      ...mem,
      emotionalState: {
        current: emotional ?? mem.emotionalState.current,
        history: emotionalHistory.slice(-MAX_EMOTIONAL_HISTORY),
      },
      momentumState: {
        ...mem.momentumState,
        lastAction: summarizeLine(input.userText, 80),
        lastActionAt: now,
        progressNotes: progressNotes.slice(-MAX_PROGRESS_NOTES),
        unfinishedLoops: unfinishedLoops.slice(-6),
      },
      activeJourney: {
        ...mem.activeJourney,
        intentChain: intentChain.slice(-MAX_INTENT_CHAIN),
        activeTask: task ?? mem.activeJourney.activeTask,
      },
      conversationDigest: digest.slice(-MAX_DIGEST_TURNS),
    };
  });

  if (task) pushUniqueGoal(task, "conversation");

  onEstateJourneyConversationTurn({
    userText: input.userText,
    emotionalLabel: emotional,
    overwhelmed: input.overwhelmed,
    activeGoal: input.activeGoal,
    activeTask: task ?? undefined,
  });
}

/** Record room transition — carries journey, emotion, and cross-room context forward. */
export function recordEstateRoomTransition(input: RecordEstateRoomTransitionInput) {
  const toEntryId =
    input.toEntryId ?? estateEntryIdForSection(input.toSection) ?? input.toSection;
  const toSection =
    estateSectionForEntryId(toEntryId) ?? input.toSection;
  const fromSection = input.fromSection ?? getEstateMemory().currentRoom?.section;
  const fromEntryId =
    (fromSection && estateEntryIdForSection(fromSection)) ||
    getEstateMemory().currentRoom?.entryId;

  const mem = getEstateMemory();
  if (
    mem.currentRoom?.entryId === toEntryId &&
    mem.lastTransition?.at &&
    Date.now() - new Date(mem.lastTransition.at).getTime() < 2000
  ) {
    if (input.preserveChat !== false) {
      markEstateTransitionPreserveChat();
    }
    return mem;
  }

  if (input.preserveChat !== false) {
    markEstateTransitionPreserveChat();
  }

  patchEstateMemory((mem) => {
    const now = new Date().toISOString();
    const steps = [...mem.activeJourney.steps];

    if (mem.currentRoom) {
      const last = steps[steps.length - 1];
      if (last && !last.exitedAt && last.entryId === mem.currentRoom.entryId) {
        last.exitedAt = now;
      }
    }

    steps.push({
      entryId: toEntryId,
      roomName: estateRoomDisplayName(toEntryId),
      section: toSection,
      enteredAt: now,
      reason: input.reason,
    });

    const previousRoom = mem.currentRoom
      ? { ...mem.currentRoom, leftAt: now }
      : mem.previousRoom;

    return {
      ...mem,
      currentRoom: {
        entryId: toEntryId,
        section: toSection,
        enteredAt: now,
      },
      previousRoom,
      lastTransition: {
        fromEntryId,
        fromSection,
        toEntryId,
        toSection,
        reason: input.reason,
        userText: input.userText?.trim(),
        at: now,
        expectedNextStep: input.expectedNextStep,
      },
      activeJourney: {
        ...mem.activeJourney,
        steps: steps.slice(-MAX_JOURNEY_STEPS),
        pendingEntryIds:
          input.pendingJourneyEntryIds ?? mem.activeJourney.pendingEntryIds,
      },
    };
  });

  recordEstateRoomVisit(toEntryId);

  onEstateJourneyRoomTransition({
    toEntryId,
    toRoomName: estateRoomDisplayName(toEntryId),
    fromEntryId,
    fromSection: fromSection ?? undefined,
    reason: input.reason,
    userText: input.userText,
  });

  if (input.playArrival !== false && shouldPlayEstateArrival(toEntryId)) {
    dispatchEstateArrivalStart({
      roomId: toEntryId,
      shariGreeting: input.shariGreeting,
      playAmbience: input.playAmbience,
    });
  }

  return getEstateMemory();
}

export function mergeEstateUserProfile(slice: {
  displayName?: string;
  businessType?: string;
  goals?: string[];
  preferences?: string[];
}) {
  patchEstateMemory((mem) => ({
    ...mem,
    userProfile: {
      displayName: slice.displayName ?? mem.userProfile.displayName,
      businessType: slice.businessType ?? mem.userProfile.businessType,
      goals: slice.goals
        ? [...new Set([...mem.userProfile.goals, ...slice.goals])].slice(-8)
        : mem.userProfile.goals,
      preferences: slice.preferences
        ? [...new Set([...mem.userProfile.preferences, ...slice.preferences])].slice(
            -8,
          )
        : mem.userProfile.preferences,
    },
  }));
}

export function consumeNextEstateJourneyStep(): string | null {
  const mem = getEstateMemory();
  const [next, ...rest] = mem.activeJourney.pendingEntryIds;
  if (!next) return null;
  patchEstateMemory((m) => ({
    ...m,
    activeJourney: { ...m.activeJourney, pendingEntryIds: rest },
  }));
  return next;
}
