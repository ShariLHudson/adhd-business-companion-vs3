"use client";

export function GrowthPanelBackButton({
  onBack,
  label,
}: {
  onBack: () => void;
  label?: string | null;
}) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-1 rounded-full border border-[#e7d9c8] bg-[#faf7f2] px-3 py-1.5 text-sm font-semibold text-[#2f261f] hover:bg-[#f3ebe0]"
    >
      <span aria-hidden="true">←</span>
      {label ? `Back to ${label}` : "Back"}
    </button>
  );
}
