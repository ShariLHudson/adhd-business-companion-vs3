"use client";

import { useState } from "react";
import {
  buildBusinessPulse,
  type BusinessPulseModel,
} from "@/lib/progressRecognition";

type Props = {
  model?: BusinessPulseModel;
  onOpenGarden?: () => void;
  onOpenHall?: () => void;
};

/**
 * 101 — Calm Business Pulse with progressive disclosure (not a dashboard).
 */
export function BusinessPulsePanel({
  model: modelProp,
  onOpenGarden,
  onOpenHall,
}: Props) {
  const model = modelProp ?? buildBusinessPulse();
  const [open, setOpen] = useState<
    null | "moved" | "connections" | "review"
  >(null);

  return (
    <section
      className="progress-pulse"
      data-testid="business-pulse-panel"
      aria-label="Business Pulse"
    >
      <p className="progress-pulse-primary" data-testid="pulse-primary">
        {model.primaryStatement}
      </p>
      <ul className="progress-pulse-changes" data-testid="pulse-changes">
        {model.meaningfulChanges.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className="progress-pulse-next" data-testid="pulse-next">
        {model.nextHelpfulStep}
      </p>

      <div className="progress-pulse-disclosure" role="group" aria-label="More detail">
        <button
          type="button"
          className="progress-pulse-btn"
          data-testid="pulse-see-moved"
          aria-expanded={open === "moved"}
          onClick={() => setOpen(open === "moved" ? null : "moved")}
        >
          See what moved forward
        </button>
        <button
          type="button"
          className="progress-pulse-btn"
          data-testid="pulse-see-connections"
          aria-expanded={open === "connections"}
          onClick={() => setOpen(open === "connections" ? null : "connections")}
        >
          See connections
        </button>
        <button
          type="button"
          className="progress-pulse-btn"
          data-testid="pulse-review"
          aria-expanded={open === "review"}
          onClick={() => setOpen(open === "review" ? null : "review")}
        >
          Review wins and accomplishments
        </button>
      </div>

      {open === "moved" ? (
        <ul className="progress-pulse-detail" data-testid="pulse-detail-moved">
          {model.disclosure.seeWhatMovedForward.length === 0 ? (
            <li>Nothing new to show yet.</li>
          ) : (
            model.disclosure.seeWhatMovedForward.map((line) => (
              <li key={line}>{line}</li>
            ))
          )}
        </ul>
      ) : null}
      {open === "connections" ? (
        <ul
          className="progress-pulse-detail"
          data-testid="pulse-detail-connections"
        >
          {model.disclosure.seeConnections.length === 0 ? (
            <li>No Work connections yet.</li>
          ) : (
            model.disclosure.seeConnections.map((line) => (
              <li key={line}>{line}</li>
            ))
          )}
        </ul>
      ) : null}
      {open === "review" ? (
        <div data-testid="pulse-detail-review">
          <ul className="progress-pulse-detail">
            {model.disclosure.reviewWinsAndAccomplishments.length === 0 ? (
              <li>No recent recognition yet.</li>
            ) : (
              model.disclosure.reviewWinsAndAccomplishments.map((line) => (
                <li key={line}>{line}</li>
              ))
            )}
          </ul>
          <div className="progress-pulse-actions">
            {onOpenGarden ? (
              <button
                type="button"
                className="progress-pulse-btn progress-pulse-btn-primary"
                data-testid="pulse-open-garden"
                onClick={onOpenGarden}
              >
                Celebration Garden
              </button>
            ) : null}
            {onOpenHall ? (
              <button
                type="button"
                className="progress-pulse-btn progress-pulse-btn-primary"
                data-testid="pulse-open-hall"
                onClick={onOpenHall}
              >
                Hall of Accomplishments
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
