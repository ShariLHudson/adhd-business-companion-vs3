"use client";

import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { HomesteadSceneLayers } from "@/components/companion/HomesteadSceneLayers";
import {
  homesteadLivingRoomImageUrl,
  useHomesteadSceneSurfaceProps,
} from "@/lib/homesteadScene";
import { masterLivingRoomImageId } from "@/lib/livingRoomMaster/masterLivingRoom";

/** Fixed living-room homestead background for everyday chat. */
export function HomesteadChatScene() {
  const { surfaceProps } = useHomesteadSceneSurfaceProps({
    surface: "chat",
    welcomePhotographId: masterLivingRoomImageId(),
    className:
      "companion-homestead-chat-scene homestead-scene-surface absolute inset-0",
  });
  const imageUrl = homesteadLivingRoomImageUrl();

  return (
    <div {...surfaceProps} aria-hidden>
      <CinematicBackground
        preset="home"
        mode="image"
        imageUrl={imageUrl}
        placement="absolute"
        gradientStrength={0.55}
        className="companion-homestead-chat-scene__cinematic"
        mediaClassName="companion-welcome-scene__art companion-homestead-chat-scene__art"
      />
      <HomesteadSceneLayers />
      <div className="companion-homestead-chat-scene__wash" aria-hidden />
      <div className="companion-homestead-chat-scene__veil" aria-hidden />
    </div>
  );
}
