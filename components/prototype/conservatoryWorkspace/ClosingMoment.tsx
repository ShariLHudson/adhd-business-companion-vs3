"use client";

import { CLOSING_LINES } from "./mockData";

type ClosingMomentProps = {
  visible: boolean;
  onStay: () => void;
};

export function ClosingMoment({ visible, onStay }: ClosingMomentProps) {
  if (!visible) return null;

  return (
    <div className="cw-closing" role="dialog" aria-label="Session complete">
      <div className="cw-closing__copy">
        {CLOSING_LINES.map((line) => (
          <p key={line} className="cw-closing__line">
            {line}
          </p>
        ))}
        <p className="cw-closing__aside">
          You&apos;re still in the Conservatory. Take a breath before you go.
        </p>
        <button type="button" className="cw-closing__stay" onClick={onStay}>
          Stay a moment
        </button>
      </div>
    </div>
  );
}
