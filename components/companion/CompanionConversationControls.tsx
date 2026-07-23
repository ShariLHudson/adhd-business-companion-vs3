"use client";

import {
  companionVisibilityAriaLabel,
  companionVisibilityLabel,
  type CompanionVisibility,
} from "@/lib/conversationVisibility";

type Props = {
  visibility: CompanionVisibility;
  onToggle: () => void;
  onNewChat: () => void;
  onNewDay: () => void;
  onOpenHistory?: () => void;
  /** Compact menu when space is limited */
  compact?: boolean;
  className?: string;
};

const BTN =
  "rounded-lg border border-[#d4cdc3] bg-white/95 px-3 py-2 text-sm font-semibold text-[#1f1c19] hover:border-[#1e4f4f]/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f] min-h-[44px]";

/**
 * Conversation-area controls — New Chat, New Day, Companion On/Off.
 * Visible text labels only (never icon-only).
 */
export function CompanionConversationControls({
  visibility,
  onToggle,
  onNewChat,
  onNewDay,
  onOpenHistory,
  compact = false,
  className = "",
}: Props) {
  const pressed = visibility === "on";
  const label = companionVisibilityLabel(visibility);
  const aria = companionVisibilityAriaLabel(visibility);

  if (compact) {
    return (
      <div
        className={`flex flex-wrap items-center gap-2 ${className}`}
        data-testid="companion-conversation-controls"
      >
        <label className="sr-only" htmlFor="companion-conversation-menu">
          Conversation
        </label>
        <select
          id="companion-conversation-menu"
          className={`${BTN} max-w-full`}
          defaultValue=""
          aria-label="Conversation"
          onChange={(e) => {
            const v = e.target.value;
            e.target.value = "";
            if (v === "new-chat") onNewChat();
            else if (v === "new-day") onNewDay();
            else if (v === "toggle") onToggle();
            else if (v === "history" && onOpenHistory) onOpenHistory();
          }}
          data-testid="companion-conversation-menu"
        >
          <option value="" disabled>
            Conversation
          </option>
          <option value="new-chat">New Chat</option>
          <option value="new-day">New Day</option>
          <option value="toggle">{label}</option>
          {onOpenHistory ? (
            <option value="history">Conversation History</option>
          ) : null}
        </select>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${className}`}
      data-testid="companion-conversation-controls"
      role="toolbar"
      aria-label="Conversation"
    >
      <button
        type="button"
        className={BTN}
        onClick={onNewChat}
        data-testid="companion-control-new-chat"
      >
        New Chat
      </button>
      <button
        type="button"
        className={BTN}
        onClick={onNewDay}
        data-testid="companion-control-new-day"
      >
        New Day
      </button>
      <button
        type="button"
        className={BTN}
        onClick={onToggle}
        aria-pressed={pressed}
        aria-label={aria}
        data-testid="companion-control-visibility"
        data-visibility={visibility}
      >
        {label}
      </button>
      {onOpenHistory ? (
        <button
          type="button"
          className={BTN}
          onClick={onOpenHistory}
          data-testid="companion-control-history"
        >
          Conversation History
        </button>
      ) : null}
    </div>
  );
}
