// Classify Shari's suggested micro-actions before routing to tools or timers.
// "Do it now" should help the user take the next tiny step — not auto-start Focus.

import { assistantSuggestedAction } from "./assistedActionBridge";

export type DoItNowKind =
  | "quick-physical"
  | "quick-mental"
  | "work"
  | "focus";

export type DoItNowOffer = {
  kind: DoItNowKind;
  label: string;
  emoji: string;
  /** Short description of the action for waiting / follow-up copy. */
  actionSummary: string;
  /** Original assistant text used for work-action mapping. */
  sourceText: string;
  minutes?: number;
  /** Reply when launching a mental micro-action. */
  mentalReply?: string;
};

const SUGGESTS_ACTION_RE =
  /\b(how about|what if you|you could|try |maybe |want to |could you|one tiny|one small|just one|give (?:that |it )?a try|ready to|do that now|do it now|would you like to)\b/i;

const PHYSICAL_PATTERNS = [
  /\bdrink\s+water\b/i,
  /\bdrink(?:ing)?(?:\s+a)?(?:\s+(?:full\s+)?glass of )?water\b/i,
  /\bglass of water\b/i,
  /\bstretch(?:ing)?(?:\s+your)?(?:\s+arms)?\b/i,
  /\bstand up\b/i,
  /\btake (?:three |a few |five |ten )?(?:slow )?breaths?\b/i,
  /\beat something\b/i,
  /\bopen (?:a |the )?window\b/i,
  /\bclear (?:one |a )?(?:small )?(?:item|thing) (?:from )?(?:your )?desk\b/i,
  /\bstep outside\b/i,
  /\bfresh air\b/i,
  /\bwarm drink\b/i,
  /\bjumping jacks\b/i,
  /\broll your shoulders\b/i,
  /\bpet an animal\b/i,
  /\bwater a plant\b/i,
  /\btidy one\b/i,
  /\blook out a window\b/i,
  /\bsit with (?:your |a )?drink\b/i,
  /\blisten to (?:one |a )?song\b/i,
] as const;

function matchesPhysical(text: string): boolean {
  return PHYSICAL_PATTERNS.some((re) => re.test(text));
}

const MENTAL_RE =
  /\b(write (?:down )?one thought|name one task|choose one priority|pick one (?:email|task|thing)|list three things?|jot (?:down )?one idea|pick one thing to (?:work on|do)|say one thing you(?:'re| are) proud of)\b/i;

const DONE_RE =
  /^(?:done|finished|did it|all done|i'?m back|back now|back|completed|ok done|got it done)\.?$/i;

export function isPhysicalWellnessSuggestion(text: string): boolean {
  return matchesPhysical(text.trim());
}

export function isPhysicalActionText(text: string): boolean {
  return matchesPhysical(text.trim());
}

export function isMentalMicroAction(text: string): boolean {
  return MENTAL_RE.test(text.trim());
}

export function isActionDone(text: string): boolean {
  return DONE_RE.test(text.trim());
}

export function extractExplicitFocusMinutes(text: string): number | null {
  const t = text.trim();
  if (!t) return null;
  if (
    isPhysicalWellnessSuggestion(t) &&
    !/\b(focus|work on|write for|clean(?:\s+up)?(?:\s+your)?\s+inbox for|pomodoro|focus session)\b/i.test(
      t,
    )
  ) {
    return null;
  }

  const patterns = [
    /(\d+)\s*[-–]?\s*min(?:ute)?s?\s+(?:focus|timer|pomodoro|session|block)/i,
    /(?:focus|work|write|clean(?:\s+up)?(?:\s+your)?\s+inbox|timer)\s+(?:for\s+)?(\d+)\s*min/i,
    /timer\s+for\s+(\d+)\s*min/i,
    /(?:set|start|try|run|do)\s+(?:a\s+)?(\d+)\s*[-–]?\s*min(?:ute)?s?\s+(?:focus|timer|session|block)/i,
    /(\d+)\s*minute\s+(?:focus|timer|session)/i,
    /(?:do|try)\s+a\s+(\d+)\s*[-–]?\s*min(?:ute)?s?\s+(?:focus|session)/i,
  ];
  for (const re of patterns) {
    const m = t.match(re);
    if (m?.[1]) {
      return Math.min(180, Math.max(1, parseInt(m[1], 10)));
    }
  }

  if (
    /\b(pomodoro|focus session|focus timer|focus block|timed focus)\b/i.test(t) &&
    /\b(start|try|want|set|run|do)\b/i.test(t)
  ) {
    return 25;
  }

  return null;
}

function summarizePhysical(text: string): string {
  for (const re of PHYSICAL_PATTERNS) {
    const m = text.match(re);
    if (m?.[0]) return m[0];
  }
  return "that small step";
}

function summarizeMental(text: string): string {
  if (/\bname one task\b/i.test(text)) return "name one task";
  if (/\bchoose one priority\b/i.test(text)) return "choose one priority";
  if (/\bpick one email\b/i.test(text)) return "pick one email";
  if (/\blist three\b/i.test(text)) return "list three things";
  if (/\bwrite.*thought\b/i.test(text)) return "write one thought";
  return "your answer";
}

function mentalReplyFor(text: string): string {
  if (/\bname one task\b/i.test(text)) {
    return "What's the one task? Type it here — just a few words is enough.";
  }
  if (/\bchoose one priority\b/i.test(text)) {
    return "Which one feels like the best first priority? Name it here.";
  }
  if (/\bpick one email\b/i.test(text)) {
    return "Which email are you thinking of? Name it or paste the subject line.";
  }
  if (/\blist three\b/i.test(text)) {
    return "List three things — short bullets are fine. I'll wait right here.";
  }
  if (/\bwrite.*thought\b/i.test(text)) {
    return "Write one thought here — whatever is loudest right now.";
  }
  return "Go ahead and answer here in chat — I'll wait.";
}

function suggestsConcreteAction(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return (
    SUGGESTS_ACTION_RE.test(t) ||
    (/\?\s*$/.test(t) &&
      (matchesPhysical(t) || MENTAL_RE.test(t) || extractExplicitFocusMinutes(t) !== null))
  );
}

/** Map Shari's micro-action suggestion → classified Do It Now offer. */
export function detectDoItNowOffer(assistantText: string): DoItNowOffer | null {
  const text = assistantText.trim();
  if (!text || !suggestsConcreteAction(text)) return null;

  const focusMins = extractExplicitFocusMinutes(text);
  if (focusMins !== null) {
    return {
      kind: "focus",
      label: "Do It Now",
      emoji: "⏱",
      actionSummary: `${focusMins}-minute focus session`,
      sourceText: text,
      minutes: focusMins,
    };
  }

  const work = assistantSuggestedAction(text);
  if (work) {
    return {
      kind: "work",
      label: "Do It Now",
      emoji: work.emoji,
      actionSummary: work.title,
      sourceText: text,
    };
  }

  if (matchesPhysical(text)) {
    return {
      kind: "quick-physical",
      label: "Do It Now",
      emoji: "💧",
      actionSummary: summarizePhysical(text),
      sourceText: text,
    };
  }

  if (MENTAL_RE.test(text)) {
    return {
      kind: "quick-mental",
      label: "Do It Now",
      emoji: "💭",
      actionSummary: summarizeMental(text),
      sourceText: text,
      mentalReply: mentalReplyFor(text),
    };
  }

  return null;
}

export function physicalWaitLaunchMessage(): string {
  return "Go ahead. I'll wait here. Type **done** when you're back.";
}

export function physicalDoneFollowUp(): string {
  return "Good. Did that help even a little?";
}

export function doItNowHintForChat(offer: DoItNowOffer): string {
  if (offer.kind === "quick-physical") {
    return (
      `DO IT NOW (physical micro-action): A "Do It Now" button will appear. ` +
      `If they tap it, the app waits — no timer, no Focus. ` +
      `Do NOT suggest a timer for this. One warm line offering the small step is enough.`
    );
  }
  if (offer.kind === "quick-mental") {
    return (
      `DO IT NOW (mental micro-action): A "Do It Now" button will appear. ` +
      `No timer. They answer in chat. Do NOT open Focus or a workspace unless they ask.`
    );
  }
  if (offer.kind === "work") {
    return (
      `DO IT NOW (work action): A "Do It Now" button will appear. ` +
      `If they accept, offer assisted help in the right workspace — not a timer.`
    );
  }
  return (
    `DO IT NOW (timed focus): A "Do It Now" button will appear for a ${offer.minutes ?? 25}-minute session. ` +
    `Timer is appropriate here because the action itself is timed.`
  );
}
