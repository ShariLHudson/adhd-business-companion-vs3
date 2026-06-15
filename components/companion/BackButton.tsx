"use client";

type BackButtonProps = {
  onClick: () => void;
  label?: string;
  className?: string;
  size?: "default" | "compact";
};

const base =
  "flex items-center gap-1.5 font-bold text-[#1e4f4f] transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]";

const sizes = {
  default:
    "rounded-xl border border-[#1e4f4f]/25 bg-white/80 px-4 py-2.5 text-lg",
  compact: "rounded-lg border border-[#1e4f4f]/20 bg-white/70 px-3 py-1.5 text-sm",
};

/** Consistent one-click back control across panels and workspaces. */
export function BackButton({
  onClick,
  label = "Back",
  className = "",
  size = "default",
}: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`${base} ${sizes[size]} ${className}`.trim()}
    >
      <span className={size === "default" ? "text-2xl leading-none" : "text-xl leading-none"}>
        ‹
      </span>
      {label}
    </button>
  );
}
