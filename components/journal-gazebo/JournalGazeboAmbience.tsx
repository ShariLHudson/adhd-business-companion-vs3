"use client";

import { useEffect, useRef } from "react";
import { JOURNAL_GAZEBO_AMBIENCE } from "@/lib/journalGazebo/ambience";

type Props = {
  active: boolean;
  muted: boolean;
};

const LAYER_VOLUME: Record<keyof typeof JOURNAL_GAZEBO_AMBIENCE, number> = {
  water: 0.2,
  birds: 0.11,
  breeze: 0.09,
  piano: 0.08,
};

const FADE_MS = 1400;
const FADE_STEP = 0.012;

/**
 * Natural gazebo soundscape — waterfall, birds, breeze, soft piano.
 * No synthesis. Fades gently; respects mute preference.
 */
export function JournalGazeboAmbience({ active, muted }: Props) {
  const refs = useRef<Record<string, HTMLAudioElement | null>>({});
  const fadeTimersRef = useRef<number[]>([]);
  const startedRef = useRef(false);
  const targetMutedRef = useRef(muted);

  targetMutedRef.current = muted;

  const clearFades = () => {
    for (const id of fadeTimersRef.current) window.clearInterval(id);
    fadeTimersRef.current = [];
  };

  const fadeTo = (el: HTMLAudioElement, target: number) => {
    clearFades();
    const id = window.setInterval(() => {
      const delta = target > el.volume ? FADE_STEP : -FADE_STEP;
      const next = Math.max(0, Math.min(target, el.volume + delta));
      el.volume = next;
      if (Math.abs(next - target) < FADE_STEP) {
        el.volume = target;
        window.clearInterval(id);
      }
    }, FADE_MS / 80);
    fadeTimersRef.current.push(id);
  };

  const applyMute = (nextMuted: boolean) => {
    for (const [key, el] of Object.entries(refs.current)) {
      if (!el) continue;
      const layer = key as keyof typeof JOURNAL_GAZEBO_AMBIENCE;
      fadeTo(el, nextMuted ? 0 : LAYER_VOLUME[layer]);
    }
  };

  useEffect(() => {
    applyMute(muted);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fade all layers on mute toggle
  }, [muted]);

  useEffect(() => {
    if (!active) {
      clearFades();
      for (const el of Object.values(refs.current)) {
        if (el) {
          el.pause();
          el.volume = 0;
        }
      }
      startedRef.current = false;
      return;
    }

    const layers = Object.entries(JOURNAL_GAZEBO_AMBIENCE) as [
      keyof typeof JOURNAL_GAZEBO_AMBIENCE,
      string,
    ][];

    for (const [key, src] of layers) {
      if (refs.current[key]) continue;
      const audio = new Audio(src);
      audio.loop = true;
      audio.volume = 0;
      audio.preload = "auto";
      refs.current[key] = audio;
    }

    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      let delay = 0;
      for (const [key, el] of Object.entries(refs.current)) {
        if (!el) continue;
        const layer = key as keyof typeof JOURNAL_GAZEBO_AMBIENCE;
        window.setTimeout(() => {
          void el.play().then(() => {
            if (!targetMutedRef.current) fadeTo(el, LAYER_VOLUME[layer]);
          }).catch(() => undefined);
        }, delay);
        delay += 600;
      }
    };

    start();
    window.addEventListener("pointerdown", start, { once: true });

    return () => {
      window.removeEventListener("pointerdown", start);
      clearFades();
    };
  }, [active]);

  useEffect(() => {
    return () => {
      clearFades();
      for (const el of Object.values(refs.current)) el?.pause();
    };
  }, []);

  return null;
}
