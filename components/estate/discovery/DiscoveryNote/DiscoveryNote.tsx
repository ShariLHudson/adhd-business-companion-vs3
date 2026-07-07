"use client";

import type { DiscoveryNoteProps } from "./types";
import "./discovery-note.css";

const CATEGORY_LABEL: Record<string, string> = {
  "estate-discovery": "Discovery",
  "feature-discovery": "Feature Discovery",
  "estate-story": "Estate Story",
  "hidden-treasure": "Hidden Treasure",
  "personal-discovery": "Personal Discovery",
  "new-possibility": "New Possibility",
  "seasonal-discovery": "Seasonal Discovery",
};

export function DiscoveryNote({
  data,
  open,
  unlocking = false,
  onPrimaryAction,
  onSaveForLater,
  onClose,
}: DiscoveryNoteProps) {
  if (!open) return null;

  return (
    <div
      className="discovery-note-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`discovery-note-title-${data.discoveryId}`}
    >
      <article
        className={`discovery-note${unlocking ? " discovery-note--unlocking" : ""}`}
      >
        <p className="discovery-note__eyebrow">
          {CATEGORY_LABEL[data.category] ?? "Discovery"}
        </p>
        <h2
          className="discovery-note__title"
          id={`discovery-note-title-${data.discoveryId}`}
        >
          {data.title}
        </h2>
        {data.subtitle ? (
          <p className="discovery-note__subtitle">{data.subtitle}</p>
        ) : null}

        {data.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="discovery-note__image"
            src={data.image}
            alt=""
            aria-hidden
          />
        ) : null}

        <section className="discovery-note__section" aria-label="Discovery">
          <p className="discovery-note__body">{data.discoveryText}</p>
        </section>

        {data.whyItMatters ? (
          <section className="discovery-note__section" aria-label="Why this matters">
            <p className="discovery-note__section-label">Why this matters</p>
            <p className="discovery-note__body">{data.whyItMatters}</p>
          </section>
        ) : null}

        {data.foodForThought ? (
          <section className="discovery-note__section" aria-label="Food for thought">
            <p className="discovery-note__section-label">Food for thought</p>
            <p className="discovery-note__body">{data.foodForThought}</p>
          </section>
        ) : null}

        <div className="discovery-note__actions">
          {data.showPrimaryButton ? (
            <button
              type="button"
              className="discovery-note__button discovery-note__button--primary"
              onClick={onPrimaryAction}
            >
              {data.primaryButtonLabel}
            </button>
          ) : null}
          {data.showSaveForLater ? (
            <button
              type="button"
              className="discovery-note__button discovery-note__button--secondary"
              onClick={onSaveForLater}
            >
              Save for Later
            </button>
          ) : null}
          <button
            type="button"
            className="discovery-note__button discovery-note__button--ghost"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </article>
    </div>
  );
}
