/**
 * Ordinary daily-task recognition (Conversation Quality — Example 1, Stage 2A).
 *
 * Recognizes everyday to-do / errand lists and simple day-planning language so
 * they stay conversational (or become Plan My Day eligible) instead of being
 * claimed by Create, Projects, or Decision Compass.
 *
 * Deliberately self-contained (no imports from the routing/classification
 * stacks) so it can be consulted BEFORE generic doing/build routing and before
 * complexity-based Decision Compass escalation without import cycles.
 *
 * SAFETY: explicit maker / decision / launch intent always wins — an ordinary
 * list that also contains an explicit "create/build/launch/decide" request is
 * NOT treated as ordinary, so the explicit request is preserved.
 */

// Everyday errand / action verbs — the "task-dump" vocabulary the audit found
// missing from the old whitelist (email, call, pick up, pay, buy, schedule,
// text, book, …). Intentionally excludes maker verbs (create/build/design/…).
const EVERYDAY_TASK_VERB_RE =
  /\b(?:e-?mail|call|phone|text|message|pick\s*up|drop\s*off|pay|buy|purchase|order|schedule|re-?schedule|book|cancel|confirm|reply|respond|follow[\s-]?up|send|mail|deposit|submit|renew|sign|return|grab|get|run\s+(?:an?\s+)?errand|finish|complete|wrap\s*up)\b/i;

// "Lots to do" / multi-item day framing.
const LOTS_TO_DO_RE =
  /\b(?:lots|so much|a lot|tons|plenty|a bunch|a ton|too much)\s+(?:to\s+do|to\s+get\s+done|on\s+my\s+(?:plate|list|to-?do))\b|\b(?:several|a few|a couple(?:\s+of)?|multiple|\d+)\s+(?:things|tasks|errands|to-?dos)\b|\b(?:running|have|got)\s+errands\b|\bmy\s+to-?do\s+list\b|\bbusy\s+day\b/i;

// Task-prioritization / "what do I do first" language.
const PRIORITIZE_FIRST_RE =
  /\b(?:what\s+should\s+i\s+(?:do|tackle|start\s+with|work\s+on|focus\s+on)\s+first|figure\s+out\s+what\s+(?:to\s+do|i\s+should\s+do)(?:\s+first)?|where\s+(?:do|should)\s+i\s+(?:start|begin)|what\s+to\s+do\s+first|help\s+me\s+(?:figure\s+out\s+|decide\s+)?what\s+to\s+(?:do|focus\s+on)\s+first|prioriti[sz]e\s+my\s+(?:day|tasks?|list|to-?dos?))\b/i;

// Explicit maker / project / decision / launch intent — must WIN over ordinary
// recognition so it is never suppressed.
const EXPLICIT_MAKER_RE =
  /\b(?:create|build|design|develop|generate|launch|write|draft|make(?:\s+me)?|help\s+me\s+(?:create|build|make|write|draft|design|develop|launch))\s+(?:a|an|the|my|some|this|these|new)?\s*(?:campaign|email\s+campaign|marketing\s+plan|content\s+plan|content|workshop|webinar|course|program|funnel|offer|project|sop|strategy|landing\s+page|sales\s+page|lead\s+magnet|newsletter|proposal|website|template|automation|sequence)\b/i;

const EXPLICIT_PROJECT_RE =
  /\b(?:start|open|create|build|begin)\s+(?:a\s+|an\s+|my\s+|the\s+)?(?:new\s+)?project\b|\bnew\s+project\b/i;

const EXPLICIT_DECISION_RE =
  /\bhelp\s+me\s+decide\b|\b(?:decide|choose)\s+between\b|\bwhich\s+(?:one|option|offer)\s+should\s+i\b|\bshould\s+i\s+(?:choose|pick|go\s+with)\b[\s\S]*\bor\b|\btorn\s+between\b|\bstuck\s+between\b/i;

const EXPLICIT_LAUNCH_RE = /\bshould\s+i\s+launch\b|\blaunch\s+(?:this|my|the|our)\b/i;

// Emotional distress / mental-clutter belong to emotional-first & Clear My Mind
// handling — never reclassify those as an ordinary task list.
const DISTRESS_RE =
  /\b(?:overwhelmed|anxious|anxiety|exhausted|drained|can'?t\s+handle|can'?t\s+cope|panicking|falling\s+apart|shutting\s+down|hopeless|helpless|breaking\s+down)\b/i;

const MENTAL_CLUTTER_RE =
  /\b(?:brain\s+(?:is\s+)?(?:spinning|full|noisy|fried)|head\s+(?:is\s+)?(?:full|spinning|crowded)|too\s+many\s+(?:ideas|thoughts)|all\s+over\s+the\s+place|clear\s+my\s+(?:head|mind)|mental\s+clutter|can'?t\s+think\s+straight)\b/i;

export function hasExplicitMakerOrDecisionIntent(text: string): boolean {
  const t = text.trim();
  return (
    EXPLICIT_MAKER_RE.test(t) ||
    EXPLICIT_PROJECT_RE.test(t) ||
    EXPLICIT_DECISION_RE.test(t) ||
    EXPLICIT_LAUNCH_RE.test(t)
  );
}

/** A multi-item everyday task list (>= 2 clauses that each name an errand verb). */
export function isEverydayTaskListShape(text: string): boolean {
  const clauses = text
    .split(/,|;|\band\b|\bthen\b|\balso\b|\bplus\b/i)
    .map((c) => c.trim())
    .filter((c) => c.length > 2);
  const taskClauses = clauses.filter((c) => EVERYDAY_TASK_VERB_RE.test(c));
  return taskClauses.length >= 2;
}

/**
 * True when the message is an ordinary daily to-do / errand list or simple
 * day-planning / prioritization language — and does NOT carry explicit maker /
 * decision / launch intent, distress, or mental-clutter signals.
 */
export function isOrdinaryDailyTasks(text: string): boolean {
  const t = text.trim();
  if (!t) return false;

  // Explicit maker/decision/launch always wins — never suppress it.
  if (hasExplicitMakerOrDecisionIntent(t)) return false;
  // Leave emotional-first and Clear My Mind handling untouched.
  if (DISTRESS_RE.test(t) || MENTAL_CLUTTER_RE.test(t)) return false;

  // Prioritization language ("what should I do first", "figure out what to do first").
  if (PRIORITIZE_FIRST_RE.test(t)) return true;

  // A multi-item everyday task list.
  if (isEverydayTaskListShape(t)) return true;

  // "Lots to do (today)" / "several things I need to get done".
  if (LOTS_TO_DO_RE.test(t)) return true;

  return false;
}
