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

function networkingHowTo(): string {
  return [
    "Walking into a room where you don’t know anyone is much easier when you make it low-pressure on yourself.",
    "",
    "Arrive early — the room is quieter and it’s simpler to start a conversation before groups close up. Look for someone standing on their own rather than trying to break into a tight circle.",
    "",
    "Open with something genuine and easy: a question about them or the event (“First time here too?” or “What brought you today?”). People remember curiosity far more than a polished pitch, so ask and listen more than you talk.",
    "",
    "You don’t need to meet everyone. A few real conversations beat a stack of business cards — note the two or three people you actually connected with, and follow up within a day or two.",
  ].join("\n");
}

/**
 * Questions whose correct answer depends on current law, jurisdiction, medicine,
 * tax, regulated finance, or physical safety. The fail-safe must not invent
 * these deterministically — it acknowledges and points to the safest next step.
 */
function isHighStakesFactualQuestion(t: string): boolean {
  return (
    /\b(?:legal|lawsuit|sue|sued|attorney|lawyer|liab(?:le|ility)|patent|trademark|copyright|incorporat(?:e|ing|ion)|\bllc\b|s-?corp|c-?corp|compl(?:y|iance)|regulat(?:ion|ory|ed|ions)|licens(?:e|ing|ed)|permit|zoning|contract|nda|gdpr|hipaa|osha)\b/.test(
      t,
    ) ||
    /\b(?:tax|taxes|taxed|irs|deduct(?:ion|ible)?|withhold(?:ing)?|w-?2|1099|vat|payroll tax|sales tax)\b/.test(
      t,
    ) ||
    /\b(?:medical|medicine|medication|symptom|symptoms|diagnos(?:e|is|ed)|disease|illness|dosage|dose|prescription|treat(?:ment)?|therapy|fever|infection|mental health)\b/.test(
      t,
    ) ||
    /\b(?:invest(?:ing|ment)?\s+in\s+(?:stocks?|shares?|crypto|the market|securities)|buy(?:ing)?\s+stocks?|which\s+stock|retirement account|401\(?k\)?|\bira\b|securities|portfolio allocation|cryptocurrenc)\b/.test(
      t,
    )
  );
}

function highStakesSafeFailSafe(text: string): string {
  const subject = subjectPhrase(text);
  return [
    `${subject} is one where the right answer really depends on your specifics — where you are, the rules in force right now, and sometimes details only a qualified professional should weigh in on.`,
    "",
    "I don’t want to give you something that sounds certain but could be wrong, so the safest next step is to check the requirement that applies where you are — and for anything with real legal, tax, medical, or safety stakes, confirm it with a professional before you act on it.",
    "",
    "If you share your location and exactly what you’re trying to accomplish, I can help you line up the right questions to ask and what to have ready.",
  ].join("\n");
}

/**
 * Concise, subject-named subject phrase — strips question scaffolding so the
 * fail-safe never awkwardly echoes the whole question back.
 */
function subjectPhrase(text: string): string {
  let t = text.trim().replace(/\?+$/, "");
  t = t.replace(
    /^(?:what(?:’s|'s| is| are)?\s+(?:the\s+)?(?:best|easiest|right|fastest|simplest)\s+way\s+to\s+|what(?:’s|'s| is| are)?\s+|how\s+(?:do|can|could|would|should)\s+i\s+|how\s+to\s+|how\s+do\s+you\s+|can\s+you\s+(?:help\s+me\s+)?|help\s+me\s+|tell\s+me\s+how\s+to\s+|give\s+me\s+ideas\s+for\s+)/i,
    "",
  );
  t = t.replace(
    /^(?:determine|figure\s+out|understand|know|learn)\s+(?:how\s+to\s+|whether\s+to\s+|the\s+best\s+way\s+to\s+|what\s+)?/i,
    "",
  );
  t = t.replace(/\s+(?:when|where|because|since|and\s+i|but\s+i|if\s+i)\b.*$/i, "");
  t = t.trim();
  if (!t) return "This";
  const capped = t.length > 60 ? `${t.slice(0, 57).trim()}…` : t;
  return capped.charAt(0).toUpperCase() + capped.slice(1);
}

function howToFailSafe(text: string, decision: ShariResponseDecision): string {
  const t = text.toLowerCase();
  if (/\b(?:vendor|booth|table)\b/.test(t)) return vendorBoothHowTo();
  if (/\bfacebook groups?\b/.test(t)) return facebookGroupsHowTo();
  if (/\bstrateg(?:y|ic plan)\b/.test(t)) return strategicPlanHowTo();
  if (/\b(?:loom|screen.?record)\b/.test(t)) return loomVideoHowTo();
  if (
    /\bnetwork(?:ing)?\b/.test(t) ||
    /\bintroduce myself\b/.test(t) ||
    /\bmeet(?:ing)?\s+(?:new\s+)?people\b/.test(t) ||
    /\bwork the room\b/.test(t)
  ) {
    return networkingHowTo();
  }

  // High-stakes factual questions get an honest, non-fabricated safe answer.
  if (isHighStakesFactualQuestion(t)) return highStakesSafeFailSafe(text);

  // Ordinary low-risk how-to: a concise, subject-named starter — no generic
  // "clarify success / prepare / decisions / completion check" template, no
  // awkward echo of the whole question, no compulsory coaching question.
  const subject = subjectPhrase(text);
  const opener =
    decision.answerDepth === "brief"
      ? `${subject} — the quickest way in is to start with the one piece you can act on right now and build from there, rather than lining up every step first.`
      : `${subject} — start with the one piece you can act on today and let it pull the rest along; a first real step usually teaches you more than a perfect plan would.`;
  return [
    opener,
    "",
    "Happy to go specific whenever you want — point me at the part you’re stuck on and I’ll take it from there.",
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
