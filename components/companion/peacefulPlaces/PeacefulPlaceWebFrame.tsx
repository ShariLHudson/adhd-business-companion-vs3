"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

type Props = {
  title: string;
  url: string;
  onClose: () => void;
};

/** Immersive frame for saved peaceful place websites. */
export function PeacefulPlaceWebFrame({ title, url, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="peaceful-place-web-frame" role="presentation">
      <button
        type="button"
        className="peaceful-place-web-frame__backdrop"
        aria-label="Close place"
        onClick={onClose}
      />
      <div className="peaceful-place-web-frame__shell" role="dialog" aria-modal="true" aria-label={title}>
        <header className="peaceful-place-web-frame__bar">
          <p className="peaceful-place-web-frame__title">{title}</p>
          <button type="button" className="peaceful-place-web-frame__leave" onClick={onClose}>
            Leave this place
          </button>
        </header>
        <iframe
          title={title}
          src={url}
          className="peaceful-place-web-frame__iframe"
          allow="autoplay; fullscreen; picture-in-picture"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>,
    document.body,
  );
}
