"use client";

import {
  CLEAR_MY_MIND_CONTINUE_PROMPT,
} from "@/lib/clearMyMindCopy";
import { MY_THOUGHTS_OPEN } from "@/lib/thinkingSpace/copy";
import { recordReliefSignal } from "@/lib/reliefIntelligence";

type Props = {
  totalThoughtCount: number;
  sessionShareCount: number;
  sessionId?: string;
  onOpenMyThoughts: () => void;
};

/**
 * Quiet workspace affordance — no portrait, no "safely got" copy in the panel.
 * Organization lives in My Thoughts™; emotional acknowledgment lives in conversation.
 */
export function ClearMyMindCaptureInvite({
  totalThoughtCount,
  sessionShareCount,
  sessionId,
  onOpenMyThoughts,
}: Props) {
  if (totalThoughtCount === 0 && sessionShareCount === 0) {
    return null;
  }

  return (
    <div
      className="companion-workspace-invite companion-fade-in"
      data-testid="clear-my-mind-capture-invite"
    >
      {sessionShareCount > 0 ? (
        <p className="companion-workspace-invite__prompt">
          {CLEAR_MY_MIND_CONTINUE_PROMPT}
        </p>
      ) : null}
      {totalThoughtCount > 0 ? (
        <button
          type="button"
          onClick={() => {
            if (sessionId) {
              recordReliefSignal({
                kind: "opened-my-thoughts",
                sessionId,
              });
            }
            onOpenMyThoughts();
          }}
          className="companion-workspace-invite__link"
          data-testid="open-my-thoughts"
        >
          {MY_THOUGHTS_OPEN}
        </button>
      ) : null}
    </div>
  );
}
