"use client";

import { PREPARED_LINE } from "./mockData";
import type { UniversalWorkStage } from "./types";

type QuietArrivalProps = {
  stage: UniversalWorkStage;
};

export function QuietArrival({ stage }: QuietArrivalProps) {
  if (stage !== "arriving") return null;

  return (
    <p className="uw-arrival" role="status">
      {PREPARED_LINE}
    </p>
  );
}
