"use client";

import { FOLIO_SECTIONS } from "./mockData";
import type { DeskObjectId } from "./types";

type ResourcesFolioProps = {
  openObject: DeskObjectId;
  onClose: () => void;
};

export function ResourcesFolio({ openObject, onClose }: ResourcesFolioProps) {
  if (!openObject) return null;

  const title =
    openObject === "folio"
      ? "Leather Folio"
      : openObject === "journal"
        ? "Business Journal"
        : "Blueprint Folder";

  return (
    <div className="cw-folio" role="dialog" aria-label={title}>
      <div className="cw-folio__veil" aria-hidden onClick={onClose} />
      <div className="cw-folio__panel">
        <header className="cw-folio__header">
          <h2>{title}</h2>
          <button type="button" className="cw-folio__close" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="cw-folio__sections">
          <section>
            <h3>{FOLIO_SECTIONS.businessBrain.title}</h3>
            <ul>
              {FOLIO_SECTIONS.businessBrain.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3>{FOLIO_SECTIONS.clientAvatar.title}</h3>
            <ul>
              {FOLIO_SECTIONS.clientAvatar.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3>{FOLIO_SECTIONS.brandVoice.title}</h3>
            <ul>
              {FOLIO_SECTIONS.brandVoice.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3>{FOLIO_SECTIONS.assets.title}</h3>
            <ul>
              {FOLIO_SECTIONS.assets.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section className="cw-folio__spark">
            <h3>{FOLIO_SECTIONS.sparkCard.title}</h3>
            <p>{FOLIO_SECTIONS.sparkCard.body}</p>
          </section>
          <section>
            <h3>{FOLIO_SECTIONS.decision.title}</h3>
            <p>{FOLIO_SECTIONS.decision.body}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
