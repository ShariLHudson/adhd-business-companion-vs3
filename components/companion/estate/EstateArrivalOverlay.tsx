"use client";

import { useEffect, useState } from "react";
import {
  ESTATE_ARRIVAL_HOLD_MS,
  ESTATE_ARRIVAL_MOTTO_FADE_MS,
  ESTATE_ARRIVAL_NAME_FADE_MS,
  ESTATE_ARRIVAL_TITLE_FADE_OUT_MS,
  ESTATE_ARRIVAL_VEIL_MS,
  type EstateArrivalExperienceConfig,
} from "@/lib/estate/estateArrivalExperience";
import { prefersReducedMotion } from "@/lib/welcomeRoom/arrival";

export type EstateArrivalPhase =
  | "veil"
  | "reveal"
  | "hold"
  | "title-exit"
  | "done";

type Props = {
  config: EstateArrivalExperienceConfig;
  onPhaseChange?: (phase: EstateArrivalPhase) => void;
  onComplete: () => void;
};

/**
 * Universal Estate arrival — room name + motto, then fade away.
 */
export function EstateArrivalOverlay({ config, onPhaseChange, onComplete }: Props) {
  const [phase, setPhase] = useState<EstateArrivalPhase>("veil");

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setPhase("done");
      onComplete();
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(
      setTimeout(() => setPhase("reveal"), ESTATE_ARRIVAL_VEIL_MS),
    );

    timers.push(
      setTimeout(
        () => setPhase("hold"),
        ESTATE_ARRIVAL_VEIL_MS +
          Math.max(ESTATE_ARRIVAL_NAME_FADE_MS, ESTATE_ARRIVAL_MOTTO_FADE_MS),
      ),
    );

    timers.push(
      setTimeout(
        () => setPhase("title-exit"),
        ESTATE_ARRIVAL_VEIL_MS +
          Math.max(ESTATE_ARRIVAL_NAME_FADE_MS, ESTATE_ARRIVAL_MOTTO_FADE_MS) +
          ESTATE_ARRIVAL_HOLD_MS,
      ),
    );

    timers.push(
      setTimeout(
        () => {
          setPhase("done");
          onComplete();
        },
        ESTATE_ARRIVAL_VEIL_MS +
          Math.max(ESTATE_ARRIVAL_NAME_FADE_MS, ESTATE_ARRIVAL_MOTTO_FADE_MS) +
          ESTATE_ARRIVAL_HOLD_MS +
          ESTATE_ARRIVAL_TITLE_FADE_OUT_MS,
      ),
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (phase === "done") return null;

  const titleExiting = phase === "title-exit";

  return (
    <div
      className={`estate-arrival${phase === "veil" ? " estate-arrival--veil" : ""}${
        titleExiting ? " estate-arrival--title-exit" : ""
      }`}
      data-testid="estate-arrival-overlay"
      aria-live="polite"
      aria-label={`Arriving at ${config.title}`}
    >
      <div className="estate-arrival__veil" aria-hidden />
      <div
        className={`estate-arrival__plaque${
          phase === "reveal" || phase === "hold" || titleExiting
            ? " estate-arrival__plaque--visible"
            : ""
        }${titleExiting ? " estate-arrival__plaque--exit" : ""}`}
      >
        <div className="estate-arrival__rule" aria-hidden />
        <p className="estate-arrival__title">{config.title}</p>
        <p className="estate-arrival__motto">&ldquo;{config.motto}&rdquo;</p>
        <div className="estate-arrival__rule" aria-hidden />
      </div>
    </div>
  );
}
