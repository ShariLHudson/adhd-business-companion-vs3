/**
 * Estate Journey Engine — session tracking and summaries.
 */

import { BEGIN_NEW_DAY_GREETING } from "@/lib/freshStartCopy";
import {
  createEmptyJourneySession,
  getActiveJourneySession,
  newJourneyConversationId,
} from "./state";
import { getJourneyEngineState, patchJourneyEngine } from "./journeyStore";
import type { EstateJourneySession } from "./types";
import { formatRoomHistoryChain } from "./roomHistory";

function roomNamesForSession(session: EstateJourneySession): string[] {
  return session.roomIdsVisited;
}

export function buildJourneySessionSummary(
  sessionId?: string,
): string | null {
  const journey = getJourneyEngineState();
  const session =
    sessionId ?
      journey.sessions.find((s) => s.id === sessionId)
    : getActiveJourneySession(journey);
  if (!session) return null;

  const lines: string[] = [];
  const rooms = roomNamesForSession(session);
  if (rooms.length) {
    lines.push(`Rooms visited: ${rooms.join(" → ")}`);
  }
  if (session.learningCompleted.length) {
    lines.push(`Learning: ${session.learningCompleted.join("; ")}`);
  }
  if (session.projectsAdvanced.length) {
    lines.push(`Projects: ${session.projectsAdvanced.join("; ")}`);
  }
  if (session.challengesCompleted.length) {
    lines.push(`Challenges: ${session.challengesCompleted.join("; ")}`);
  }
  if (session.ideasCaptured.length) {
    lines.push(`Ideas captured: ${session.ideasCaptured.join("; ")}`);
  }
  if (lines.length === 0) return null;
  return lines.join("\n");
}

export function endJourneySession(): string | null {
  const summary = buildJourneySessionSummary();
  patchJourneyEngine((journey) => {
    const now = new Date().toISOString();
    const sessions = journey.sessions.map((s) =>
      s.id === journey.activeSessionId && !s.endedAt ?
        { ...s, endedAt: now }
      : s,
    );
    return { ...journey, sessions };
  });
  return summary;
}

export type BeginJourneyNewDayResult = {
  greeting: string;
  sessionSummary: string | null;
};

/**
 * Start New Day Conversation — fresh chat, preserved journey.
 */
export function beginEstateJourneyNewDay(): BeginJourneyNewDayResult {
  const sessionSummary = endJourneySession();
  const conversationId = newJourneyConversationId();
  const session = createEmptyJourneySession(conversationId);

  patchJourneyEngine((journey) => ({
    ...journey,
    currentConversationId: conversationId,
    activeSessionId: session.id,
    sessions: [...journey.sessions, session].slice(-24),
    newDayCount: journey.newDayCount + 1,
  }));

  return {
    greeting: BEGIN_NEW_DAY_GREETING,
    sessionSummary,
  };
}

export function noteJourneyProjectAdvanced(label: string): void {
  const trimmed = label.trim();
  if (!trimmed) return;
  patchJourneyEngine((journey) => ({
    ...journey,
    sessions: journey.sessions.map((s) =>
      s.id === journey.activeSessionId ?
        {
          ...s,
          projectsAdvanced: [...s.projectsAdvanced, trimmed].slice(-20),
        }
      : s,
    ),
  }));
}

export function noteJourneyIdeaCaptured(text: string): void {
  const trimmed = text.trim().slice(0, 120);
  if (!trimmed) return;
  patchJourneyEngine((journey) => ({
    ...journey,
    sessions: journey.sessions.map((s) =>
      s.id === journey.activeSessionId ?
        {
          ...s,
          ideasCaptured: [...s.ideasCaptured, trimmed].slice(-20),
        }
      : s,
    ),
  }));
}

export function noteJourneyChallengeCompleted(label: string): void {
  const trimmed = label.trim();
  if (!trimmed) return;
  patchJourneyEngine((journey) => ({
    ...journey,
    sessions: journey.sessions.map((s) =>
      s.id === journey.activeSessionId ?
        {
          ...s,
          challengesCompleted: [...s.challengesCompleted, trimmed].slice(-20),
        }
      : s,
    ),
  }));
}

export function formatFullJourneyChain(): string | null {
  const journey = getJourneyEngineState();
  return formatRoomHistoryChain(journey.roomHistory);
}
