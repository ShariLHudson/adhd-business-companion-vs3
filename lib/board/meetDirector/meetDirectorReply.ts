/**
 * Meet This Director replies — one Director's perspective only.
 * Never synthesizes Board consensus or other Directors' views.
 */

import type { BoardDirectorDefinition } from "@/lib/board/types";
import {
  boardPossessiveMatter,
  resolveAddressNameForBoard,
  type BoardPersonalizationOptions,
} from "@/lib/board/resolveBoardAddressName";

const BOARD_CONSENSUS_GUARD =
  /\b(the board (agrees|thinks|recommends)|as a board|we all agree|board consensus)\b/i;

/**
 * Build a private Meet reply grounded only in this Director's lens.
 * Chair lens: clarify decision, long-term consequences, agreement/disagreement —
 * never decide for the member; may suggest Board, Chamber (implementation), or research.
 */
export function craftMeetDirectorReply(
  director: BoardDirectorDefinition,
  memberText: string,
  personalization?: BoardPersonalizationOptions,
): string {
  const trimmed = memberText.trim();
  const addressName = resolveAddressNameForBoard(personalization);
  const questionMatter = boardPossessiveMatter(addressName, "question");
  const withAddress = (sentence: string) =>
    addressName ? `${addressName}, ${sentence}` : sentence;

  if (!trimmed) {
    return (
      withAddress(
        `From my seat as ${director.boardRole}, I need a clearer sense of ${questionMatter}. `,
      ) + (director.questionsAsked[0] ?? "What decision are we examining?")
    );
  }

  const lower = trimmed.toLowerCase();
  const wantsImplement =
    /\b(implement|build|execute|how do i|write the|draft the)\b/.test(lower);
  const wantsOutsideInfo =
    /\b(research|market|competitor|what are others|data|benchmark)\b/.test(
      lower,
    );
  const wantsManyViews =
    /\b(everyone|whole board|several perspectives|all directors|disagree)\b/.test(
      lower,
    ) || trimmed.length > 280;

  if (wantsImplement) {
    return (
      `That sounds like implementation work. I can help you examine whether this is the right decision first. ` +
      `When you're ready to build it, a Chamber specialist is the better place — not the Boardroom. ` +
      (director.questionsAsked[0] ?? "What decision are we actually making?")
    );
  }

  if (wantsOutsideInfo) {
    return (
      `Current outside information would help before the Board leans too hard in one direction. ` +
      `I recommend gathering that research, then returning so we can weigh long-term consequences with clearer facts. ` +
      `Meanwhile — what decision are you trying to make with that information?`
    );
  }

  if (wantsManyViews || director.id === "board-chair") {
    const lens = director.decisionLens.slice(0, 2).join(" and ");
    const question =
      director.questionsAsked[0] ?? "What decision are we actually making?";
    const parts = [
      withAddress(
        `We are evaluating ${questionMatter}. Looking through ${lens}: let's clarify the actual decision before we rush.`,
      ),
      `I'd want us to name where we agree, where we still differ, and what must remain true a year from now.`,
      wantsManyViews
        ? `If several perspectives are needed, take this to a Board discussion — I'll chair, and we won't pretend one voice is the whole table.`
        : `I won't make this choice for you — my role is clarity and a usable recommendation.`,
      question,
    ];
    let reply = parts.join(" ");
    if (BOARD_CONSENSUS_GUARD.test(reply)) {
      reply = `I can only speak for myself as ${director.boardRole}. ${question}`;
    }
    return reply;
  }

  const lens = director.decisionLens.slice(0, 2).join(" and ");
  const question =
    director.questionsAsked.find((q) =>
      /\b(decision|fit|sustain|risk|cost|true)\b/i.test(q),
    ) ??
    director.questionsAsked[0] ??
    "What must be true for this to succeed?";

  const watch = director.watchesFor[0];
  const parts = [
    withAddress(
      `Speaking only from my perspective as ${director.shortRole} — I look at ${questionMatter} through ${lens}.`,
    ),
    watch
      ? `I would watch carefully for ${watch} before moving ahead.`
      : null,
    question,
  ].filter(Boolean) as string[];

  let reply = parts.join(" ");
  if (BOARD_CONSENSUS_GUARD.test(reply)) {
    reply = `I can only speak for myself as ${director.boardRole}. ${question}`;
  }
  return reply;
}
