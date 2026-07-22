"use client";

import { useMemo, useState } from "react";
import type { AppSection } from "@/lib/companionUi";
import type { Strategy } from "@/lib/strategySystem";
import {
  connectStrategyStepToPlanMyDay,
  connectStrategyStepToReminder,
  connectStrategyToProject,
  connectStrategyToRhythm,
} from "@/lib/strategyLibrary/strategyConnections";
import { pickActiveProject } from "@/lib/strategyLibrary/pickActiveProject";
import {
  shouldOfferBoardReview,
  shouldOfferVisualThinking,
} from "@/lib/strategyLibrary/strategyDetailTemplate";
import {
  buildCallTheBoardContext,
  prepareCallTheBoard,
} from "@/lib/board/callTheBoard";

type Props = {
  strategy: Strategy;
  onOpen?: (section: AppSection) => void;
  onAsk?: (prompt: string) => void;
  onSaved?: () => void;
  onSaveStrategy?: () => void;
  /** Show after Use This Strategy — Prompt 143 action footer */
  activated?: boolean;
  showOptionalReviews?: boolean;
};

/**
 * Prompt 143 action footer — after activation:
 * Add to Today's Plan · Connect to Current Project · Save · Ask Shari · More…
 * Never silently creates a Project.
 */
export function StrategyExecutionConnections({
  strategy,
  onOpen,
  onAsk,
  onSaved,
  onSaveStrategy,
  activated = false,
  showOptionalReviews = true,
}: Props) {
  const [notice, setNotice] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [offerNewProject, setOfferNewProject] = useState(false);
  const currentFocus = useMemo(() => pickActiveProject(), []);

  function run(fn: () => { ok: boolean; message: string; needsProjectChoice?: boolean }) {
    const result = fn();
    setNotice(result.message);
    if (!result.ok && "needsProjectChoice" in result && result.needsProjectChoice) {
      setOfferNewProject(true);
    }
  }

  if (!activated) {
    return null;
  }

  return (
    <div
      className="mt-4 rounded-2xl border border-[#1e4f4f]/20 bg-[#1e4f4f]/[0.03] p-4"
      data-testid="strategy-execution-connections"
      data-activated="true"
    >
      <p className="text-base font-semibold text-[#1f1c19]">What next?</p>
      <p className="mt-1 text-sm leading-relaxed text-[#4b463f]">
        One clear path at a time. Nothing else is created until you choose.
      </p>
      {currentFocus ? (
        <p
          className="mt-2 text-sm text-[#1e4f4f]"
          data-testid="strategy-current-focus-hint"
        >
          Current Focus: {currentFocus.name}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <ActionButton
          testId="strategy-connect-plan-my-day"
          label="Add to Today's Plan"
          primary={false}
          onClick={() =>
            run(() => connectStrategyStepToPlanMyDay(strategy, 0))
          }
        />
        <ActionButton
          testId="strategy-connect-project"
          label="Connect to Current Project"
          primary={false}
          onClick={() => run(() => connectStrategyToProject(strategy))}
        />
        {onSaveStrategy ? (
          <ActionButton
            testId="strategy-connect-save"
            label="Save"
            primary={false}
            onClick={() => {
              onSaveStrategy();
              setNotice("Saved to your strategies.");
              onSaved?.();
            }}
          />
        ) : null}
        {onAsk ? (
          <ActionButton
            testId="strategy-connect-shari"
            label="Ask Shari"
            primary={false}
            onClick={() =>
              onAsk(
                `Help me apply “${strategy.title}” to my situation right now.`,
              )
            }
          />
        ) : null}
        <ActionButton
          testId="strategy-connect-more"
          label={moreOpen ? "Less" : "More…"}
          primary={false}
          onClick={() => setMoreOpen((v) => !v)}
        />
      </div>

      {offerNewProject ? (
        <div
          className="mt-3 rounded-xl border border-[#e7dfd4] bg-white/90 px-3 py-3"
          data-testid="strategy-new-project-offer"
        >
          <p className="text-sm text-[#4b463f]">
            Would you like to start a new Project for this strategy?
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <ActionButton
              testId="strategy-create-new-project"
              label="Start a New Project"
              primary
              onClick={() => {
                run(() =>
                  connectStrategyToProject(strategy, { createNew: true }),
                );
                setOfferNewProject(false);
              }}
            />
            {onOpen ? (
              <ActionButton
                testId="strategy-open-projects"
                label="Open Projects"
                primary={false}
                onClick={() => onOpen("projects")}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {moreOpen ? (
        <div
          className="mt-3 flex flex-wrap gap-2 border-t border-[#e7dfd4] pt-3"
          data-testid="strategy-connect-more-panel"
        >
          <ActionButton
            testId="strategy-connect-reminder"
            label="Create Reminder"
            primary={false}
            onClick={() =>
              run(() => connectStrategyStepToReminder(strategy, 0))
            }
          />
          <ActionButton
            testId="strategy-connect-rhythm"
            label="Create Rhythm"
            primary={false}
            onClick={() => run(() => connectStrategyToRhythm(strategy))}
          />
          {showOptionalReviews && shouldOfferBoardReview(strategy) ? (
            <ActionButton
              testId="strategy-connect-board"
              label="Call the Board"
              primary={false}
              onClick={() => {
                const payload = buildCallTheBoardContext({
                  source: "strategy",
                  strategyId: strategy.id,
                  strategyTitle: strategy.title,
                  projectId: currentFocus?.id ?? null,
                  projectName: currentFocus?.name ?? null,
                  projectFocus: currentFocus?.name ?? null,
                  workTitle: strategy.title,
                });
                prepareCallTheBoard(payload);
                setNotice(
                  "Bringing this strategy to the Round Table with your Current Focus.",
                );
                onOpen?.("boardroom");
                onAsk?.(
                  `I'd like the Board to review my strategy “${strategy.title}”.`,
                );
              }}
            />
          ) : null}
          {showOptionalReviews && shouldOfferVisualThinking(strategy) ? (
            <ActionButton
              testId="strategy-connect-visualize"
              label="Visualize This"
              primary={false}
              onClick={() => {
                setNotice(
                  "A visual can help when the steps feel tangled — you can stay in this strategy view if you prefer.",
                );
                onOpen?.("visual-focus");
              }}
            />
          ) : null}
        </div>
      ) : null}

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
  primary,
}: {
  label: string;
  onClick: () => void;
  testId: string;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={
        primary
          ? "rounded-full bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
          : "rounded-full border border-[#1e4f4f]/30 bg-white px-3 py-1.5 text-sm font-medium text-[#1e4f4f] hover:bg-[#1e4f4f]/[0.06]"
      }
    >
      {label}
    </button>
  );
}
