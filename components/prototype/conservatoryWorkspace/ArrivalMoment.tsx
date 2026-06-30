"use client";

import { ARRIVAL_LINES } from "./mockData";

type ArrivalMomentProps = {
  visible: boolean;
  onDismiss: () => void;
};

export function ArrivalMoment({ visible, onDismiss }: ArrivalMomentProps) {
  if (!visible) return null;

  return (
    <div className="cw-arrival" role="dialog" aria-label="Arrival greeting">
      <div className="cw-arrival__veil" aria-hidden onClick={onDismiss} />
      <div className="cw-arrival__copy">
        {ARRIVAL_LINES.map((line, index) => (
          <p
            key={line}
            className="cw-arrival__line"
            style={{ animationDelay: `${index * 0.35}s` }}
          >
            {line}
          </p>
        ))}
        <button type="button" className="cw-arrival__continue" onClick={onDismiss}>
          Continue
        </button>
      </div>
    </div>
  );
}
