"use client";

import type { ReactNode } from "react";
import { PEACEFUL_PLACES_PATHWAY_BG } from "@/lib/peacefulPlaces/pathway";

type Props = {
  children: ReactNode;
  /** Title and signs are baked into the pathway photograph — lighten overlays only. */
  bakedInTitle?: boolean;
  /** Hide baked-in lamppost signs so interactive CSS signs can sit on top. */
  maskBakedSigns?: boolean;
};

/**
 * Phase 1 — true full-viewport Estate background.
 * UI floats on top; no boxed scene container.
 */
export function PeacefulPlacesLandingShell({
  children,
  bakedInTitle = false,
  maskBakedSigns = false,
}: Props) {
  return (
    <div
      className="peaceful-places-landing"
      data-peaceful-places-landing="1"
      data-baked-title={bakedInTitle ? "1" : undefined}
      data-mask-baked-signs={maskBakedSigns ? "1" : undefined}
    >
      <div className="peaceful-places-landing__estate" aria-hidden="true">
        <div
          className="peaceful-places-landing__estate-image"
          style={{ backgroundImage: `url('${PEACEFUL_PLACES_PATHWAY_BG}')` }}
        />
        <div className="peaceful-places-landing__estate-wash" />
        <div className="peaceful-places-landing__estate-quiet" />
        {maskBakedSigns ? (
          <div className="peaceful-places-landing__baked-sign-mute" aria-hidden="true">
            <div className="peaceful-places-landing__baked-sign-mute-pillar peaceful-places-landing__baked-sign-mute-pillar--left" />
            <div className="peaceful-places-landing__baked-sign-mute-pillar peaceful-places-landing__baked-sign-mute-pillar--right" />
            <div className="peaceful-places-landing__baked-sign-foot-mute peaceful-places-landing__baked-sign-foot-mute--left" />
            <div className="peaceful-places-landing__baked-sign-foot-mute peaceful-places-landing__baked-sign-foot-mute--right" />
          </div>
        ) : bakedInTitle ? (
          <div className="peaceful-places-landing__baked-sign-foot-mute-wrap" aria-hidden="true">
            <div className="peaceful-places-landing__baked-sign-foot-mute peaceful-places-landing__baked-sign-foot-mute--left" />
            <div className="peaceful-places-landing__baked-sign-foot-mute peaceful-places-landing__baked-sign-foot-mute--right" />
          </div>
        ) : null}
      </div>

      <div className="peaceful-places-landing__content">{children}</div>
    </div>
  );
}
