"use client";

import { RESOURCES } from "./mockData";

type MaterialsOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export function MaterialsOverlay({ open, onClose }: MaterialsOverlayProps) {
  if (!open) return null;

  return (
    <div className="uw-materials" role="dialog" aria-label="Materials">
      <button
        type="button"
        className="uw-materials__veil"
        aria-label="Close materials"
        onClick={onClose}
      />
      <div className="uw-materials__sheet">
        <header className="uw-materials__header">
          <h2>What you need close by</h2>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </header>
        <section>
          <h3>Business Brain</h3>
          <ul>
            {RESOURCES.businessBrain.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h3>Brand Voice</h3>
          <p>{RESOURCES.brandVoice}</p>
        </section>
        <section>
          <h3>Client Avatar</h3>
          <p>{RESOURCES.clientAvatar}</p>
        </section>
        <section>
          <h3>Business Assets</h3>
          <ul>
            {RESOURCES.assets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="uw-materials__spark">
          <h3>Spark Card</h3>
          <p>{RESOURCES.sparkCard}</p>
        </section>
      </div>
    </div>
  );
}
