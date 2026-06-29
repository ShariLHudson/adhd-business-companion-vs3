"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { resolvePeacefulPlacesGardenAtmosphere } from "@/lib/peacefulPlaces/gardenAtmosphere";
import { PEACEFUL_PLACES_PATHWAY_BG } from "@/lib/peacefulPlaces/pathway";
import { PeacefulPlacesHeader } from "./PeacefulPlacesHeader";

function usePeacefulPlacesPathwayPreload() {
  useEffect(() => {
    const existing = document.querySelector(
      'link[data-peaceful-places-pathway-preload="1"]',
    );
    if (existing) return;

    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = PEACEFUL_PLACES_PATHWAY_BG;
    link.setAttribute("data-peaceful-places-pathway-preload", "1");
    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, []);
}

type Props = {
  children: ReactNode;
  /** Title and signs are baked into the pathway photograph — mute and overlay CSS title. */
  bakedInTitle?: boolean;
  /** Hide baked-in lamppost signs so interactive CSS signs can sit on top. */
  maskBakedSigns?: boolean;
  /** Play the garden-path arrival sequence when entering from home. */
  arrivalActive?: boolean;
  onArrivalComplete?: () => void;
  /** Hovered garden flag — subtle lantern and flower response. */
  flagHover?: string | null;
  flagHoverSide?: "left" | "right" | null;
  /** Walking toward a selected destination. */
  pathWalking?: boolean;
  pathDeparting?: boolean;
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
  flagHover = null,
  flagHoverSide = null,
  pathWalking = false,
  pathDeparting = false,
}: Props) {
  usePeacefulPlacesPathwayPreload();
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
      data-flag-hover={flagHover ?? undefined}
      data-flag-hover-side={flagHoverSide ?? undefined}
      data-garden-walk={pathWalking ? "1" : undefined}
      data-garden-depart={pathDeparting ? "1" : undefined}
    >
      <div className="peaceful-places-landing__estate" aria-hidden="true">
        <CinematicBackground
          preset="peaceful-places"
          mode="image"
          imageUrl={PEACEFUL_PLACES_PATHWAY_BG}
          placement="fixed"
          className="peaceful-places-landing__cinematic"
          mediaClassName="peaceful-places-landing__estate-image"
        />
        <div className="peaceful-places-landing__estate-light" />
        <div className="peaceful-places-landing__sun-rays" />
        <div className="peaceful-places-landing__season-accent" />
        <div className="peaceful-places-landing__lantern-glow peaceful-places-landing__lantern-glow--left" />
        <div className="peaceful-places-landing__lantern-glow peaceful-places-landing__lantern-glow--right" />
        <div className="peaceful-places-landing__garden-life" aria-hidden="true">
          <span className="peaceful-places-landing__bird peaceful-places-landing__bird--a" />
          <span className="peaceful-places-landing__bird peaceful-places-landing__bird--b" />
          <span className="peaceful-places-landing__butterfly peaceful-places-landing__butterfly--a" />
          <span className="peaceful-places-landing__butterfly peaceful-places-landing__butterfly--b" />
          <span className="peaceful-places-landing__butterfly peaceful-places-landing__butterfly--c" />
        </div>
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

      {bakedInTitle ? <PeacefulPlacesHeader /> : null}

      <div className="peaceful-places-landing__content">{children}</div>
    </div>
  );
}
