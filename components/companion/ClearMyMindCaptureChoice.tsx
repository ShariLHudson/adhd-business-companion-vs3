"use client";

import { useEffect, useMemo, useState } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import {
  CLEAR_MY_MIND_EXIT_LABEL,
  CLEAR_MY_MIND_JOURNAL_LIST_LABEL,
  CLEAR_MY_MIND_NEXT_SECTION,
  CLEAR_MY_MIND_REFLECTION_LEAD,
  clearMyMindCapturedCountLine,
} from "@/lib/clearMyMindCopy";
import {
  analyzeClearMyMindWorkspace,
  type ClearMyMindWorkflowId,
} from "@/lib/clearMyMindWorkspaceIntelligence";

export type ClearMyMindChoiceAction =
  | ClearMyMindWorkflowId
  | "convert"
  | "add-more"
  | "continue-later"
  | "exit"
  | "my-thoughts";

type Props = {
  thoughtCount: number;
  rawThoughts: string[];
  entries?: BrainDumpEntry[];
  saveAck?: string | null;
  analyzing?: boolean;
  onAction: (action: ClearMyMindChoiceAction) => void;
};

/**
 * Clear My Mind after Continue — conversation at the table, not a button panel.
 * Same workflows; quieter presentation.
 */
export function ClearMyMindCaptureChoice({
  thoughtCount,
  rawThoughts,
  entries = [],
  saveAck,
  analyzing = false,
  onAction,
}: Props) {
  const analysis = useMemo(
    () => analyzeClearMyMindWorkspace(entries),
    [entries],
  );
  const [revealPhase, setRevealPhase] = useState<"thinking" | "ready">(
    analyzing || entries.length > 0 ? "thinking" : "ready",
  );

  useEffect(() => {
    if (entries.length === 0) {
      setRevealPhase("ready");
      return;
    }
    setRevealPhase("thinking");
    const id = window.setTimeout(() => setRevealPhase("ready"), 900);
    return () => window.clearTimeout(id);
  }, [entries.length, analysis.insight]);

  const showThinking = revealPhase === "thinking" || analyzing;
  const primary =
    analysis.recommended.find((o) => o.primary) ?? analysis.recommended[0];
  const secondary = analysis.recommended.filter((o) => o.id !== primary?.id);

  function launch(id: ClearMyMindWorkflowId) {
    if (id === "save") {
      onAction("continue-later");
      return;
    }
    onAction(id === "create" ? "convert" : id);
  }

  const journalThoughts =
    rawThoughts.length > 0
      ? rawThoughts
      : entries.map((e) => e.text).filter(Boolean);

  return (
    <section
      className="clear-my-mind-capture-choice clear-my-mind-capture-choice--conversation"
      data-testid="clear-my-mind-capture-choice"
      data-cmind-mode="capture-choice"
      data-cmind-phase={showThinking ? "thinking" : "ready"}
    >
      <p className="clear-my-mind-capture-choice__count">
        {clearMyMindCapturedCountLine(thoughtCount)}
      </p>

      <div className="clear-my-mind-capture-choice__reflection" role="status">
        <p className="clear-my-mind-capture-choice__thinking">
          {showThinking ? analysis.thinkingLine : CLEAR_MY_MIND_REFLECTION_LEAD}
        </p>
        {!showThinking ? (
          <>
            <p className="clear-my-mind-capture-choice__insight">
              {analysis.insight}
            </p>
            {analysis.priorityHeadline ? (
              <p className="clear-my-mind-capture-choice__priority">
                {analysis.priorityHeadline}
              </p>
            ) : null}
          </>
        ) : null}
      </div>

      {saveAck ? (
        <p className="clear-my-mind-capture-choice__ack" role="status">
          {saveAck}
        </p>
      ) : null}

      {journalThoughts.length > 0 ? (
        <div className="clear-my-mind-capture-choice__journal">
          <p className="clear-my-mind-capture-choice__journal-label">
            {CLEAR_MY_MIND_JOURNAL_LIST_LABEL}
          </p>
          <ol className="clear-my-mind-capture-choice__journal-list">
            {journalThoughts.map((thought, index) => (
              <li key={`${index}-${thought.slice(0, 24)}`}>{thought}</li>
            ))}
          </ol>
        </div>
      ) : null}

      {!showThinking ? (
        <div className="clear-my-mind-capture-choice__next">
          <h2 className="clear-my-mind-capture-choice__next-title">
            {CLEAR_MY_MIND_NEXT_SECTION}
          </h2>
          <ul className="clear-my-mind-capture-choice__suggestions">
            {primary && primary.id !== "save" ? (
              <li>
                <button
                  type="button"
                  className="clear-my-mind-capture-choice__suggestion clear-my-mind-capture-choice__suggestion--lead"
                  data-testid={`cmm-workflow-${primary.id}`}
                  onClick={() => launch(primary.id)}
                >
                  {primary.label}
                </button>
              </li>
            ) : null}
            {secondary
              .filter((offer) => offer.id !== "save")
              .map((offer) => (
              <li key={offer.id}>
                <button
                  type="button"
                  className="clear-my-mind-capture-choice__suggestion"
                  data-testid={`cmm-workflow-${offer.id}`}
                  onClick={() => launch(offer.id)}
                >
                  {offer.label}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="clear-my-mind-capture-choice__suggestion"
                data-testid="cmm-add-more-thoughts"
                onClick={() => onAction("add-more")}
              >
                Keep adding thoughts
              </button>
            </li>
            <li>
              <button
                type="button"
                className="clear-my-mind-capture-choice__suggestion clear-my-mind-capture-choice__suggestion--quiet"
                data-testid="cmm-continue-later"
                data-cmind-workflow="save"
                onClick={() => onAction("continue-later")}
              >
                Save these for later
              </button>
            </li>
            <li>
              <button
                type="button"
                className="clear-my-mind-capture-choice__suggestion clear-my-mind-capture-choice__suggestion--quiet"
                data-testid="cmm-my-thoughts"
                onClick={() => onAction("my-thoughts")}
              >
                Look through My Thoughts
              </button>
            </li>
            <li>
              <button
                type="button"
                className="clear-my-mind-capture-choice__suggestion clear-my-mind-capture-choice__suggestion--quiet"
                data-testid="cmm-exit"
                onClick={() => onAction("exit")}
              >
                {CLEAR_MY_MIND_EXIT_LABEL}
              </button>
            </li>
          </ul>
        </div>
      ) : null}
    </section>
  );
}
