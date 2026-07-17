"use client";

import { useState } from "react";
import type { AppSection } from "@/lib/companionUi";
import type { Strategy } from "@/lib/strategySystem";
import {
  connectStrategyStepToPlanMyDay,
  connectStrategyStepToReminder,
  connectStrategyToProject,
  connectStrategyToRhythm,
} from "@/lib/strategyLibrary/strategyConnections";
import {
  shouldOfferBoardReview,
  shouldOfferVisualThinking,
} from "@/lib/strategyLibrary/strategyDetailTemplate";

type Props = {
  strategy: Strategy;
  onOpen?: (section: AppSection) => void;
  onAsk?: (prompt: string) => void;
  onSaved?: () => void;
  onSaveStrategy?: () => void;
  /** Show Board / Visualize offers (detail view). */
  showOptionalReviews?: boolean;
};

export function StrategyExecutionConnections({
  strategy,
  onOpen,
  onAsk,
  onSaved,
  onSaveStrategy,
  showOptionalReviews = true,
}: Props) {
  const [notice, setNotice] = useState<string | null>(null);

  function run(fn: () => { ok: boolean; message: string }) {
    const result = fn();
    setNotice(result.message);
  }

  return (
    <div
      className="mt-4 rounded-2xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/[0.03] p-4"
      data-testid="strategy-execution-connections"
    >
      <p className="text-base font-semibold text-[#1f1c19]">
        Connect to real action
      </p>
      <p className="mt-1 text-sm leading-relaxed text-[#4b463f]">
        Nothing is created until you choose. Pick what helps this strategy leave
        the page.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <ActionButton
          testId="strategy-connect-plan-my-day"
          label="Add to Plan My Day"
          onClick={() =>
            run(() => connectStrategyStepToPlanMyDay(strategy, 0))
          }
        />
        <ActionButton
          testId="strategy-connect-project"
          label="Connect to Project"
          onClick={() =>
            run(() => {
              const r = connectStrategyToProject(strategy);
              return r;
            })
          }
        />
        <ActionButton
          testId="strategy-connect-reminder"
          label="Create Reminder"
          onClick={() =>
            run(() => connectStrategyStepToReminder(strategy, 0))
          }
        />
        <ActionButton
          testId="strategy-connect-rhythm"
          label="Create Rhythm"
          onClick={() => run(() => connectStrategyToRhythm(strategy))}
        />
        {onSaveStrategy ? (
          <ActionButton
            testId="strategy-connect-save"
            label="Save Strategy"
            onClick={() => {
              onSaveStrategy();
              setNotice("Saved to your strategies.");
              onSaved?.();
            }}
          />
        ) : null}
        {showOptionalReviews && shouldOfferBoardReview(strategy) ? (
          <ActionButton
            testId="strategy-connect-board"
            label="Review with Board"
            onClick={() => {
              setNotice(
                "Board review is optional — open the Board when you want a stress-test, or stay here.",
              );
              onAsk?.(
                `I'd like the Board to review my strategy “${strategy.title}” — pros, cons, and risks only.`,
              );
            }}
          />
        ) : null}
        {showOptionalReviews && shouldOfferVisualThinking(strategy) ? (
          <ActionButton
            testId="strategy-connect-visualize"
            label="Visualize This"
            onClick={() => {
              setNotice(
                "A visual can help when the steps feel tangled — you can stay in this strategy view if you prefer.",
              );
              onOpen?.("visual-focus");
            }}
          />
        ) : null}
        {onAsk ? (
          <ActionButton
            testId="strategy-connect-shari"
            label="Discuss with Shari"
            onClick={() =>
              onAsk(
                `Help me apply “${strategy.title}” to my situation right now.`,
              )
            }
          />
        ) : null}
      </div>
      {notice ? (
        <p
          className="mt-3 text-sm leading-relaxed text-[#1e4f4f]"
          data-testid="strategy-connection-notice"
          role="status"
        >
          {notice}
        </p>
      ) : null}
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  testId,
}: {
  label: string;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className="rounded-full border border-[#1e4f4f]/30 bg-white px-3 py-1.5 text-sm font-medium text-[#1e4f4f] hover:bg-[#1e4f4f]/[0.06]"
    >
      {label}
    </button>
  );
}
