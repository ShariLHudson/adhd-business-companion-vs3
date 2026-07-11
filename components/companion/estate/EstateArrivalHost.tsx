"use client";

import { useCallback, useEffect, useState } from "react";
import { EstateArrivalOverlay } from "@/components/companion/estate/EstateArrivalOverlay";
import { shouldSuppressEstateTitlePlaque } from "@/lib/estate/estateChromePolicy";
import {
  resolveEstateArrivalExperience,
  type EstateArrivalExperienceConfig,
} from "@/lib/estate/estateArrivalExperience";
import {
  dispatchEstateArrivalComplete,
  subscribeEstateArrivalStart,
  type EstateArrivalStartDetail,
} from "@/lib/estate/estateArrivalSession";

type Props = {
  /** Shari speaks after arrival — never during the animation. */
  onShariGreeting?: (message: string, roomId: string) => void;
};

/**
 * Global Estate Arrival Experience host — one overlay for every room transition.
 */
export function EstateArrivalHost({ onShariGreeting }: Props) {
  const [active, setActive] = useState<{
    config: EstateArrivalExperienceConfig;
    shariGreeting?: string;
  } | null>(null);

  const beginArrival = useCallback((detail: EstateArrivalStartDetail) => {
    if (shouldSuppressEstateTitlePlaque(detail.roomId)) {
      dispatchEstateArrivalComplete(detail.roomId);
      const greeting = detail.shariGreeting;
      if (greeting) onShariGreeting?.(greeting, detail.roomId);
      return;
    }

    const config = resolveEstateArrivalExperience(detail.roomId);
    if (!config) {
      const greeting = detail.shariGreeting;
      if (greeting) onShariGreeting?.(greeting, detail.roomId);
      return;
    }

    setActive({
      config,
      shariGreeting: detail.shariGreeting ?? config.shariGreeting,
    });
  }, [onShariGreeting]);

  useEffect(() => subscribeEstateArrivalStart(beginArrival), [beginArrival]);

  const handleComplete = useCallback(() => {
    if (!active) return;
    const { config, shariGreeting } = active;
    setActive(null);
    dispatchEstateArrivalComplete(config.roomId);
    if (shariGreeting) {
      onShariGreeting?.(shariGreeting, config.roomId);
    }
  }, [active, onShariGreeting]);

  if (!active) return null;

  return (
    <EstateArrivalOverlay config={active.config} onComplete={handleComplete} />
  );
}
