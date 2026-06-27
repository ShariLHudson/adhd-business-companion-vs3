"use client";

import { WELCOME_ROOM_INVITATION } from "@/lib/welcomeRoom";

type Props = {
  open: boolean;
  onVisit: () => void;
  onSkip: () => void;
};

/** First-time invitation after onboarding — never shown again once dismissed. */
export function WelcomeRoomInvitation({ open, onVisit, onSkip }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-room-invitation-title"
      data-testid="welcome-room-invitation"
    >
      <div className="w-full max-w-md rounded-2xl border border-[#e4ddd2] bg-[#faf7f2] p-6 shadow-2xl">
        <p
          id="welcome-room-invitation-title"
          className="text-xl font-semibold text-[#1f1c19]"
        >
          {WELCOME_ROOM_INVITATION.headline}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[#4a443c]">
          {WELCOME_ROOM_INVITATION.body}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onSkip}
            className="rounded-full border border-[#d4cdc3] bg-white px-4 py-2.5 text-sm font-semibold text-[#6b635a] hover:bg-[#fff8ef]"
          >
            {WELCOME_ROOM_INVITATION.skipLabel}
          </button>
          <button
            type="button"
            onClick={onVisit}
            className="rounded-full bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163c3c]"
          >
            {WELCOME_ROOM_INVITATION.visitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
