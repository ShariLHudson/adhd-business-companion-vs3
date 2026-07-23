"use client";

type Props = {
  onTurnOn: () => void;
  className?: string;
};

/**
 * Calm empty state when Companion is Off — only inside the chat surface,
 * never as a replacement for the Welcome Home daily opening card.
 */
export function CompanionConversationQuietState({
  onTurnOn,
  className = "",
}: Props) {
  return (
    <div
      className={`flex flex-col items-start gap-3 px-1 py-2 ${className}`}
      data-testid="companion-conversation-quiet-state"
    >
      <p className="text-base leading-relaxed text-[#4b463f]">
        Companion conversation is off.
      </p>
      <button
        type="button"
        className="min-h-[44px] rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-base font-semibold text-white hover:bg-[#163d3d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
        onClick={onTurnOn}
        data-testid="companion-turn-on"
      >
        Turn Companion On
      </button>
    </div>
  );
}
