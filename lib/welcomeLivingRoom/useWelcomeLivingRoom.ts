"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  WELCOME_TYPING_FLICKER_DELAY_MS,
  WELCOME_TYPING_FLICKER_DURATION_MS,
  welcomeOpeningSchedule,
  type WelcomeLivingPhase,
} from "./openingSequence";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useWelcomeLivingRoom() {
  const [phase, setPhase] = useState<WelcomeLivingPhase>("still");
  const [candlePulse, setCandlePulse] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const typingTimerRef = useRef<number | null>(null);
  const flickerTimerRef = useRef<number | null>(null);
  const typingFlickeredRef = useRef(false);

  useEffect(() => {
    const schedule = welcomeOpeningSchedule(prefersReducedMotion());
    const timers = schedule.map(({ phase: nextPhase, at }) =>
      window.setTimeout(() => setPhase(nextPhase), at),
    );
    if (schedule.some((item) => item.phase === "candle")) {
      timers.push(
        window.setTimeout(() => {
          setCandlePulse(true);
          window.setTimeout(() => setCandlePulse(false), 680);
        }, 300),
      );
    }
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
      if (flickerTimerRef.current) window.clearTimeout(flickerTimerRef.current);
    };
  }, []);

  const noteTyping = useCallback(() => {
    if (typingFlickeredRef.current) return;
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      typingFlickeredRef.current = true;
      setCandlePulse(true);
      if (flickerTimerRef.current) window.clearTimeout(flickerTimerRef.current);
      flickerTimerRef.current = window.setTimeout(
        () => setCandlePulse(false),
        WELCOME_TYPING_FLICKER_DURATION_MS,
      );
    }, WELCOME_TYPING_FLICKER_DELAY_MS);
  }, []);

  const onInputFocus = useCallback(() => {
    setInputFocused(true);
  }, []);

  const onInputBlur = useCallback(() => {
    setInputFocused(false);
  }, []);

  return {
    phase,
    candlePulse,
    inputFocused,
    noteTyping,
    onInputFocus,
    onInputBlur,
  };
}
