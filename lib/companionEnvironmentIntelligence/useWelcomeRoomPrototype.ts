"use client";

import { useCallback, useEffect, useState } from "react";
import {
  WELCOME_ROOM_PROTOTYPE_STORAGE_KEY,
  type WelcomeRoomPrototypeOverrides,
} from "@/lib/companionEnvironmentIntelligence";

const DEFAULT_OVERRIDES: WelcomeRoomPrototypeOverrides = {
  season: "auto",
  weather: "auto",
  discovery: "auto",
  timeOfDay: "auto",
};

function readStoredOverrides(): WelcomeRoomPrototypeOverrides {
  if (typeof window === "undefined") return DEFAULT_OVERRIDES;
  try {
    const raw = sessionStorage.getItem(WELCOME_ROOM_PROTOTYPE_STORAGE_KEY);
    if (!raw) return DEFAULT_OVERRIDES;
    return { ...DEFAULT_OVERRIDES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_OVERRIDES;
  }
}

export function useWelcomeRoomPrototype() {
  const [overrides, setOverridesState] =
    useState<WelcomeRoomPrototypeOverrides>(DEFAULT_OVERRIDES);

  useEffect(() => {
    setOverridesState(readStoredOverrides());
  }, []);

  const setOverrides = useCallback((next: WelcomeRoomPrototypeOverrides) => {
    setOverridesState(next);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        WELCOME_ROOM_PROTOTYPE_STORAGE_KEY,
        JSON.stringify(next),
      );
    }
  }, []);

  const resetOverrides = useCallback(() => {
    setOverrides(DEFAULT_OVERRIDES);
  }, [setOverrides]);

  return { overrides, setOverrides, resetOverrides };
}
