import type {
  SparkWelcomeHomeDecision,
  WelcomeHomeSignal,
} from "./types";

const RETURN_RE =
  /\b(?:i'?m back|back again|haven'?t been (?:here|around)|it'?s been a while|long time since|returning|just got back|finally (?:here|back)|coming back)\b/i;

const ABSENCE_SHAME_RE =
  /\b(?:should have been here|feel guilty|abandoned (?:this|it|my)|bad (?:member|user)|failed to (?:show up|come back)|broke my streak|missed (?:days|weeks))\b/i;

const UNFINISHED_GUILT_RE =
  /\b(?:left unfinished|never finished|abandoned (?:my |this |the )?project|fallen behind|so behind|catch up|overdue|unfinished work)\b/i;

const SEASON_SHIFT_RE =
  /\b(?:new season|life changed|everything changed|grieving|healing|new baby|lost (?:someone|my job)|caregiving|burned out|need rest|taking a break)\b/i;

export function evaluateSparkWelcomeHome(input: {
  userText: string;
  isReturning?: boolean;
}): SparkWelcomeHomeDecision {
  const text = input.userText.trim();
  const signals = new Set<WelcomeHomeSignal>();

  if (!text && input.isReturning) {
    return {
      signals: ["returning"],
      isReturnMoment: true,
      reason: "session return — welcome only",
    };
  }

  if (input.isReturning || RETURN_RE.test(text)) {
    signals.add("returning");
  }
  if (ABSENCE_SHAME_RE.test(text)) {
    signals.add("absence_shame");
  }
  if (UNFINISHED_GUILT_RE.test(text)) {
    signals.add("unfinished_guilt");
  }
  if (SEASON_SHIFT_RE.test(text)) {
    signals.add("season_shift");
  }

  const isReturnMoment =
    signals.has("returning") ||
    Boolean(input.isReturning) ||
    signals.has("absence_shame");

  return {
    signals: [...signals],
    isReturnMoment,
    reason: signals.size > 0 ? [...signals].join(", ") : "ongoing presence",
  };
}

export function containsForbiddenAbsenceCopy(text: string): boolean {
  const forbidden = [
    /\bmissed your goals\b/i,
    /\bbroke your streak\b/i,
    /\bhaven'?t logged in for\b/i,
    /\babandoned your project\b/i,
    /\byou were supposed to\b/i,
    /\bwe missed you\b/i,
    /\b(?:\d+)\s+days?\s+since\b/i,
    /\byou fell behind\b/i,
  ];
  return forbidden.some((re) => re.test(text));
}
