"use client";

type Props = {
  onOpen: () => void;
  className?: string;
};

/** Single Estate-level research entry — not repeated per field. */
export function BusinessEstateResearchAction({ onOpen, className = "" }: Props) {
  return (
    <div
      className={`business-estate-research-action ${className}`.trim()}
      data-testid="business-estate-research-action"
    >
      <button
        type="button"
        className="business-estate-research-action__btn"
        onClick={onOpen}
        data-testid="research-this-with-shari"
      >
        Research This With Shari
      </button>
      <p className="business-estate-research-action__hint">
        One place for business research — audience, market, offers, messaging,
        and more.
      </p>
    </div>
  );
}
