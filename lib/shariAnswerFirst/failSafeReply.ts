/**
 * Substantive fail-safe when companion-chat cannot complete an answer-first turn.
 * Prefer this over reflective clarify questions for ordinary how-to / advice help.
 */

import { decideShariResponse } from "./decideShariResponse";
import { capabilityOfferLine } from "./capabilityOffers";
import { isBareGenericAcceptance } from "@/lib/pendingAcceptanceAuthority";
import type { ShariResponseDecision } from "./types";

function topicLabel(text: string): string {
  const t = text
    .replace(/^(?:how (?:do|can|would|should) i|how to|what (?:should|is)|give me ideas for|compare)\s+/i, "")
    .replace(/\?+$/, "")
    .trim();
  return t.length > 80 ? `${t.slice(0, 77)}…` : t || "this";
}

function vendorBoothHowTo(): string {
  return [
    "Here’s a practical way to set up a vendor table or booth that actually works.",
    "",
    "Start with fit. Choose events where your buyers already gather, confirm booth size and rules, and decide whether the goal is sales, leads, or visibility.",
    "",
    "Plan the display before you pack. Put your clearest offer at eye level, keep a clean visual hierarchy, cover the table, and make pricing easy to see. Signage should answer “what is this?” in under three seconds.",
    "",
    "Bring what keeps the booth running: payment options, inventory, lead capture (QR or simple list), promo pieces, lighting if allowed, and a small emergency kit (tape, scissors, charger, backup stock).",
    "",
    "Setup sequence: structure first, then products, then signage, then payment and leads, then a walk-by test from ten feet away.",
    "",
    "While you’re there, greet people, invite curiosity without pressure, and capture contacts with a clear next step. After teardown, follow up within a day or two and note whether the event was worth repeating.",
  ].join("\n");
}

function facebookGroupsHowTo(): string {
  return [
    "Here’s a solid method for finding Facebook groups where you can market without spamming.",
    "",
    "Define the person you want to reach and the language they actually use — problems, identity, occupation, interests, location, and stage.",
    "",
    "Search with those phrases. Then evaluate each group for activity, relevance, rules, and whether promotion is allowed or only relationship-first posting.",
    "",
    "Participate before you promote. Share helpful comments, answer questions, and earn credibility. Track the groups that produce real conversations, and measure results instead of collecting endless lists.",
    "",
    "If you want current group names that allow promotion right now, that needs live research — I can do that next. The method above still works even when lists go stale.",
  ].join("\n");
}

function strategicPlanHowTo(): string {
  return [
    "A strategic plan is a living map of where you are, where you’re going, and the few choices that matter most.",
    "",
    "Start with current-state honesty, then name the future direction. Align that with mission and values. Surface the key strategic issues, choose priorities, and turn them into goals, initiatives, measures, and clear ownership.",
    "",
    "Add risks, a review rhythm, and permission to adapt — a plan that can’t change becomes shelf-ware.",
    "",
    "We can build yours together one section at a time when you want — but you don’t need another workspace open just to understand how planning works.",
  ].join("\n");
}

function loomVideoHowTo(): string {
  return [
    "Here’s a simple way to make a clear Loom (or any screen-record) video.",
    "",
    "Decide the one thing the viewer should understand by the end. Outline three beats: open, show, close.",
    "",
    "Set up: quiet space, decent mic if you have one, browser zoom so text is readable, and close extra tabs. Start recording, greet briefly, then show the path while you narrate in plain language.",
    "",
    "Keep it short. Pause instead of filler words. End with one clear next step. Watch it once before you send — fix only what would confuse someone.",
    "",
    "If you tell me who it’s for and what you’re showing, I’ll tailor the outline.",
  ].join("\n");
}

function howToFailSafe(text: string, decision: ShariResponseDecision): string {
  const t = text.toLowerCase();
  if (/\b(?:vendor|booth|table)\b/.test(t)) return vendorBoothHowTo();
  if (/\bfacebook groups?\b/.test(t)) return facebookGroupsHowTo();
  if (/\bstrateg(?:y|ic plan)\b/.test(t)) return strategicPlanHowTo();
  if (/\b(?:loom|screen.?record)\b/.test(t)) return loomVideoHowTo();

  const topic = topicLabel(text);
  return [
    `Here’s a practical way to approach ${topic}.`,
    "",
    "Clarify what success looks like and what you need before you begin.",
    "Break the work into a clear sequence: prepare, take the first real action, handle the decisions that usually stall people, then close the loop with a simple completion check.",
    "Watch for common mistakes — skipping prep, doing too many steps at once, or waiting for perfect conditions.",
    "",
    decision.answerDepth === "brief"
      ? "If you want more detail on any step, tell me which part."
      : "Tell me your audience, constraints, and timeline and I’ll tailor the steps.",
  ].join("\n");
}

function adviceFailSafe(text: string): string {
  return [
    `On “${topicLabel(text)}” — here’s how I’d think it through.`,
    "",
    "Look at the decision itself, the tradeoffs that matter for your situation, and what you’re optimizing for (money, energy, visibility, relationships, or learning).",
    "Separate what’s known from what you’re assuming. A considered recommendation should leave you clearer — not pressured.",
    "",
    "What’s the one factor that would tip this either way for you?",
  ].join("\n");
}

function brainstormFailSafe(text: string): string {
  return [
    `Here are varied angles for ${topicLabel(text)}:`,
    "",
    "1. A direct outreach approach to people who already know you.",
    "2. A content or education angle that gives value before the ask.",
    "3. A partnership or co-promotion path that borrows trust.",
    "4. A low-effort repetition of what’s already worked once.",
    "5. A visibility move tied to a moment, event, or deadline.",
    "",
    "Which direction fits your energy and audience best right now?",
  ].join("\n");
}

function troubleshootFailSafe(text: string): string {
  if (/\bqr code\b/i.test(text)) {
    return [
      "When a QR code won’t scan from a computer screen, check the simple things first:",
      "",
      "1. Increase brightness and make the code larger on screen.",
      "2. Reduce glare / reflections on the display.",
      "3. Hold the phone steady farther back — many cameras need distance.",
      "4. Try a different phone or camera app.",
      "5. Print it or open it on another device if the screen rendering is soft.",
      "6. Regenerate the QR if the file is low-resolution or stretched.",
      "",
      "Tell me what you see when you try (error, no response, or partial detect) and we’ll narrow it.",
    ].join("\n");
  }
  return [
    `Let’s troubleshoot ${topicLabel(text)}.`,
    "",
    "Start with the simplest checks, then move to more consequential ones. Note what changes after each step so we know what worked.",
    "What have you already tried, and what exactly happens when it fails?",
  ].join("\n");
}

/**
 * Returns a substantive chat reply for answer-first turns, or null to use other fallbacks.
 */
const RETURN_TO_CREATE_ARTIFACT_RE =
  /\b(?:go back to|return to|let'?s go back to|back to)\b.{0,40}\b(?:the |my )?(?:email|draft|document|newsletter)\b/i;

export type AnswerFirstFailSafeOptions = {
  /**
   * Parked-Create side questions must go through companion-chat.
   * Never invent a generic how-to lesson for those turns.
   */
  suppressHowToLesson?: boolean;
};

function returnToCreateArtifactFailSafe(): string {
  return [
    "Of course — let's pick the email back up.",
    "",
    "Tell me what you'd like different, or say Make Changes, Copy Email, or Save for Later.",
  ].join("\n");
}

export function buildAnswerFirstFailSafeReply(
  userText: string,
  options?: AnswerFirstFailSafeOptions,
): string | null {
  // A bare affirmation / continuation ("yes", "okay", "go ahead", "that one",
  // "try it", "let's try it") is never a how-to request. Let the normal
  // conversation-state path (pending acceptance / choice) own the turn — never
  // emit the generic "practical way to approach…" scaffold for these.
  if (isBareGenericAcceptance(userText)) return null;

  const decision = decideShariResponse(userText);
  if (!decision.directAnswerRequired) return null;
  if (decision.primaryHelpMode === "reflective_thinking") return null;
  if (decision.explicitNavigationRequested) return null;

  // Never treat topic-return as a generic how-to lesson.
  if (RETURN_TO_CREATE_ARTIFACT_RE.test(userText.trim())) {
    return returnToCreateArtifactFailSafe();
  }

  // Parked-Create detours: companion-chat owns the answer. Do not substitute
  // the generic "practical way to approach…" howto lesson.
  if (options?.suppressHowToLesson) {
    switch (decision.primaryHelpMode) {
      case "how_to_guidance":
      case "explanation":
      case "simple_planning":
      case "direct_answer":
      case "research":
        return null;
      default:
        break;
    }
  }

  let body: string;
  switch (decision.primaryHelpMode) {
    // Only genuine procedural intent gets the how-to scaffold. `direct_answer`
    // is the classifier's catch-all (bare replies, unresolved contextual /
    // navigation questions like "where did the strategies go"): it must NOT
    // become a generic how-to lesson — fall through to `default` → null so the
    // normal conversation path handles it.
    case "how_to_guidance":
    case "explanation":
    case "simple_planning":
      body = howToFailSafe(userText, decision);
      break;
    case "advice":
    case "comparison":
      body = adviceFailSafe(userText);
      break;
    case "brainstorming":
      body = brainstormFailSafe(userText);
      break;
    case "troubleshooting":
      body = troubleshootFailSafe(userText);
      break;
    case "research":
      body = [
        howToFailSafe(userText, decision),
        "",
        "For anything that depends on live availability, prices, or current lists, I’ll be honest when I can’t verify it yet — and still give you the stable method.",
      ].join("\n");
      break;
    default:
      return null;
  }

  const offer = capabilityOfferLine(decision);
  return offer ? `${body}\n\n${offer}` : body;
}
