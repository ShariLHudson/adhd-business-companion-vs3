/**
 * The Member Wins — permanent architecture principle.
 *
 * @see docs/THE_MEMBER_WINS.md
 */

export const THE_MEMBER_WINS_PRINCIPLE_NAME = "The Member Wins" as const;

export const THE_MEMBER_WINS_QUESTION =
  "Does this make life easier for the member?" as const;

export const THE_MEMBER_WINS_PRECEDENCE =
  "This principle takes precedence over implementation convenience, coding simplicity, and traditional software design." as const;

/** Lower-priority concerns that must not override member ease */
export const THE_MEMBER_WINS_YIELDS_TO_MEMBER = [
  "implementation convenience",
  "coding simplicity",
  "traditional software design",
  "developer velocity",
  "technical elegance",
] as const;
