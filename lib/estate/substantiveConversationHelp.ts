/**
 * Substantive help / content requests that must stay in conversation (PATH A).
 * Never treat these as Estate place-navigation or room-suggestion turns.
 */

/** Business / coaching / planning topics without Estate place intent. */
export const SUBSTANTIVE_HELP_TOPIC_RE =
  /\b(?:pricing|newsletter|subject line|launch plan|revenue|profit|margin|email (?:list|sequence|marketing)|sales page|copywriting|business(?:\s+model|\s+problem|\s+plan)?|value proposition|funnel|webinar|marketing|campaign|facebook|instagram|linkedin|tiktok|ads?\b|advertis(?:e|ing)|strateg(?:y|ies|ize|izing)|brand(?:ing)?|positioning|niche|audience|content plan|go[- ]to[- ]market|gtm|seo|social media|customer retention|retention|grow(?:ing)? (?:my )?(?:email|list|business|audience)|next (?:big )?goal|this quarter|product)\b/i;

/** How-to / find-a-plan phrasing that is coaching help, not room finding. */
export const SUBSTANTIVE_HELP_INTENT_RE =
  /\b(?:how (?:do|can|should|to) i|how (?:do|does|can|should)|what(?:'s| is) (?:a |the )?good\b.{0,40}\b(?:way|approach|strategy|plan)|what should i|help me (?:with|figure|plan|strateg|market|write|create|build|think)|i need (?:to |a |help )?(?:find|figure|plan|strateg|market|write|create|build)|find (?:a |an |my )?(?:strategy|plan|approach|way|campaign)|strategiz(?:e|ing)|need (?:a |help (?:with |on )?)?(?:strategy|marketing|campaign|plan for)|give me ideas|think through|figure out|focus on)\b/i;

/** Explicit rejection of surveys / room menus — stay on the real question. */
export const REJECT_SURVEY_OR_ROOM_MENU_RE =
  /\b(?:not (?:a )?survey|no survey|don'?t (?:want|need) (?:a )?survey|without (?:a )?survey|not (?:a |the )?(?:room|place|estate)|don'?t (?:want|need) (?:a )?(?:room|place)|no (?:rooms?|places?|suggestions?)|not (?:looking for|asking for) (?:a )?(?:room|place|survey)|that(?:'s| is) not what i meant|no,? i want (?:actual |real )?advice|actual advice|real advice)\b/i;

/** Place/mood language — these may still offer rooms even alongside business words. */
const EXPLICIT_PLACE_OR_MOOD_RE =
  /\b(?:quiet place|peaceful place|somewhere quiet|some place|a place to|take me|go to|visit|reading nook|greenhouse|conservatory|estate|soundscape)\b/i;

export function isSubstantiveConversationHelpRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;

  // Explicit space/mood ask wins — allow room suggestions.
  if (EXPLICIT_PLACE_OR_MOOD_RE.test(t) && !REJECT_SURVEY_OR_ROOM_MENU_RE.test(t)) {
    return false;
  }

  if (REJECT_SURVEY_OR_ROOM_MENU_RE.test(t)) {
    return true;
  }
  if (SUBSTANTIVE_HELP_INTENT_RE.test(t) && SUBSTANTIVE_HELP_TOPIC_RE.test(t)) {
    return true;
  }
  if (
    SUBSTANTIVE_HELP_INTENT_RE.test(t) &&
    /\b(?:business|marketing|campaign|strategy|plan|facebook|ads?|brand|goal|retention|pricing|product|email|quarter|grow)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  if (
    SUBSTANTIVE_HELP_TOPIC_RE.test(t) &&
    /\b(?:how|help|need|find|strateg|plan|figure|write|create|build|explain|research|ideas|focus|think|what should)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  return false;
}
