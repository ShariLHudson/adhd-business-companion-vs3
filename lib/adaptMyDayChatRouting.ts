/**
 * Chat routing for Adapt My Day / energy mismatch signals.
 */

const ADAPT_MY_DAY_INTENT_RE =
  /\b(?:adapt my day|adjust my day|today changed|energy (?:is )?low|feel(?:ing)? sluggish|sluggish (?:this )?morning|rough morning|low energy today|didn'?t sleep well|felt great last night|morning feels (?:off|different|hard)|not much energy|no energy this morning|need to adapt|rebuild today)\b/i;

export function isAdaptMyDayIntent(text: string): boolean {
  return ADAPT_MY_DAY_INTENT_RE.test(text.trim());
}

export function adaptMyDayOfferLine(): string {
  return (
    "Sounds like today isn't matching how you expected to feel. " +
    "Want me to open **Adapt My Day** so we can tune the plan to your real energy?"
  );
}

export function adaptMyDayOpenAck(): string {
  return "Opening **Adapt My Day** — let's update today's reality without guilt.";
}
