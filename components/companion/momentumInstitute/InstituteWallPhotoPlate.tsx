"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { MOMENTUM_INSTITUTE_ROOM_BG } from "@/lib/momentumInstitute/room/instituteRoomRegistry";

/** Default until photograph dimensions load — tuned for drawer-wall art. */
export const MOMENTUM_INSTITUTE_WALL_ASPECT = 16 / 10;

type Props = {
  children: ReactNode;
};

/**
 * Aligns drawer hotspots to the same cover-fitted box as the room background.
 */
export function InstituteWallPhotoPlate({ children }: Props) {
  const [aspect, setAspect] = useState(MOMENTUM_INSTITUTE_WALL_ASPECT);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setAspect(img.naturalWidth / img.naturalHeight);
      }
    };
    img.src = MOMENTUM_INSTITUTE_ROOM_BG;
  }, []);

  const plateStyle = {
    "--institute-wall-aspect": String(aspect),
  } as CSSProperties;

  return (
    <div
      className="institute-wall-photo-plate"
      data-institute-wall-ready="1"
      style={plateStyle}
    >
      <div className="institute-wall-photo-plate__inner">{children}</div>
    </div>
  );
}
