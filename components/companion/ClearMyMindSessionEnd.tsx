"use client";

import {
  CLEAR_MY_MIND_DONE_LABEL,
} from "@/lib/clearMyMindCopy";

export type ClearMyMindSessionSummary = {
  itemsCaptured: number;
  itemsOrganized?: number;
  projectsCreated: number;
  calendarItems: number;
  waitingItems: number;
  parkingLotItems: number;
  referenceItems: number;
  savedForLater?: number;
};

type Props = {
  summary: ClearMyMindSessionSummary;
  onContinue: () => void;
  onReturnHome: () => void;
  onSaveForLater: () => void;
};

/**
 * Session End — Spark summarizes; member chooses Continue / Return Home / Save for Later.
 */
export function ClearMyMindSessionEnd({
  summary,
  onContinue,
  onReturnHome,
  onSaveForLater,
}: Props) {
  return (
    <section
      className="clear-my-mind-session-end"
      data-testid="clear-my-mind-session-end"
    >
      <h2 className="clear-my-mind-session-end__title">Here&apos;s what we held</h2>
      <ul className="clear-my-mind-session-end__list">
        <li>{summary.itemsCaptured} thoughts captured</li>
        {(summary.itemsOrganized ?? 0) > 0 ? (
          <li>{summary.itemsOrganized} items organized</li>
        ) : null}
        {summary.projectsCreated > 0 ? (
          <li>{summary.projectsCreated} projects created</li>
        ) : null}
        {summary.calendarItems > 0 ? (
          <li>{summary.calendarItems} scheduled items</li>
        ) : null}
        {summary.waitingItems > 0 ? (
          <li>{summary.waitingItems} waiting</li>
        ) : null}
        {summary.parkingLotItems > 0 ? (
          <li>{summary.parkingLotItems} saved for later / someday</li>
        ) : null}
        {summary.referenceItems > 0 ? (
          <li>{summary.referenceItems} research / reference</li>
        ) : null}
        {(summary.savedForLater ?? 0) > 0 ? (
          <li>{summary.savedForLater} archived for later</li>
        ) : null}
      </ul>
      <div className="clear-my-mind-session-end__actions">
        <button type="button" onClick={onContinue} data-testid="cmm-continue">
          Continue
        </button>
        <button type="button" onClick={onReturnHome} data-testid="cmm-return-home">
          Return Home
        </button>
        <button
          type="button"
          onClick={onSaveForLater}
          data-testid="cmm-save-for-later"
        >
          Save for Later
        </button>
      </div>
      <p className="clear-my-mind-session-end__hint">
        Clear My Mind stays open until you choose {CLEAR_MY_MIND_DONE_LABEL.toLowerCase()}{" "}
        exit — your thoughts remain saved.
      </p>
    </section>
  );
}
