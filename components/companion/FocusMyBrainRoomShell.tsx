"use client";

import { useEffect, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { HomesteadRoomSignatureMotion } from "@/components/companion/homesteadRoom/HomesteadRoomSignatureMotion";
import {
  FOCUS_BUTTERFLY_POSTER,
  FOCUS_BUTTERFLY_VIDEO,
  FOCUS_MY_BRAIN_ROOM_BG,
} from "@/lib/focusMyBrain/focusRoom";

type Props = {
  children: ReactNode;
  videoPlayKey?: number;
  workspaceHidden?: boolean;
  workspaceWide?: boolean;
  /** Hub landing — full-bleed video with bottom choice cards only. */
  hubOverlay?: boolean;
  /** Workflow — compact frosted panel over the butterfly video. */
  workflow?: boolean;
  /** Guided workflow — compact floating card over full-screen conservatory video. */
  floatingWorkflow?: boolean;
  /** @deprecated Use floatingWorkflow — bottom desk removed from guided workflows. */
  interactionDock?: boolean;
};

const VIDEO_FALLBACK = `url('${FOCUS_BUTTERFLY_POSTER}'), url('${FOCUS_MY_BRAIN_ROOM_BG}')`;

/**
 * Full-screen Focus My Brain sanctuary — butterfly video is the room;
 * guided workflows use a centered floating card over the butterfly video.
 */
export function FocusMyBrainRoomShell({
  children,
  videoPlayKey = 0,
  workspaceHidden = false,
  workspaceWide = false,
  hubOverlay = false,
  workflow = false,
  floatingWorkflow = false,
  interactionDock = false,
}: Props) {
  const useFloatingWorkflow = floatingWorkflow || interactionDock;

  useEffect(() => {
    if (!hubOverlay) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = FOCUS_BUTTERFLY_VIDEO;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [hubOverlay]);

  if (hubOverlay) {
    return (
      <div
        className="focus-my-brain-room focus-my-brain-room--hub-landing"
        data-testid="focus-my-brain-room"
        data-focus-my-brain="1"
        data-focus-view="hub-landing"
        data-homestead-room="sunroom"
      >
        <CinematicBackground
          preset="focus-my-brain"
          mode="video"
          videoSrc={FOCUS_BUTTERFLY_VIDEO}
          playKey={videoPlayKey}
          poster={FOCUS_BUTTERFLY_POSTER}
          fallbackBackground={VIDEO_FALLBACK}
          placement="absolute"
          className="focus-my-brain-room__cinematic"
        />
        {children}
      </div>
    );
  }

  if (useFloatingWorkflow) {
    return (
      <div
        className="focus-my-brain-room focus-my-brain-room--floating-workflow"
        data-testid="focus-my-brain-room"
        data-focus-my-brain="1"
        data-focus-view="floating-workflow"
        data-homestead-room="sunroom"
      >
        <CinematicBackground
          preset="focus-my-brain"
          mode="video"
          videoSrc={FOCUS_BUTTERFLY_VIDEO}
          playKey={videoPlayKey}
          poster={FOCUS_BUTTERFLY_POSTER}
          fallbackBackground={VIDEO_FALLBACK}
          placement="fixed"
          className="focus-my-brain-room__cinematic"
        />
        <HomesteadRoomSignatureMotion roomId="sunroom" />
        <div className="focus-my-brain-room__floating-stage">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={[
        "focus-my-brain-room",
        workflow ? "focus-my-brain-room--workflow" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="focus-my-brain-room"
      data-focus-my-brain="1"
      data-focus-view={workflow ? "workflow" : "workspace"}
      data-homestead-room="sunroom"
    >
      <CinematicBackground
        preset="focus-my-brain"
        mode="video"
        videoSrc={FOCUS_BUTTERFLY_VIDEO}
        playKey={videoPlayKey}
        poster={FOCUS_BUTTERFLY_POSTER}
        fallbackBackground={VIDEO_FALLBACK}
        placement="fixed"
        className="focus-my-brain-room__cinematic"
      />
      <HomesteadRoomSignatureMotion roomId="sunroom" />
      <div className="focus-my-brain-room__scroll">
        <div
          className={[
            "focus-my-brain-room__center",
            workflow ? "focus-my-brain-room__center--workflow" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div
            className={[
              "focus-my-brain-room__workspace companion-glass-panel",
              workflow ? "focus-my-brain-room__workspace--workflow" : "",
              workspaceWide ? "focus-my-brain-room__workspace--wide" : "",
              workspaceHidden ? "focus-my-brain-room__workspace--hidden" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
