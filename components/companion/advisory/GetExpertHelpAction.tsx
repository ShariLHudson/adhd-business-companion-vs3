"use client";

import {
  ASSISTANCE_ACTION_LABEL,
} from "@/lib/profile/advisoryHelpTypes";

type Props = {
  onOpen: () => void;
  className?: string;
  label?: string;
};

/** One compact assistance entry — Chamber and Board are chosen inside, not here. */
export function GetExpertHelpAction({
  onOpen,
  className = "",
  label = ASSISTANCE_ACTION_LABEL,
}: Props) {
  return (
    <div
      className={`get-expert-help-action ${className}`.trim()}
      data-testid="get-expert-help-action"
    >
      <button
        type="button"
        className="get-expert-help-action__btn"
        onClick={onOpen}
        data-testid="need-another-perspective"
        aria-label={label}
      >
        {label}
      </button>
      <p className="get-expert-help-action__hint">
        Chamber specialists for focused expertise · Board for major decisions —
        two different places.
      </p>
    </div>
  );
}
