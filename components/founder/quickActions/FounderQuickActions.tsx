"use client";

type FounderQuickActionsProps = {
  onAddIssue: () => void;
  onAddExperiment: () => void;
  onCursorPrompt: () => void;
};

const btn =
  "rounded-lg border border-[#d4cdc3] bg-white px-3 py-1.5 text-xs font-semibold text-[#2d2926] shadow-sm hover:bg-[#f5f0e8]";

export function FounderQuickActions({
  onAddIssue,
  onAddExperiment,
  onCursorPrompt,
}: FounderQuickActionsProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      aria-label="Founder quick actions"
    >
      <button type="button" onClick={onAddIssue} className={btn}>
        Add issue
      </button>
      <button type="button" onClick={onAddExperiment} className={btn}>
        Add experiment
      </button>
      <button type="button" onClick={onCursorPrompt} className={btn}>
        Cursor prompt
      </button>
    </div>
  );
}
