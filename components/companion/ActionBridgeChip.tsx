"use client";

type ActionBridgeChipProps = {
  emoji: string;
  label: string;
  onLaunch: () => void;
};

export function ActionBridgeChip({ emoji, label, onLaunch }: ActionBridgeChipProps) {
  return (
    <button
      type="button"
      onClick={onLaunch}
      className="rounded-full bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#163a3a]"
    >
      {emoji} {label} →
    </button>
  );
}
