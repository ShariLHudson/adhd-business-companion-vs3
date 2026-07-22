"use client";

import type { ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { FOCUS_LIBRARY_ROOM_BG } from "@/lib/focusLibrary/focusLibraryRoom";

type Props = {
  children: ReactNode;
};

/**
 * Focus Library — full-screen tea-room scene behind the focus resource
 * collection (music, sounds, guided focus, timers, favorites). Its own
 * destination, its own background — never the Focus My Brain conservatory
 * and never Clear My Mind.
 */
export function FocusLibraryRoomShell({ children }: Props) {
  return (
    <div
      className="focus-library-room"
      data-testid="focus-library-room"
      data-focus-library-room="1"
      data-homestead-room="library"
    >
      <CinematicBackground
        preset="focus-my-brain"
        mode="image"
        imageUrl={FOCUS_LIBRARY_ROOM_BG}
        placement="fixed"
        className="focus-library-room__cinematic"
      />
      <div className="focus-library-room__scroll">
        <div className="focus-library-room__center">
          <div className="focus-library-room__workspace companion-glass-panel">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
