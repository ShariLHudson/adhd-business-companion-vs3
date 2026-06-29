"use client";

import type {
  HomesteadRoomId,
  PeacefulPlaceNatureMotion,
} from "@/lib/companionHomestead";

type Props = {
  roomId: HomesteadRoomId;
  /** Peaceful Places only — nature motion for the active destination. */
  natureMotion?: PeacefulPlaceNatureMotion;
};

/**
 * Signature ambient motion layer — sits above the permanent background,
 * below workspace chrome. Living Room lighting is handled by HomesteadSceneLayers.
 */
export function HomesteadRoomSignatureMotion({ roomId, natureMotion }: Props) {
  switch (roomId) {
    case "sunroom":
      return (
        <div className="homestead-room-motion homestead-room-motion--sunroom" aria-hidden>
          <div className="homestead-room-motion__plants" />
          <div className="homestead-room-motion__butterflies">
            <span className="homestead-room-motion__butterfly homestead-room-motion__butterfly--a" />
            <span className="homestead-room-motion__butterfly homestead-room-motion__butterfly--b" />
            <span className="homestead-room-motion__butterfly homestead-room-motion__butterfly--c" />
          </div>
        </div>
      );
    case "game-room":
      return (
        <div className="homestead-room-motion homestead-room-motion--game-room" aria-hidden>
          <div className="homestead-room-motion__sparkles">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      );
    case "study":
      return (
        <div className="homestead-room-motion homestead-room-motion--study" aria-hidden>
          <div className="homestead-room-motion__morning-light" />
        </div>
      );
    case "library":
      return (
        <div className="homestead-room-motion homestead-room-motion--library" aria-hidden>
          <div className="homestead-room-motion__dust">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      );
    case "peaceful-places":
      if (!natureMotion) return null;
      return (
        <div
          className={[
            "homestead-room-motion",
            "homestead-room-motion--peaceful",
            `homestead-room-motion--${natureMotion}`,
          ].join(" ")}
          aria-hidden
          data-peaceful-nature-motion={natureMotion}
        />
      );
    case "living-room":
    default:
      return null;
  }
}
