"use client";

import { useEffect, useState } from "react";
import { GROWTH_STORY_WELCOME } from "@/lib/growth/growthStoryHub";

type WelcomeLine = "seat" | "prompt";
type WelcomePhase = "in" | "cross" | "out" | "gone";

/** Quiet companion welcome — seat, then prompt, then away. No popup. */
export function GrowthStoryWelcome() {
  const [line, setLine] = useState<WelcomeLine>("seat");
  const [phase, setPhase] = useState<WelcomePhase>("in");

  useEffect(() => {
    const cross = window.setTimeout(() => setPhase("cross"), 2600);
    const showPrompt = window.setTimeout(() => {
      setLine("prompt");
      setPhase("in");
    }, 3100);
    const fadeOut = window.setTimeout(() => setPhase("out"), 6000);
    const gone = window.setTimeout(() => setPhase("gone"), 6550);
    return () => {
      window.clearTimeout(cross);
      window.clearTimeout(showPrompt);
      window.clearTimeout(fadeOut);
      window.clearTimeout(gone);
    };
  }, []);

  if (phase === "gone") return null;

  const text =
    line === "seat" ? GROWTH_STORY_WELCOME.line1 : GROWTH_STORY_WELCOME.line2;

  return (
    <p
      className={`growth-story-welcome growth-story-welcome--${phase}`}
      role="status"
      aria-live="polite"
      data-testid="growth-story-welcome"
    >
      {text}
    </p>
  );
}
