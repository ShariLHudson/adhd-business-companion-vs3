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

const FADE_MS = 900;
const FADE_STEP = 0.02;

/**
 * Optional gazebo layers — only after the member turns sound on.
 * Never starts from ambient page clicks while muted.
 */
export function JournalGazeboAmbience({ active, muted }: Props) {
  const refs = useRef<Record<string, HTMLAudioElement | null>>({});
  const fadeTimersRef = useRef<Record<string, number>>({});

  const clearFade = (key: string) => {
    const id = fadeTimersRef.current[key];
    if (id != null) {
      window.clearInterval(id);
      delete fadeTimersRef.current[key];
    }
  };

  const clearAllFades = () => {
    for (const key of Object.keys(fadeTimersRef.current)) clearFade(key);
  };

  const fadeTo = (key: string, el: HTMLAudioElement, target: number) => {
    clearFade(key);
    const id = window.setInterval(() => {
      const delta = target > el.volume ? FADE_STEP : -FADE_STEP;
      const next = Math.max(0, Math.min(1, el.volume + delta));
      el.volume = next;
      if (Math.abs(next - target) < FADE_STEP) {
        el.volume = target;
        window.clearInterval(id);
        delete fadeTimersRef.current[key];
        if (target <= 0) {
          el.pause();
        }
      }
    }, FADE_MS / 50);
    fadeTimersRef.current[key] = id;
  };

  const stopAll = (immediate = false) => {
    clearAllFades();
    for (const el of Object.values(refs.current)) {
      if (!el) continue;
      if (immediate) {
        el.pause();
        el.volume = 0;
      } else {
        el.volume = 0;
        el.pause();
      }
    }
  };

  const ensureLayers = () => {
    const layers = Object.entries(JOURNAL_GAZEBO_AMBIENCE) as [
      keyof typeof JOURNAL_GAZEBO_AMBIENCE,
      string,
    ][];
    for (const [key, src] of layers) {
      if (refs.current[key]) continue;
      const audio = new Audio(src);
      audio.loop = true;
      audio.volume = 0;
      audio.preload = "none";
      refs.current[key] = audio;
    }
  };

  const startLayers = () => {
    ensureLayers();
    let delay = 0;
    for (const [key, el] of Object.entries(refs.current)) {
      if (!el) continue;
      const layer = key as keyof typeof JOURNAL_GAZEBO_AMBIENCE;
      window.setTimeout(() => {
        void el.play()
          .then(() => fadeTo(key, el, LAYER_VOLUME[layer]))
          .catch(() => undefined);
      }, delay);
      delay += 500;
    }
  };

  useEffect(() => {
    if (!active || muted) {
      stopAll(true);
      return;
    }
    startLayers();
    return () => {
      stopAll(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- start/stop only on active + mute
  }, [active, muted]);

  useEffect(() => {
    return () => {
      stopAll(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount cleanup
  }, []);

  return null;
}
