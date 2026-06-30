"use client";

import { STILLNESS_LINE } from "./mockData";

type StillnessMomentProps = {
  visible: boolean;
};

export function StillnessMoment({ visible }: StillnessMomentProps) {
  if (!visible) return null;

  return (
    <p className="uw-stillness" role="status">
      {STILLNESS_LINE}
    </p>
  );
}
