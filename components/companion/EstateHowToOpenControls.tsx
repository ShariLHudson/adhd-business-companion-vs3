"use client";

import { useEffect, useState } from "react";
import {
  dismissEstateHowToInvite,
  hasDismissedEstateHowToInvite,
  type EstateHowToGuideContent,
} from "@/lib/estateRoomGuides";

type Props = {
  content: EstateHowToGuideContent;
  onOpen: () => void;
  /** Dark room backgrounds (Chamber gallery) */
  onDark?: boolean;
  className?: string;
};

/** Visible How to Use action + optional dismissible first-visit invite. */
export function EstateHowToOpenControls({
  content,
  onOpen,
  onDark = false,
  className = "",
}: Props) {
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    setShowInvite(!hasDismissedEstateHowToInvite(content.id));
  }, [content.id]);

  function dismissInvite() {
    dismissEstateHowToInvite(content.id);
    setShowInvite(false);
  }

  return (
    <div
      className={`estate-how-to-open-controls ${className}`.trim()}
      data-testid={`estate-how-to-open-controls-${content.id}`}
    >
      <button
        type="button"
        className={`estate-how-to-open-action${
          onDark ? " estate-how-to-open-action--on-dark" : ""
        }`}
        onClick={onOpen}
        data-testid={`estate-how-to-open-${content.id}`}
        aria-label={content.openActionLabel}
      >
        {content.openActionLabel}
      </button>
      {showInvite ? (
        <div
          className={`estate-how-to-invite${
            onDark ? " estate-how-to-invite--on-dark" : ""
          }`}
          data-testid={`estate-how-to-invite-${content.id}`}
        >
          <p className="estate-how-to-invite__label">{content.firstVisitInvite}</p>
          <button
            type="button"
            className="estate-how-to-invite__open"
            onClick={onOpen}
            data-testid={`estate-how-to-invite-open-${content.id}`}
          >
            Open How to Use
          </button>
          <button
            type="button"
            className="estate-how-to-invite__dismiss"
            onClick={dismissInvite}
            data-testid={`estate-how-to-invite-dismiss-${content.id}`}
          >
            Dismiss
          </button>
        </div>
      ) : null}
    </div>
  );
}
