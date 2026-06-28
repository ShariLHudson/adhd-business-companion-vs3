"use client";

import { forwardRef, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { PEACEFUL_PLACES_PATHWAY_BG } from "@/lib/peacefulPlaces/pathway";

type Props = {
  children: ReactNode;
};

/**
 * Positions sign hit targets on the same cover-fitted box as the pathway background.
 */
export const PathwayPhotoSignsLayer = forwardRef<HTMLDivElement, Props>(
  function PathwayPhotoSignsLayer({ children }, ref) {
    const [aspect, setAspect] = useState<number | null>(null);

    useEffect(() => {
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          setAspect(img.naturalWidth / img.naturalHeight);
        }
      };
      img.src = PEACEFUL_PLACES_PATHWAY_BG;
    }, []);

    const plateStyle = {
      "--pathway-image-aspect": String(aspect ?? 1.5),
    } as CSSProperties;

    return (
      <div
        ref={ref}
        className="peaceful-places-pathway-scene__photo-signs"
        data-pathway-signs-ready={aspect ? "1" : undefined}
        style={plateStyle}
      >
        <div className="peaceful-places-pathway-scene__photo-plate">
          <div className="peaceful-places-pathway-scene__photo-plate-inner">
            {aspect ? children : null}
          </div>
        </div>
      </div>
    );
  },
);
