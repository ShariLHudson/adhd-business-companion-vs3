"use client";

import { NAV_CHAT } from "@/lib/navigationBack";

type Props = {
  onBack: () => void;
  onBackToChat: () => void;
  className?: string;
};

/**
 * Global navigation — Previous Screen and Back to Chat (relationship).
 */
export function EcosystemNavigationBar({
  onBack,
  onBackToChat,
  className = "",
}: Props) {
  return (
    <nav
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`}
      aria-label="Navigation"
      data-testid="ecosystem-navigation-bar"
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4f4f] transition-colors hover:text-[#163c3c] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
        data-testid="app-back-button"
        aria-label="Previous Screen"
      >
        <span aria-hidden="true">←</span>
        <span>Previous Screen</span>
      </button>
      <button
        type="button"
        onClick={onBackToChat}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6b635a] transition-colors hover:text-[#1e4f4f] hover:underline"
        data-testid="back-to-chat-button"
      >
        <span aria-hidden="true">←</span>
        <span>Back to {NAV_CHAT}</span>
      </button>
    </nav>
  );
}
