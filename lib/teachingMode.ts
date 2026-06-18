/**
 * Teaching Mode — coach-style learning, not article dumps.
 * Conversation first; one concept at a time; paths before depth.
 */

const TEACHING_VERB_RE =
  /\b(?:teach me|explain(?:\s+to me)?|help me understand|walk me through|tell me about|learn about|learn how)\b/i;

const WHAT_IS_RE =
  /\bwhat(?:'s| is| are)\s+(?:a |an |the )?[\w][\w\s-]{2,60}\b/i;

const SHOW_ME_HOW_RE = /\bshow me how\b/i;

const DETAILED_GUIDE_RE =
  /\b(?:full guide|detailed guide|complete guide|comprehensive(?:\s+guide)?|everything about|deep dive|long explanation|write (?:me )?(?:an? )?(?:article|guide|overview)|give me (?:the )?full|entire guide)\b/i;

const APP_NAV_CONTEXT_RE =
  /\b(?:this app|the app|spark studio|sidebar|settings|momentum games?|clear my mind|focus audio|focus session|templates? library|how do i find|where (?:is|are|do i find)|change the colors?)\b/i;

const TEACHING_MENU_RE =
  /\b(?:would you like|which would you like|pick one|choose one|what sounds most helpful)\b/i;

const TEACHING_PATH_RE =
  /\b(?:simple explanation|real[- ]world example|apply to my business|build (?:one|it|your|my)?\s*together|example using)\b/i;

const PATH_PICK_RE =
  /\b(?:^|\b)(?:1|2|3|4|one|two|three|four|first|second|third|fourth|simple|example|apply|build(?:\s+together)?|business|together)\b/i;

/** User explicitly wants a long guide — allow multi-paragraph output. */
export function isDetailedGuideRequest(text: string): boolean {
  return DETAILED_GUIDE_RE.test(text.trim());
}

/** Business/concept teaching — not app navigation how-to. */
export function isConceptTeachingRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isDetailedGuideRequest(t)) return false;
  if (APP_NAV_CONTEXT_RE.test(t) && !TEACHING_VERB_RE.test(t)) return false;

  if (TEACHING_VERB_RE.test(t)) return true;
  if (WHAT_IS_RE.test(t) && !APP_NAV_CONTEXT_RE.test(t)) return true;
  if (SHOW_ME_HOW_RE.test(t) && !APP_NAV_CONTEXT_RE.test(t)) return true;

  return false;
}

export function isTeachingMenuOffer(lastAssistantText: string): boolean {
  const t = lastAssistantText.trim();
  if (!t) return false;
  return TEACHING_MENU_RE.test(t) && TEACHING_PATH_RE.test(t);
}

/** User is continuing a teaching conversation (picked a path or asked for next piece). */
export function isTeachingContinuation(
  userText: string,
  lastAssistantText = "",
): boolean {
  const u = userText.trim();
  if (!u) return false;
  if (isDetailedGuideRequest(u)) return false;
  if (isTeachingMenuOffer(lastAssistantText) && PATH_PICK_RE.test(u)) {
    return true;
  }
  if (
    /\b(?:next (?:piece|part|step)|keep going|go on|continue|more detail|tell me more)\b/i.test(
      u,
    ) &&
    TEACHING_PATH_RE.test(lastAssistantText)
  ) {
    return true;
  }
  return false;
}

export function teachingModeActive(
  userText: string,
  lastAssistantText = "",
  opts?: { activeWorkflowLocked?: boolean },
): boolean {
  if (opts?.activeWorkflowLocked) return false;
  return (
    isConceptTeachingRequest(userText) ||
    isTeachingContinuation(userText, lastAssistantText)
  );
}

export function teachingModeHintForChat(
  userText: string,
  lastAssistantText = "",
): string {
  const topic = extractTeachingTopic(userText);
  const continuing = isTeachingContinuation(userText, lastAssistantText);
  const buildPath =
    continuing &&
    /\b(?:build|together|4|four|fourth)\b/i.test(userText) &&
    !/\b(?:simple|example|apply|1|2|3|one|two|three)\b/i.test(userText);

  if (buildPath || (continuing && /\bbuild\b/i.test(lastAssistantText))) {
    return [
      "TEACHING MODE — BUILD TOGETHER (mandatory):",
      `Coach ${topic ? `"${topic}"` : "this"} one stage at a time.`,
      "Cover ONE funnel stage (or one step) only — name it, explain it in 1–2 short sentences, ask ONE question about their business.",
      "Wait for their answer before the next stage. Never list all stages at once.",
      "No articles, no bullet essays, no multiple screens of content.",
    ].join("\n");
  }

  if (continuing) {
    const wantsSimple = /\b(?:1|one|simple|explanation)\b/i.test(userText);
    const wantsExample = /\b(?:2|two|example)\b/i.test(userText);
    const wantsApply = /\b(?:3|three|apply|business)\b/i.test(userText);

    if (wantsSimple) {
      return [
        "TEACHING MODE — SIMPLE EXPLANATION (mandatory):",
        "Teach ONE small piece of the concept only (2–4 short sentences max).",
        "End with ONE check-in question or offer the next small piece.",
        "Do NOT cover the whole topic in one reply.",
      ].join("\n");
    }
    if (wantsExample) {
      return [
        "TEACHING MODE — REAL-WORLD EXAMPLE (mandatory):",
        "Give ONE concrete example (their business type if known, otherwise a relatable small business).",
        "Keep it short — a mini story, not a case study essay.",
        "End with ONE question about how it maps to them.",
      ].join("\n");
    }
    if (wantsApply) {
      return [
        "TEACHING MODE — APPLY TO BUSINESS (mandatory):",
        "Ask ONE question about their offer, audience, or current setup before advising.",
        "After they answer, give ONE applied insight — not a full strategy doc.",
      ].join("\n");
    }

    return [
      "TEACHING MODE — CONTINUE (mandatory):",
      "Stay in coach mode: one concept, one step, one question.",
      "No lectures, no multi-section articles, no repeating what you already explained.",
    ].join("\n");
  }

  return [
    "TEACHING MODE (mandatory — conversation first, not an article):",
    `The user wants to learn${topic ? ` about **${topic}**` : ""}.`,
    "Step 1: ONE simple sentence — the core idea in plain language (no jargon wall).",
    "Step 2: Offer exactly these numbered paths (nothing else before they choose):",
    "1. Simple explanation (one piece at a time)",
    "2. Real-world example",
    "3. Apply to my business",
    "4. Build one together",
    "Do NOT write a long guide, essay, or multi-section article on this turn.",
    "Do NOT explain the whole topic — wait for their path choice.",
    "After teaching a beat (or when they pick Apply / Build together), offer to open the matching workspace beside chat — Client Avatar, Create, Strategies, or Projects.",
    "Article-length content ONLY if they explicitly asked for a detailed/full guide.",
  ].join("\n");
}

export function extractTeachingTopic(text: string): string | null {
  const t = text.trim();
  const patterns = [
    /\bteach me(?:\s+about)?\s+(.+?)(?:[.?!]|$)/i,
    /\bexplain(?:\s+to me)?\s+(.+?)(?:[.?!]|$)/i,
    /\bhelp me understand\s+(.+?)(?:[.?!]|$)/i,
    /\bwhat(?:'s| is| are)\s+(?:a |an |the )?(.+?)(?:[.?!]|$)/i,
    /\btell me about\s+(.+?)(?:[.?!]|$)/i,
  ];
  for (const re of patterns) {
    const m = t.match(re);
    const topic = m?.[1]?.trim();
    if (topic && topic.length >= 3 && topic.length <= 80) {
      return topic.replace(/\s+and how\b.*$/i, "").trim();
    }
  }
  return null;
}
