"use client";

type ToolSuggestionCardProps = {
  line: string;
  toolEmoji: string;
  toolLabel: string;
  keepTalkingLabel?: string;
  onAccept: () => void;
  onDismiss?: () => void;
  /** When false, only the primary action button is shown. */
  showDismiss?: boolean;
  secondaryEmoji?: string;
  secondaryLabel?: string;
  onSecondaryAccept?: () => void;
};

export function ToolSuggestionCard({
  line,
  toolEmoji,
  toolLabel,
  keepTalkingLabel = "Keep Talking",
  onAccept,
  onDismiss,
  showDismiss = true,
  secondaryEmoji,
  secondaryLabel,
  onSecondaryAccept,
}: ToolSuggestionCardProps) {
  return (
    <div className="rounded-2xl border border-[#1e4f4f]/15 bg-white/90 p-4 shadow-sm">
      <p className="whitespace-pre-line text-center text-base leading-relaxed text-[#6b635a]">
        {line}
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onAccept}
          className="rounded-full bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#163a3a]"
        >
          {toolEmoji} {toolLabel}
        </button>
        {secondaryLabel && onSecondaryAccept ? (
          <button
            type="button"
            onClick={onSecondaryAccept}
            className="rounded-full border border-[#1e4f4f]/20 bg-[#f4f8f8] px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] transition-colors hover:bg-white"
          >
            {secondaryEmoji ? `${secondaryEmoji} ` : ""}
            {secondaryLabel}
          </button>
        ) : null}
        {showDismiss && onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-full border border-[#1e4f4f]/30 bg-white/80 px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] transition-colors hover:bg-white"
          >
            {keepTalkingLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
