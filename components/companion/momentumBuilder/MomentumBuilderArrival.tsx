"use client";

import { useEffect, useState } from "react";
import { resolveMomentumBuilderArrival } from "@/lib/momentumBuilderRoom/coachingEntry";

type Props = {
  active: boolean;
};

/**
 * Staged arrival — pauses between lines; never defines the room.
 */
export function MomentumBuilderArrival({ active }: Props) {
  const arrival = resolveMomentumBuilderArrival();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!active) {
      setStage(0);
      return;
    }
    setStage(1);
    const t2 = window.setTimeout(() => setStage(2), 900);
    const t3 = window.setTimeout(() => setStage(3), 1900);
    return () => {
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      className="momentum-builder-room__arrival"
      data-testid="momentum-builder-arrival"
    >
      <p
        className={`momentum-builder-room__arrival-line${
          stage >= 1 ? " momentum-builder-room__arrival-line--visible" : ""
        }`}
      >
        {arrival.glad}
      </p>
      <p
        className={`momentum-builder-room__arrival-line${
          stage >= 2 ? " momentum-builder-room__arrival-line--visible" : ""
        }`}
      >
        {arrival.lead}
      </p>
      <p
        className={`momentum-builder-room__arrival-line momentum-builder-room__arrival-line--question${
          stage >= 3 ? " momentum-builder-room__arrival-line--visible" : ""
        }`}
      >
        {arrival.question}
      </p>
    </div>
  );
}
