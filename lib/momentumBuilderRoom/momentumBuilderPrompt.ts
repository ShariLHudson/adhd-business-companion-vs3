/**
 * Momentum Builder — invisible coaching prompt for Spark (never member-facing labels).
 */

import type { MomentumConversationDiscovery } from "./types";
import { estateConnectionHintForChat, suggestEstateConnection } from "./estateConnections";
import { runMomentumBuilderRoomCycle } from "./roomOrchestrator";

const BANNED_MEMBER_FACING_TERMS = [
  "Brain Dump",
  "Eisenhower",
  "Pomodoro",
  "Time Blocking",
  "Two-Minute Rule",
  "GTD",
  "Quick Answer",
  "Deep Dive",
  "Apply to My Business",
  "momentum builder is",
  "learn about momentum",
  "would you like to learn",
] as const;

export function isMomentumBuilderRoomSection(
  section: string | null | undefined,
): boolean {
  return section === "momentum-builder" || section === "grow-momentum-builders";
}

/** Mandatory chat hint while member is in Momentum Builder. */
export function momentumBuilderRoomHintForChat(input?: {
  userText?: string;
  hasConversationStarted?: boolean;
}): string {
  const cycle = input?.userText
    ? runMomentumBuilderRoomCycle({ memberText: input.userText })
    : null;
  const discovery = cycle?.discovery ?? null;
  const orchestration = cycle?.orchestration ?? null;

  const followUp = coachingFollowUpHint(
    discovery,
    orchestration?.hiddenStrategy.approach,
    cycle?.recoveryOverridesProductivity,
    cycle?.todaysPath?.headline,
  );

  const estateConnection = discovery
    ? suggestEstateConnection({
        emotionalState: discovery.emotionalState,
        rawText: discovery.rawMemberText,
      })
    : null;
  const estateHint = estateConnectionHintForChat(estateConnection);

  return [
    "MOMENTUM BUILDER ROOM (mandatory — coaching, not teaching):",
    "Arrival first: \"Let's make today a little easier.\" — then one question. Never define the room.",
    "Never offer: Quick Answer, Example, Apply to My Business, Deep Dive, or numbered learning menus.",
    'Never ask "Would you like to learn about…" or "A momentum builder is…".',
    "Never name internal tools (Brain Dump, Pomodoro, Eisenhower Matrix, time blocking, etc.). Use them invisibly if helpful.",
    "Tone: someone sitting beside them — \"We'll figure this out together.\"",
    "One thoughtful question at a time. Wait after you ask.",
    "After they answer: acknowledge briefly, then help them move — smaller, clearer, forward.",
    followUp,
    estateHint,
    "Success: they feel less overwhelmed and know one meaningful next step — not that they learned a technique.",
  ].join("\n");
}

function coachingFollowUpHint(
  discovery: MomentumConversationDiscovery | null,
  approach?: string,
  recoveryOverrides?: boolean,
  pathHeadline?: string | null,
): string {
  if (!discovery?.rawMemberText.trim()) {
    return "Arrival only: greet, lead line, one opening question — then wait.";
  }

  if (recoveryOverrides || approach === "recover") {
    return [
      "They sound overwhelmed. Respond naturally, e.g.:",
      '"That makes sense. Let\'s make today smaller."',
      'Then ONE question, e.g.: "If you could only accomplish one meaningful thing today, what would it be?"',
      'Or offer help organizing: "Would it help if I organized what\'s in your head into a simple plan?"',
    ].join("\n");
  }

  if (approach === "break_down") {
    return "Help them name the smallest honest first step — no technique labels.";
  }

  if (approach === "prioritize" || approach === "decide") {
    return "Help them choose one thing that matters today — conversational, not a framework lecture.";
  }

  if (pathHeadline) {
    return `Today's Path ready (internal): "${pathHeadline}" — surface calmly on the planning table when member is ready; never as a task list.`;
  }

  return "Listen first. Reflect. One clear question or one small next step.";
}

export function momentumBuilderBannedTermCheck(text: string): string[] {
  const lower = text.toLowerCase();
  return BANNED_MEMBER_FACING_TERMS.filter((term) =>
    lower.includes(term.toLowerCase()),
  );
}
