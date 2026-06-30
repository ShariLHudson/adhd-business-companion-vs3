"use client";

type Props = {
  onBack: () => void;
  label?: string;
};

export function GrowPanelBackButton({ onBack, label = "Grow" }: Props) {
  return (
    <button
      type="button"
      className="journal-room__back grow-room__back"
      onClick={onBack}
      data-testid="grow-panel-back"
    >
      ← {label}
    </button>
  );
}
