"use client";

import type { ReactNode } from "react";
import type {
  HospitalityMotionId,
  HospitalityObjectId,
  ResolvedHospitalityScene,
} from "@/lib/companionHospitalityPrototype";
import type { ResolvedCompanionPresence } from "@/lib/companionUniverse/companionPresenceEngine";
import { compositionZoneToStyle } from "@/lib/companionHospitalityPrototype";
import { resolveCompanionPresenceLibraryImage } from "@/lib/companionPresenceLibrary";
import { ASSETS } from "@/lib/companionUi";

type Props = {
  scene: ResolvedHospitalityScene;
  preparationLine?: string | null;
  seasonTransition?: boolean;
  presence?: ResolvedCompanionPresence;
  children?: ReactNode;
};

function hasMotion(motion: HospitalityMotionId[], id: HospitalityMotionId): boolean {
  return motion.includes(id);
}

function hospitalityLabel(id: HospitalityObjectId): string {
  return id.replace(/-/g, " ");
}

export function HospitalityLivingRoom({
  scene,
  preparationLine,
  seasonTransition,
  presence,
  children,
}: Props) {
  const showShariImage = presence?.showShariImage ?? true;
  const src =
    showShariImage &&
    (resolveCompanionPresenceLibraryImage("chat-welcome", scene.companionImageId) ??
      resolveCompanionPresenceLibraryImage("chat-welcome"));

  const copyStyle = compositionZoneToStyle(scene.composition.safeZones.copyPanel);
  const chatStyle = compositionZoneToStyle(scene.composition.safeZones.chat);
  const logoStyle = scene.composition.safeZones.logo
    ? compositionZoneToStyle(scene.composition.safeZones.logo)
    : undefined;

  const preparedItems = scene.hospitality.map(hospitalityLabel).join(" · ");
  const shelfLine =
    scene.books.length > 0 ? scene.books.slice(0, 3).join(" · ") : null;

  return (
    <div
      className={`hospitality-room${scene.reduceMotion ? " hospitality-room--calm" : ""}${
        seasonTransition ? " hospitality-room--season-journey" : ""
      }`}
      data-season={scene.season}
      data-weather={scene.weather}
      data-lighting={scene.lighting}
      data-time-of-day={scene.timeOfDay}
      data-life-event={scene.lifeEvent}
      style={{ ["--room-warmth" as string]: `${scene.warmth}%` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? (
        <img
          src={src}
          alt=""
          className="hospitality-room__photo"
          style={{ objectPosition: scene.composition.photoObjectPosition }}
          draggable={false}
        />
      ) : (
        <div
          className="hospitality-room__photo hospitality-room__photo--environment-only"
          aria-hidden="true"
        />
      )}

      <div className="hospitality-room__atmosphere" aria-hidden="true">
        <div className="hospitality-room__warmth" />
        <div className="hospitality-room__veil" />

        {hasMotion(scene.motion, "sunlight") ? (
          <div className="hospitality-room__sunlight" />
        ) : null}
        {hasMotion(scene.motion, "clouds") ? (
          <div className="hospitality-room__clouds" />
        ) : null}
        {hasMotion(scene.motion, "foliage") ? (
          <div className="hospitality-room__foliage" />
        ) : null}
        {hasMotion(scene.motion, "leaves") ? (
          <div className="hospitality-room__leaves" />
        ) : null}
        {hasMotion(scene.motion, "rain") ? (
          <div className="hospitality-room__rain" />
        ) : null}
        {hasMotion(scene.motion, "snow") ? (
          <div className="hospitality-room__snow" />
        ) : null}
        {hasMotion(scene.motion, "curtains") ? (
          <div className="hospitality-room__curtains" />
        ) : null}
        {hasMotion(scene.motion, "lamplight") ? (
          <div className="hospitality-room__lamplight" />
        ) : null}
        {hasMotion(scene.motion, "butterflies") ? (
          <div className="hospitality-room__butterflies" />
        ) : null}
        {hasMotion(scene.motion, "fireflies") ? (
          <div className="hospitality-room__fireflies" />
        ) : null}
        {hasMotion(scene.motion, "thunder") ? (
          <div className="hospitality-room__thunder" />
        ) : null}
      </div>

      <div className="hospitality-room__conversation">
        <div className="hospitality-room__copy" style={copyStyle}>
          <p className="hospitality-room__atmosphere-line">{scene.atmosphere}</p>
          <h1 className="hospitality-room__greeting scene-heading">
            {scene.greeting}
          </h1>
          <p className="hospitality-room__invite scene-subtitle">{scene.invite}</p>
          {preparationLine ? (
            <p className="hospitality-room__prepared">{preparationLine}</p>
          ) : null}
          {presence?.showEvidenceObjects && presence.evidenceObjects.length > 0 ? (
            <p className="hospitality-room__meta">
              Recently prepared: {presence.evidenceObjects.join(" · ")}
            </p>
          ) : null}
          {preparedItems && !preparationLine ? (
            <p className="hospitality-room__meta">Prepared: {preparedItems}</p>
          ) : null}
          {shelfLine ? (
            <p className="hospitality-room__meta">On the shelf: {shelfLine}</p>
          ) : null}
        </div>
      </div>

      {children ? (
        <div className="hospitality-room__chat" style={chatStyle}>
          {children}
        </div>
      ) : null}

      {scene.showLogo ? (
        <div
          className="hospitality-room__brand"
          style={logoStyle}
          aria-hidden="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ASSETS.logo} alt="" className="hospitality-room__brand-img" />
        </div>
      ) : null}
    </div>
  );
}
