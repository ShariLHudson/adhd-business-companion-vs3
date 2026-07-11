"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { BreathePanel } from "@/components/companion/BreathePanel";
import {
  isBreatheDestinationActive,
  type BreatheDestinationState,
} from "@/lib/breatheDestination";
import {
  breatheEnvironmentStyleVars,
  resolveBreatheEnvironment,
} from "@/lib/breatheDestination/breatheEnvironments";

type Props = {
  destination: BreatheDestinationState;
  resumeActive: boolean;
  onDone: () => void;
  onContinueChat: () => void;
  onReturnPrevious: () => void;
  onJournalThis: () => void;
};

/**
 * Breathe full-screen destination — portaled above Welcome Home and estate chrome.
 * Welcome Home renders via createPortal(document.body); breathe must match that layer.
 */
export function BreatheDestinationHost({
  destination,
  resumeActive,
  onDone,
  onContinueChat,
  onReturnPrevious,
  onJournalThis,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const root = document.documentElement;
    if (isBreatheDestinationActive(destination)) {
      root.setAttribute("data-breathe-destination", "");
      if (destination.phase) {
        root.setAttribute("data-breathe-destination-phase", destination.phase);
      }
    } else {
      root.removeAttribute("data-breathe-destination");
      root.removeAttribute("data-breathe-destination-phase");
    }
  }, [destination]);

  useEffect(() => {
    const root = document.documentElement;
    if (resumeActive) {
      root.setAttribute("data-breathe-resume", "");
    } else {
      root.removeAttribute("data-breathe-resume");
    }
  }, [resumeActive]);

  if (!mounted || !destination.phase) return null;

  const environment = resolveBreatheEnvironment(destination.environmentId);

  return createPortal(
    <div
      className={`breathe-destination-scene breathe-destination-scene--${destination.phase}`}
      data-testid="breathe-destination-scene"
      data-breathe-environment={environment.id}
      role="dialog"
      aria-label="Breathe"
      aria-modal="true"
      style={breatheEnvironmentStyleVars(environment) as CSSProperties}
    >
      <div className="breathe-destination-scene__backdrop" aria-hidden />
      <div className="breathe-destination-scene__veil" aria-hidden />
      <div className="breathe-destination-scene__content">
        <BreathePanel
          key={destination.key}
          initialPatternId={destination.patternId}
          initialMinutes={destination.minutes}
          environmentLabel={environment.label}
          autoStart={Boolean(destination.patternId)}
          onDone={onDone}
          onContinueChat={onContinueChat}
          onReturnPrevious={onReturnPrevious}
          onJournalThis={onJournalThis}
        />
      </div>
    </div>,
    document.body,
  );
}
