"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  HOW_SPARK_ESTATE_WORKS_TOGETHER,
  type EstateOrientationPlaceId,
} from "@/lib/estateOrientation";
import { useDismissibleWindow } from "@/lib/windowDismiss";
import "@/app/companion/how-spark-estate-works-together.css";

type TourPhase = "overview" | "invite" | "walking" | "done";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Highlight this place when opened from a destination */
  focusPlaceId?: EstateOrientationPlaceId | null;
  /** Open on the Estate Tour invitation */
  startTour?: boolean;
};

/**
 * Frosted orientation experience — one mental model for the estate.
 * Optional Shari-led tour stays in-panel (permission-based; never forced).
 */
export function HowSparkEstateWorksTogetherPanel({
  open,
  onClose,
  focusPlaceId = null,
  startTour = false,
}: Props) {
  const content = HOW_SPARK_ESTATE_WORKS_TOGETHER;
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [openPlaceId, setOpenPlaceId] = useState<EstateOrientationPlaceId | null>(
    focusPlaceId,
  );
  const [tourPhase, setTourPhase] = useState<TourPhase>(
    startTour ? "invite" : "overview",
  );
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const { requestClose, onBackdropClick } = useDismissibleWindow({
    open,
    onClose,
  });

  useEffect(() => {
    if (!open) return;
    setOpenPlaceId(focusPlaceId);
    setTourPhase(startTour ? "invite" : "overview");
    setTourStepIndex(0);
    const t = window.setTimeout(() => closeRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open, focusPlaceId, startTour]);

  if (!open) return null;

  const tour = content.tour;
  const step = tour.steps[tourStepIndex];
  const isLastStep = tourStepIndex >= tour.steps.length - 1;

  function togglePlace(id: EstateOrientationPlaceId) {
    setOpenPlaceId((prev) => (prev === id ? null : id));
  }

  function beginTour() {
    setTourPhase("walking");
    setTourStepIndex(0);
  }

  function advanceTour() {
    if (isLastStep) {
      setTourPhase("done");
      return;
    }
    setTourStepIndex((i) => i + 1);
  }

  return (
    <div
      className="how-estate-works"
      data-testid="how-spark-estate-works-together"
      role="presentation"
      onClick={() => onBackdropClick()}
    >
      <div
        className="how-estate-works__surface"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="how-estate-works__header">
          <div>
            <h2 id={titleId} className="how-estate-works__title">
              {content.featureName}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="how-estate-works__close"
            onClick={requestClose}
            data-testid="how-spark-estate-works-together-close"
            aria-label="Close How Spark Estate Works Together"
          >
            Close
          </button>
        </header>

        <div className="how-estate-works__scroll">
          {tourPhase === "overview" || tourPhase === "invite" ? (
            <>
              <div className="how-estate-works__intro">
                {content.intro.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div
                className="how-estate-works__places"
                data-testid="how-estate-works-places"
              >
                {content.places.map((place) => {
                  const expanded = openPlaceId === place.id;
                  const focused = focusPlaceId === place.id;
                  const panelId = `how-estate-place-${place.id}`;
                  return (
                    <div
                      key={place.id}
                      className={`how-estate-works__section${
                        focused ? " how-estate-works__section--focus" : ""
                      }`}
                      data-testid={`how-estate-place-${place.id}`}
                      data-open={expanded ? "true" : "false"}
                    >
                      <button
                        type="button"
                        className="how-estate-works__section-toggle"
                        aria-expanded={expanded}
                        aria-controls={panelId}
                        data-testid={`how-estate-place-toggle-${place.id}`}
                        onClick={() => togglePlace(place.id)}
                      >
                        <span>
                          <span className="how-estate-works__section-title">
                            {place.name}
                          </span>
                          <span className="how-estate-works__section-summary">
                            {place.summary}
                          </span>
                        </span>
                        <span
                          className="how-estate-works__chevron"
                          aria-hidden="true"
                        >
                          {expanded ? "−" : "+"}
                        </span>
                      </button>
                      {expanded ? (
                        <div
                          id={panelId}
                          className="how-estate-works__place-body"
                          data-testid={`how-estate-place-body-${place.id}`}
                        >
                          <p className="how-estate-works__label">What is this?</p>
                          <p>{place.whatIsThis}</p>
                          <p className="how-estate-works__label">
                            Why would I use it?
                          </p>
                          <p>{place.whyWouldIUseIt}</p>
                          <p className="how-estate-works__label">
                            How does it connect?
                          </p>
                          <p>{place.howItConnects}</p>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="how-estate-works__close-copy">
                {content.close.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </>
          ) : null}

          {tourPhase === "invite" ? (
            <div
              className="how-estate-works__tour"
              data-testid="how-estate-tour-invite"
            >
              <h3 className="how-estate-works__tour-title">{tour.title}</h3>
              <p className="how-estate-works__tour-line">{tour.invitation}</p>
              <div className="how-estate-works__tour-actions">
                <button
                  type="button"
                  className="how-estate-works__primary"
                  data-testid="how-estate-tour-walk"
                  onClick={beginTour}
                >
                  {tour.walkWithMeLabel}
                </button>
                <button
                  type="button"
                  className="how-estate-works__secondary"
                  data-testid="how-estate-tour-stay"
                  onClick={() => setTourPhase("overview")}
                >
                  {tour.stayLabel}
                </button>
                <button
                  type="button"
                  className="how-estate-works__secondary"
                  data-testid="how-estate-tour-not-now"
                  onClick={() => setTourPhase("overview")}
                >
                  {tour.notNowLabel}
                </button>
              </div>
            </div>
          ) : null}

          {tourPhase === "walking" && step ? (
            <div
              className="how-estate-works__tour"
              data-testid="how-estate-tour-walking"
              data-tour-step={step.id}
            >
              <p className="how-estate-works__tour-step-name">
                {step.placeName}
              </p>
              <p className="how-estate-works__tour-line">{step.shariLine}</p>
              <div className="how-estate-works__tour-actions">
                <button
                  type="button"
                  className="how-estate-works__primary"
                  data-testid="how-estate-tour-continue"
                  onClick={advanceTour}
                >
                  {isLastStep ? "Finish the walk" : "Continue"}
                </button>
                <button
                  type="button"
                  className="how-estate-works__secondary"
                  data-testid="how-estate-tour-end-early"
                  onClick={() => setTourPhase("overview")}
                >
                  {tour.stayLabel}
                </button>
              </div>
            </div>
          ) : null}

          {tourPhase === "done" ? (
            <div
              className="how-estate-works__tour"
              data-testid="how-estate-tour-done"
            >
              <h3 className="how-estate-works__tour-title">{tour.title}</h3>
              <p className="how-estate-works__tour-line">{tour.closing}</p>
              <div className="how-estate-works__tour-actions">
                <button
                  type="button"
                  className="how-estate-works__primary"
                  data-testid="how-estate-tour-back-overview"
                  onClick={() => setTourPhase("overview")}
                >
                  See how the rooms fit together
                </button>
                <button
                  type="button"
                  className="how-estate-works__secondary"
                  onClick={requestClose}
                >
                  Close
                </button>
              </div>
            </div>
          ) : null}

          {tourPhase === "overview" ? (
            <div
              className="how-estate-works__tour"
              data-testid="how-estate-tour-offer"
            >
              <h3 className="how-estate-works__tour-title">{tour.title}</h3>
              <p className="how-estate-works__tour-line">{tour.invitation}</p>
              <div className="how-estate-works__tour-actions">
                <button
                  type="button"
                  className="how-estate-works__primary"
                  data-testid="how-estate-tour-offer-walk"
                  onClick={beginTour}
                >
                  {tour.walkWithMeLabel}
                </button>
                <button
                  type="button"
                  className="how-estate-works__secondary"
                  data-testid="how-estate-tour-offer-not-now"
                  onClick={requestClose}
                >
                  {tour.notNowLabel}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <footer className="how-estate-works__footer">
          <button
            type="button"
            className="how-estate-works__secondary"
            onClick={requestClose}
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
