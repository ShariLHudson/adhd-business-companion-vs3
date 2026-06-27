"use client";

import type { ReactNode } from "react";
import {
  FOCUS_MY_BRAIN_ROOM_BG,
  FOCUS_MY_BRAIN_ROOM_BG_FRAME,
} from "@/lib/focusMyBrain/focusRoom";

type Props = {
  children: ReactNode;
};

/**
 * Full-screen Focus My Brain room — background is the page; workspace floats on top.
 */
export function FocusMyBrainRoomShell({ children }: Props) {
  return (
    <div
      className="focus-my-brain-room"
      data-testid="focus-my-brain-room"
      data-focus-my-brain="1"
    >
      <div
        className="focus-my-brain-room__bg"
        style={{
          backgroundImage: `url(${FOCUS_MY_BRAIN_ROOM_BG})`,
          backgroundPosition: FOCUS_MY_BRAIN_ROOM_BG_FRAME.position,
          transform: `scale(${FOCUS_MY_BRAIN_ROOM_BG_FRAME.scale})`,
          transformOrigin: FOCUS_MY_BRAIN_ROOM_BG_FRAME.transformOrigin,
          backgroundColor: FOCUS_MY_BRAIN_ROOM_BG_FRAME.edgeFill,
        }}
        aria-hidden
      />
      <div className="focus-my-brain-room__scroll">
        <div className="focus-my-brain-room__center">
          <div className="focus-my-brain-room__workspace">{children}</div>
        </div>
      </div>
    </div>
  );
}
