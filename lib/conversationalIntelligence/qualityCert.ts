/**
 * Quality certification — regenerate wording if any gate fails.
 */

import {
  isTooCloseToUser,
  usesAvoidedDefaultScript,
  countQuestions,
} from "@/lib/reflectiveConversationIntelligence";
import { detectForbiddenHumanConversationOpener } from "@/lib/humanConversation/forbiddenPatterns";
import type { CiQualityCert } from "./types";

const SCRIPTED =
  /\b(?:how does that make you feel|what possibilities|let us explore|thank you for sharing)\b/i;

export function certifyConversationalQuality(input: {
  text: string;
  userText: string;
  recentAssistantTexts?: readonly string[];
}): CiQualityCert {
  const failures: string[] = [];
  const text = input.text.trim();

  const soundsHuman =
    text.length >= 8 &&
    !/^as an ai\b/i.test(text) &&
    !detectForbiddenHumanConversationOpener(text);
  if (!soundsHuman) failures.push("sounds-human");

  const notScripted =
    !SCRIPTED.test(text) && !usesAvoidedDefaultScript(text);
  if (!notScripted) failures.push("not-scripted");

  const stemHits = (input.recentAssistantTexts ?? [])
    .slice(-2)
    .filter((prev) => {
      const a = prev.toLowerCase().slice(0, 40);
      const b = text.toLowerCase().slice(0, 40);
      return a.length > 12 && b.startsWith(a.slice(0, 18));
    });
  const avoidsRepetition = stemHits.length === 0;
  if (!avoidsRepetition) failures.push("avoids-repetition");

  const buildsOnUser = !isTooCloseToUser(input.userText, text);
  if (!buildsOnUser) failures.push("builds-on-user");

  const movesForward = text.length > 12;
  if (!movesForward) failures.push("moves-forward");

  const leavesRoom =
    countQuestions(text) <= 1 &&
    !/\b(?:you should|you need to|you must)\b/i.test(text);
  if (!leavesRoom) failures.push("leaves-room");

  return {
    soundsHuman,
    notScripted,
    avoidsRepetition,
    buildsOnUser,
    movesForward,
    leavesRoom,
    passed: failures.length === 0,
    failures,
  };
}
