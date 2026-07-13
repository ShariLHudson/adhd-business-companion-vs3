"use client";

import type { ReactNode } from "react";

type Props = {
  header: ReactNode;
  /** Stage accordion — Progress Overview with in-card working experience */
  accordion: ReactNode;
  perspective: ReactNode;
  /** Optional review / saved banners above the accordion */
  notice?: ReactNode;
  /**
   * View-mode only: quiet Begin/Continue when no section is open yet.
   * Edit-mode Save lives inside the open accordion card.
   */
  viewAction?: ReactNode;
};

/**
 * Canonical Business Estate room order:
 * Header → Stage accordion → (optional view action) → Need Another Perspective
 *
 * Working fields live inside the open accordion card — not a separate Working Area.
 */
export function BusinessEstateRoomLayout({
  header,
  accordion,
  perspective,
  notice = null,
  viewAction = null,
}: Props) {
  return (
    <div
      className="business-estate-room-layout"
      data-testid="business-estate-room-layout"
      data-layout="accordion"
    >
      {header}
      {notice}
      {accordion}
      {viewAction}
      <div className="business-estate-room-layout__perspective">
        {perspective}
      </div>
    </div>
  );
}
