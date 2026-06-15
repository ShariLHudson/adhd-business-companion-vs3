"use client";

type CompanionAssistButtonProps = {
  onOpen: () => void;
  label?: string;
  className?: string;
  variant?: "floating" | "inline";
};

/** Optional entry to companion chat while staying in a workspace. */
export function CompanionAssistButton({
  onOpen,
  label = "Ask Shari",
  className = "",
  variant = "floating",
}: CompanionAssistButtonProps) {
  const base =
    variant === "floating"
      ? "fixed bottom-6 right-4 z-20 rounded-full border border-[#1e4f4f]/25 bg-white/95 px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] shadow-md backdrop-blur-sm hover:bg-white sm:right-6"
      : "rounded-full border border-[#1e4f4f]/25 bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f] shadow-sm hover:bg-[#f0f5f5]";

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${label} — open companion beside your workspace`}
      className={`${base} ${className}`.trim()}
    >
      💬 {label}
    </button>
  );
}
