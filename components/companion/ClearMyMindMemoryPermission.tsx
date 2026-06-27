"use client";

import {
  CLEAR_MY_MIND_MEMORY_ASK,
  CLEAR_MY_MIND_MEMORY_NO,
  CLEAR_MY_MIND_MEMORY_YES,
} from "@/lib/clearMyMindCopy";

type Props = {
  open: boolean;
  onYes: () => void;
  onNo: () => void;
};

export function ClearMyMindMemoryPermission({ open, onYes, onNo }: Props) {
  if (!open) return null;

  return (
    <div
      className="clear-my-mind-memory-permission companion-fade-in"
      data-testid="clear-my-mind-memory-permission"
      role="region"
      aria-label="Remember thoughts"
    >
      <p className="clear-my-mind-memory-permission__text">{CLEAR_MY_MIND_MEMORY_ASK}</p>
      <div className="clear-my-mind-memory-permission__actions">
        <button type="button" onClick={onYes} className="clear-my-mind-memory-permission__yes">
          {CLEAR_MY_MIND_MEMORY_YES}
        </button>
        <button type="button" onClick={onNo} className="clear-my-mind-memory-permission__no">
          {CLEAR_MY_MIND_MEMORY_NO}
        </button>
      </div>
    </div>
  );
}
