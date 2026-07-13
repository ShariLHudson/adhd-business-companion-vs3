"use client";

import type { ReactNode } from "react";

type Props = {
  title: string;
  purpose: string;
  statusLabel?: string | null;
  statusTone?: "quiet" | "progress" | "review" | "complete";
  onBack: () => void;
  /** Optional single How to Use control in the header row */
  helpControl?: ReactNode;
};

/** Room title + one purpose sentence + optional status badge. */
export function BusinessEstateRoomHeader({
  title,
  purpose,
  statusLabel,
  statusTone = "quiet",
  onBack,
  helpControl,
}: Props) {
  return (
    <header className="business-estate-room-header">
      <div className="business-estate-room-header__top">
        <button
          type="button"
          className="business-estate-section-editor__back"
          onClick={onBack}
        >
          ← Back to My Business Estate
        </button>
        {helpControl ? (
          <div className="business-estate-room-header__help">{helpControl}</div>
        ) : null}
      </div>
      <div className="business-estate-room-header__title-row">
        <h2 className="business-estate-room-header__title">{title}</h2>
        {statusLabel ? (
          <span
            className={`business-estate-room-header__status business-estate-room-header__status--${statusTone}`}
            data-testid="business-estate-room-status"
          >
            {statusLabel}
          </span>
        ) : null}
      </div>
      <p className="business-estate-room-header__purpose">{purpose}</p>
    </header>
  );
}
