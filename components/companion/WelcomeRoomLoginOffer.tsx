"use client";

import { WELCOME_ROOM_LOGIN_OFFER } from "@/lib/welcomeRoom";

type Props = {
  onVisit: () => void;
  onDismiss: () => void;
};

/** Gentle post-login offer for users who have never visited — not forced. */
export function WelcomeRoomLoginOffer({ onVisit, onDismiss }: Props) {
  return (
    <div
      className="mx-4 mb-3 mt-1 rounded-2xl border border-[#e4ddd2] bg-[#fff8ef] px-4 py-3 sm:mx-6"
      data-testid="welcome-room-login-offer"
      role="region"
      aria-label="Welcome Room invitation"
    >
      <p className="text-sm leading-relaxed text-[#4a443c]">
        {WELCOME_ROOM_LOGIN_OFFER.message}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onVisit}
          className="rounded-full bg-[#1e4f4f] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#163c3c]"
        >
          {WELCOME_ROOM_LOGIN_OFFER.buttonLabel}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full border border-[#d4cdc3] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#6b635a] hover:bg-[#faf7f2]"
        >
          {WELCOME_ROOM_LOGIN_OFFER.dismissLabel}
        </button>
      </div>
    </div>
  );
}
