/**
 * Harvest discovery answers from recent conversation — don't re-ask what they said.
 */

import type { UniversalDocumentType } from "./types";

const FRUSTRATION_RE =
  /\b(?:i (?:already|just) told you|i said|same thing|you asked|didn'?t i say|told you already)\b/i;

export function isDiscoveryFrustrationReply(text: string): boolean {
  return FRUSTRATION_RE.test(text.trim());
}

export function harvestDiscoveryFromConversation(
  documentType: UniversalDocumentType,
  texts: readonly string[],
): Record<string, string> {
  const combined = texts.join("\n").trim();
  if (!combined) return {};
  if (documentType === "email") return harvestEmailDiscovery(texts, combined);
  return {};
}

function harvestEmailDiscovery(
  texts: readonly string[],
  combined: string,
): Record<string, string> {
  const answers: Record<string, string> = {};

  if (/\b(?:to (?:a |my )?(?:difficult )?client|client email|email to (?:a )?client)\b/i.test(combined)) {
    answers["email-recipient"] = "A client";
  }

  if (/\b(?:rough|strained|tense|difficult relationship|bad place|rocky)\b/i.test(combined)) {
    answers["email-relationship"] = "Rough at the moment";
  }

  const purposeLine = texts.find((t) =>
    /\b(?:follow through|agreed|no longer|keep (?:her|him|them) as|can no longer)\b/i.test(t),
  );
  if (purposeLine) {
    answers["email-purpose"] = purposeLine.trim();
    answers["email-ask"] = purposeLine.trim();
  } else if (
    /\b(?:follow through|agreed items?|boundary|no longer.*client)\b/i.test(combined)
  ) {
    const synthesized =
      "She needs to follow through on agreed items, or you can no longer keep her as a client.";
    answers["email-purpose"] = synthesized;
    answers["email-ask"] = synthesized;
  }

  if (
    /\b(?:already know|already knows|she already|agreed to|what she agreed)\b/i.test(
      combined,
    )
  ) {
    answers["email-context"] = "She already knows what she agreed to";
  }

  return answers;
}

/** Fill optional email fields from thread + settings — never block the draft. */
export function applyEmailDiscoveryDefaults(
  answers: Record<string, string>,
  userText: string,
  contextTexts?: readonly string[],
): Record<string, string> {
  const combined = [userText, ...(contextTexts ?? [])].join("\n").trim();
  const next = { ...answers };

  if (!next["email-recipient"]) {
    if (/\bclient\b/i.test(combined)) next["email-recipient"] = "Client";
    else if (/\bcustomer\b/i.test(combined)) next["email-recipient"] = "Customer";
  }

  if (!next["email-purpose"]) {
    const substantive = [...(contextTexts ?? []), userText].find(
      (t) =>
        t.trim().length >= 20 &&
        /\b(?:follow|agreed|need|must|tell|ask|remind|boundary|no longer|keep (?:her|him|them))\b/i.test(
          t,
        ) &&
        !/^(?:yes|no|ok(?:ay)?|sure|direct|formal|friendly)\b/i.test(t.trim()),
    );
    if (substantive) next["email-purpose"] = substantive.trim();
  }

  if (next["email-purpose"] && !next["email-ask"]) {
    next["email-ask"] = next["email-purpose"];
  }

  if (
    !next["email-context"] &&
    /\b(?:already know|already knows|agreed to|what she agreed|what he agreed)\b/i.test(
      combined,
    )
  ) {
    next["email-context"] = "They already know the background";
  }

  if (
    !next["email-relationship"] &&
    /\b(?:rough|strained|tense|difficult|rocky)\b/i.test(combined)
  ) {
    next["email-relationship"] = "Rough at the moment";
  }

  return next;
}

/** Resolve a frustrated reply using answers already captured in the thread. */
export function resolveFrustratedDiscoveryReply(
  questionId: string,
  userReply: string,
  answers: Readonly<Record<string, string>>,
  conversationText: string,
): string {
  if (!isDiscoveryFrustrationReply(userReply)) return userReply.trim();

  if (questionId === "email-ask" && answers["email-purpose"]) {
    return answers["email-purpose"];
  }
  if (questionId === "email-context") {
    if (answers["email-context"]) return answers["email-context"];
    if (/\bagreed\b/i.test(answers["email-purpose"] ?? conversationText)) {
      return "She already knows what she agreed to";
    }
  }
  if (questionId === "email-recipient" && /\bclient\b/i.test(conversationText)) {
    return "A client";
  }
  if (questionId === "email-purpose") {
    const prior = Object.values(answers).find(
      (a) => a && !isDiscoveryFrustrationReply(a) && a.length > 12,
    );
    if (prior) return prior;
  }

  const prior = Object.values(answers)
    .filter((a) => a && !isDiscoveryFrustrationReply(a))
    .pop();
  return prior?.trim() || userReply.trim();
}

/** Skip questions whose answer is already implied by earlier discovery answers. */
export function impliedEmailAnswer(
  questionId: string,
  answers: Readonly<Record<string, string>>,
): string | null {
  if (questionId === "email-purpose" && answers["email-ask"]) {
    return answers["email-ask"];
  }
  if (questionId === "email-ask" && answers["email-purpose"]) {
    return answers["email-purpose"];
  }
  if (
    questionId === "email-context" &&
    (answers["email-context"] ||
      /\balready know|already knows|agreed\b/i.test(answers["email-purpose"] ?? ""))
  ) {
    return (
      answers["email-context"] ?? "They already know the background"
    );
  }
  return null;
}

export const EMAIL_CREATE_CORRECTION_RE =
  /\b(?:not a call|said an email|meant an email|it'?s an email|i said email|write an email|need(?:ed)? to write an email)\b/i;

export function emailDiscoveryIntro(
  userText: string,
  defaultIntro: string,
): string {
  if (EMAIL_CREATE_CORRECTION_RE.test(userText)) {
    return [
      "You're right — an email, not a call.",
      "",
      defaultIntro,
    ].join("\n");
  }
  if (/\bemail\b/i.test(userText) && /\bclient\b/i.test(userText)) {
    return [
      "Let's write this email so it lands with her — calm, clear, and firm.",
      "",
      "I'll ask what an email needs — one at a time, and skip what you've already told me.",
    ].join("\n");
  }
  return defaultIntro;
}
