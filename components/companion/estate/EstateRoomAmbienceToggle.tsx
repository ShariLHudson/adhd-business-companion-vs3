"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  isEstateAmbienceEnabled,
  setEstateAmbienceEnabled,
} from "@/lib/estate/estateAmbiencePreference";
import { resolveEstateArrivalExperience } from "@/lib/estate/estateArrivalExperience";
import {
  activeEstateAmbienceRoomId,
  kickstartEstateRoomAmbience,
  stopEstateRoomAmbience,
} from "@/lib/estate/estateRoomAmbience";

type Props = {
  roomId: string;
  className?: string;
};

/** Member-controlled room ambience — default off; persists across visits. */
export function EstateRoomAmbienceToggle({ roomId, className }: Props) {
  const [enabled, setEnabled] = useState(false);
  const memberActivatedRef = useRef(false);
  const profile = resolveEstateArrivalExperience(roomId)?.ambience;

  useEffect(() => {
    const stored = isEstateAmbienceEnabled();
    setEnabled(stored);
    memberActivatedRef.current = stored;
  }, []);

  const turnOff = useCallback(() => {
    memberActivatedRef.current = false;
    setEnabled(false);
    setEstateAmbienceEnabled(false);
    void stopEstateRoomAmbience();
  }, []);

  const turnOn = useCallback(() => {
    if (!profile) return;
    memberActivatedRef.current = true;
    setEnabled(true);
    setEstateAmbienceEnabled(true);
    kickstartEstateRoomAmbience(roomId, profile);
  }, [profile, roomId]);

  useEffect(() => {
    if (!profile || !enabled || !memberActivatedRef.current) return;
    if (activeEstateAmbienceRoomId() === roomId) return;
    kickstartEstateRoomAmbience(roomId, profile);
  }, [enabled, profile, roomId]);

  useEffect(() => {
    return () => {
      if (activeEstateAmbienceRoomId() === roomId) {
        void stopEstateRoomAmbience();
      }
    };
  }, [roomId]);

  if (!profile) return null;

  return (
    <button
      type="button"
      className={["estate-room-ambience-toggle", className].filter(Boolean).join(" ")}
      aria-pressed={enabled}
      aria-label={enabled ? "Turn room sound off" : "Turn room sound on"}
      onClick={() => {
        if (enabled) {
          turnOff();
        } else {
          turnOn();
        }
      }}
    >
      <span className="estate-room-ambience-toggle__icon" aria-hidden>
        {enabled ? "♪" : "♪̸"}
      </span>
      <span className="estate-room-ambience-toggle__label">
        {enabled ? "Sound on" : "Sound off"}
      </span>
    </button>
  );
}
