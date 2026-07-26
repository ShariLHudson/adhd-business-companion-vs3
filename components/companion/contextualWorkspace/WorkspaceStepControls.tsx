"use client";

/**
 * WorkspaceStepControls — the reusable save/navigation bar for Contextual
 * Workspace builders (see ./README.md).
 *
 * Four affordances, always in the same order so the pattern feels identical
 * across builders: Back · Skip for Now · Save Progress · Save and Continue.
 * Nothing forces sequential completion — the member can save one answer and
 * stop, and their draft resumes exactly where they left off.
 */

export type WorkspaceStepControlsProps = {
  onBack: () => void;
  backLabel?: string;
  onSkip: () => void;
  skipLabel?: string;
  onSaveProgress: () => void;
  /** Save Progress is disabled when there is nothing new to save. */
  canSaveProgress: boolean;
  onSaveAndContinue: () => void;
  continueLabel?: string;
  /** Show the calm "Progress saved." confirmation. */
  savedHint?: boolean;
};

export function WorkspaceStepControls({
  onBack,
  backLabel = "Back",
  onSkip,
  skipLabel = "Skip for Now",
  onSaveProgress,
  canSaveProgress,
  onSaveAndContinue,
  continueLabel = "Save and Continue",
  savedHint = false,
}: WorkspaceStepControlsProps) {
  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border-2 border-[#1e4f4f] bg-white/85 px-5 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-white"
        >
          {backLabel}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-xl bg-white/70 px-5 py-2.5 text-sm font-semibold text-[#6b635a] hover:bg-white/90"
        >
          {skipLabel}
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onSaveProgress}
          disabled={!canSaveProgress}
          className="rounded-xl border-2 border-[#1e4f4f]/40 bg-white/85 px-5 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-white disabled:cursor-default disabled:opacity-40"
          data-testid="save-progress"
        >
          Save Progress
        </button>
        <button
          type="button"
          onClick={onSaveAndContinue}
          className="rounded-xl bg-[#1e4f4f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
          data-testid="save-and-continue"
        >
          {continueLabel}
        </button>
      </div>
      <div className="mt-2 h-4 text-right">
        {savedHint && !canSaveProgress ? (
          <span className="text-sm font-medium text-[#1e4f4f]">
            Progress saved.
          </span>
        ) : null}
      </div>
    </div>
  );
}
