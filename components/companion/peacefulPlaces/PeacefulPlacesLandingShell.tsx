"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  PEACEFUL_PLACES_PATHWAY_BG,
  PEACEFUL_PLACES_SUBTITLE,
} from "@/lib/peacefulPlaces";
import { resolvePeacefulPlacesGardenAtmosphere } from "@/lib/peacefulPlaces/gardenAtmosphere";

type Props = {
  children: ReactNode;
  /** Title and signs are baked into the pathway photograph — lighten overlays only. */
  bakedInTitle?: boolean;
  /** Hide baked-in lamppost signs so interactive CSS signs can sit on top. */
  maskBakedSigns?: boolean;
  /** Play the garden-path arrival sequence when entering from home. */
  arrivalActive?: boolean;
  onArrivalComplete?: () => void;
};

/**
 * True full-viewport estate garden — one familiar place across the day.
 */
export function PeacefulPlacesLandingShell({
  children,
  bakedInTitle = false,
  maskBakedSigns = false,
  arrivalActive = false,
  onArrivalComplete,
}: Props) {
  const atmosphere = useMemo(() => resolvePeacefulPlacesGardenAtmosphere(), []);
  const [arrivalPhase, setArrivalPhase] = useState(arrivalActive ? "entering" : "idle");

  useEffect(() => {
    if (!arrivalActive) {
      setArrivalPhase("idle");
      return;
    }
    setArrivalPhase("entering");
    const timer = window.setTimeout(() => {
      setArrivalPhase("settled");
      onArrivalComplete?.();
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [arrivalActive, onArrivalComplete]);

  return (
    <div
      className="peaceful-places-landing"
      data-peaceful-places-landing="1"
      data-baked-title={bakedInTitle ? "1" : undefined}
      data-mask-baked-signs={maskBakedSigns ? "1" : undefined}
      data-garden-light={atmosphere.light}
      data-garden-season={atmosphere.season}
      data-lantern-glow={atmosphere.lanternGlow ? "1" : undefined}
      data-arrival={arrivalPhase !== "idle" ? arrivalPhase : undefined}
    >
      <div className="peaceful-places-landing__estate" aria-hidden="true">
        <div
          className="peaceful-places-landing__estate-image"
          style={{ backgroundImage: `url('${PEACEFUL_PLACES_PATHWAY_BG}')` }}
        />
        <div className="peaceful-places-landing__estate-light" />
        <div className="peaceful-places-landing__sun-rays" />
        <div className="peaceful-places-landing__season-accent" />
        <div className="peaceful-places-landing__lantern-glow peaceful-places-landing__lantern-glow--left" />
        <div className="peaceful-places-landing__lantern-glow peaceful-places-landing__lantern-glow--right" />
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

      {bakedInTitle ? (
        <p className="peaceful-places-landing__invitation">{PEACEFUL_PLACES_SUBTITLE}</p>
      ) : null}

      <div className="peaceful-places-landing__content">{children}</div>
    </div>
  );
}
