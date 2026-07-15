"use client";

import {
  IDENTITY_OFFICE_BENEFIT,
  businessBasicsProgress,
  isBusinessBasicsComplete,
} from "@/lib/profile/businessEstateRedesign";
import { getBusinessAreaPresentation } from "@/lib/profile/executiveOfficePresentation";

type Props = {
  onStartBasics: () => void;
  onChooseSection: () => void;
  onHowThisHelps: () => void;
  onBack: () => void;
  showHowThisHelps: boolean;
};

export function IdentityOfficeEntrance({
  onStartBasics,
  onChooseSection,
  onHowThisHelps,
  onBack,
  showHowThisHelps,
}: Props) {
  const area = getBusinessAreaPresentation("identity");
  const progress = businessBasicsProgress();
  const complete = isBusinessBasicsComplete();
  const hasProgress = progress.answered > 0 && !complete;

  const primaryLabel = complete
    ? "Review Business Basics"
    : hasProgress
      ? "Continue Business Basics"
      : "Start Business Basics";

  return (
    <div
      className="be-identity-entrance"
      data-testid="be-identity-entrance"
      style={
        {
          "--be-identity-bg": `url(${area.coverImageUrl})`,
        } as React.CSSProperties
      }
    >
      <div className="be-identity-entrance__panel">
        <button
          type="button"
          className="be-btn be-btn--ghost be-identity-entrance__back"
          onClick={onBack}
          data-testid="be-identity-back-estate"
        >
          Back to My Business Estate
        </button>

        <h1 className="be-identity-entrance__title">Identity Office</h1>
        <p className="be-identity-entrance__lead">
          This room helps Shari understand what your business is, why it
          exists, and what it stands for.
        </p>

        <section
          className="be-identity-entrance__recommended"
          data-testid="be-identity-recommended"
        >
          <p className="be-identity-entrance__kicker">Recommended Today</p>
          <h2 className="be-identity-entrance__rec-title">Business Basics</h2>
          <p className="be-identity-entrance__rec-sub">
            Tell Shari what your business is and where it stands today.
          </p>
          <p className="be-identity-entrance__meta">
            {hasProgress
              ? `You completed ${progress.answered} of ${progress.total} questions. Your answers are saved.`
              : "3 short questions · About 3 minutes"}
          </p>
          <button
            type="button"
            className="be-btn be-btn--primary"
            onClick={onStartBasics}
            data-testid="be-identity-start-basics"
          >
            {primaryLabel}
          </button>
        </section>

        <div className="be-identity-entrance__secondary">
          <button
            type="button"
            className="be-btn be-btn--secondary"
            onClick={onChooseSection}
            data-testid="be-identity-choose-section"
          >
            Choose Another Section
          </button>
          <button
            type="button"
            className="be-btn be-btn--ghost"
            onClick={onHowThisHelps}
            data-testid="be-identity-how-helps"
            aria-expanded={showHowThisHelps}
          >
            How This Room Helps
          </button>
        </div>

        {showHowThisHelps ? (
          <p
            className="be-identity-entrance__benefit"
            data-testid="be-identity-benefit"
          >
            {IDENTITY_OFFICE_BENEFIT}
          </p>
        ) : null}
      </div>
    </div>
  );
}
