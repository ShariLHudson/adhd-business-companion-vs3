"use client";

import { useEffect, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { STORY_LIBRARY_ROOM_BG } from "@/lib/storyLibrary/storyLibraryRoom";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";
import "@/app/companion/story-library-room.css";

type Props = {
  children: ReactNode;
};

/** Full-screen My Story Library — bright cottage reading room. */
export function StoryLibraryRoomShell({ children }: Props) {
  useEffect(() => {
    preloadRoomBackground(STORY_LIBRARY_ROOM_BG);
  }, []);

  return (
    <div
      className="story-library-room"
      data-testid="story-library-room"
      data-homestead-room="story-library"
    >
      <CinematicBackground
        preset="story-library"
        mode="image"
        imageUrl={STORY_LIBRARY_ROOM_BG}
        imageStyle={roomBackgroundImageStyle(STORY_LIBRARY_ROOM_BG)}
        placement="fixed"
        className="story-library-room__cinematic"
        showBottomFade={false}
        gradientStrength={0}
      />
      <div className="story-library-room__scroll">{children}</div>
    </div>
  );
}
